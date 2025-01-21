// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Resource } = require('sst');
import { Pool } from 'pg';
import { configs } from '../../../../lib/configs';

function getDbConnectionClient(): Pool {
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
    user: resource.username,
    password: resource.password,
    database: resource.database,
    host: resource.host,
    port: resource.port,
  };

  const client = new Pool(clientConfig);
  return client;
}

export { getDbConnectionClient };
