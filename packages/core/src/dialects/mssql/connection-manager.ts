import type { Connection as TediousConnection, ConnectionConfiguration as TediousConnectionConfig } from 'tedious';
import {
  AccessDeniedError,
  ConnectionError,
  ConnectionRefusedError,
  HostNotFoundError,
  HostNotReachableError,
  InvalidConnectionError,
} from '../../errors/index.js';
import type { ConnectionOptions, Sequelize } from '../../sequelize.js';
import { assertCaughtError, isErrorWithStringCode, isPlainObject } from '../../utils/check.js';
import { logger } from '../../utils/logger';
import type { Connection } from '../abstract/connection-manager';
import { AbstractConnectionManager } from '../abstract/connection-manager';
import { AsyncQueue } from './async-queue';
import type { MssqlDialect } from './index.js';

const debug = logger.debugContext('connection:mssql');
const debugTedious = logger.debugContext('connection:mssql:tedious');

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type Lib = typeof import('tedious');

interface TediousConnectionState {
  name: string;
}

/**
 * Sequelize MSSQL connection wrapper (composition-based)
 */
export interface MsSqlConnection extends Connection {
  queue: AsyncQueue;
  lib: Lib;

  closed: boolean;
  loggedIn: boolean;

  state: TediousConnectionState;
  STATE: Record<string, TediousConnectionState>;

  raw: TediousConnection;
}

export class MsSqlConnectionManager extends AbstractConnectionManager<MsSqlConnection> {
  lib: Lib;

  constructor(dialect: MssqlDialect, sequelize: Sequelize) {
    super(dialect, sequelize);
    this.lib = this._loadDialectModule('tedious') as Lib;
  }

  async connect(config: ConnectionOptions): Promise<MsSqlConnection> {
    const options: TediousConnectionConfig['options'] = {
      port: typeof config.port === 'string' ? Number.parseInt(config.port, 10) : config.port,
      database: config.database,
      trustServerCertificate: true,
    };

    const authentication: TediousConnectionConfig['authentication'] = {
      type: 'default',
      options: {
        userName: config.username || undefined,
        password: config.password || undefined,
      },
    };

    if (config.dialectOptions) {
      if (
        isPlainObject(config.dialectOptions.options)
        && config.dialectOptions.options.instanceName
      ) {
        delete options.port;
      }

      if (config.dialectOptions.authentication) {
        Object.assign(authentication, config.dialectOptions.authentication);
      }

      Object.assign(options, config.dialectOptions.options);
    }

    const connectionConfig: TediousConnectionConfig = {
      server: config.host || '',
      authentication,
      options,
    };

    try {
      return await new Promise<MsSqlConnection>((resolve, reject) => {
        // ✅ raw driver connection
        const raw = new this.lib.Connection(connectionConfig);

        const connection: MsSqlConnection = {
          raw,
          queue: new AsyncQueue(),
          lib: this.lib,

          closed: false,
          loggedIn: false,

          state: raw.state,
          STATE: raw.STATE as unknown as Record<string, TediousConnectionState>,
        } as MsSqlConnection;

        if (raw.state === raw.STATE.INITIALIZED) {
          raw.connect();
        }

        const connectHandler = (error: unknown) => {
          raw.removeListener('end', endHandler);
          raw.removeListener('error', errorHandler);

          if (error) {
            return void reject(error);
          }

          connection.loggedIn = true;

          debug('connection acquired');
          resolve(connection);
        };

        const endHandler = () => {
          raw.removeListener('connect', connectHandler);
          raw.removeListener('error', errorHandler);
          reject(new Error('Connection was closed by remote server'));
        };

        const errorHandler = (error: unknown) => {
          raw.removeListener('connect', connectHandler);
          raw.removeListener('end', endHandler);
          reject(error);
        };

        raw.once('error', errorHandler);
        raw.once('end', endHandler);
        raw.once('connect', connectHandler);

        raw.on('error', (error: unknown) => {
          if (
            isErrorWithStringCode(error)
            && (error.code === 'ESOCKET' || error.code === 'ECONNRESET')
          ) {
            void this.pool.destroy(connection);
          }
        });

        if (config.dialectOptions?.debug) {
          raw.on('debug', debugTedious.log.bind(debugTedious));
        }
      });
    } catch (error: unknown) {
      assertCaughtError(error);

      if (!isErrorWithStringCode(error)) {
        throw new ConnectionError(error);
      }

      switch (error.code) {
        case 'ESOCKET':
          if (error.message.includes('connect EHOSTUNREACH')) {
            throw new HostNotReachableError(error);
          }

          if (error.message.includes('connect ENETUNREACH')) {
            throw new HostNotReachableError(error);
          }

          if (error.message.includes('connect EADDRNOTAVAIL')) {
            throw new HostNotReachableError(error);
          }

          if (error.message.includes('getaddrinfo ENOTFOUND')) {
            throw new HostNotFoundError(error);
          }

          if (error.message.includes('connect ECONNREFUSED')) {
            throw new ConnectionRefusedError(error);
          }

          throw new ConnectionError(error);
        case 'ER_ACCESS_DENIED_ERROR':
        case 'ELOGIN':
          throw new AccessDeniedError(error);
        case 'EINVAL':
          throw new InvalidConnectionError(error);
        default:
          throw new ConnectionError(error);
      }
    }
  }

  async disconnect(connection: MsSqlConnection): Promise<void> {
    if (connection.closed) {
      return;
    }

    connection.queue.close();

    await new Promise<void>(resolve => {
      connection.raw.on('end', resolve);
      connection.raw.close();
      connection.closed = true;
      debug('connection closed');
    });
  }

  validate(connection: MsSqlConnection) {
    return (
      connection
      && (connection.loggedIn || connection.state?.name === 'LoggedIn')
    );
  }
}
