import knex, { Knex } from 'knex';
// @ts-expect-error alsdkfjalskdjf
import KnexPostgres from 'knex/lib/dialects/postgres';
import { configs } from '../../../lib/configs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Resource } = require('sst');

function getRdsConnectionClient(): Knex {
  const resource = Resource[
    configs.repository.data.databaseName as keyof typeof Resource
  ] as unknown as {
    username: string;
    password: string;
    database: string;
    host: string;
    port: number;
  };

  const clientConfig = {
    client: KnexPostgres,
    connection: {
      user: resource.username,
      password: resource.password,
      database: resource.database,
      host: resource.host,
      port: resource.port,
    },
    migrations: {
      directory: './migrations',
      tableName: 'migrations',
      extension: 'ts',
    },
  };
  console.log('olha');
  const client = knex(clientConfig);
  console.log('deveria funcionar');
  return client;
}

export { getRdsConnectionClient };
