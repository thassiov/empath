import { configs } from '../../../lib/configs';

export default {
  client: 'pg',
  connection: {
    ...configs.devDatabase,
    user: configs.devDatabase.username,
  },
  migrations: {
    directory: '../migrations',
    tableName: 'migrations',
    extension: 'ts',
  },
};
