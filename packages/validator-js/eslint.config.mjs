import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    languageOptions: {
      parserOptions: {
        project: [`${__dirname}/tsconfig.json`],
      },
    },
  },

  {
    files: ['test/**/*'],
    languageOptions: {
      parserOptions: {
        project: [`${__dirname}/test/tsconfig.json`],
      },
    },
  },
];
