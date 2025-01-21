import { Pool } from 'pg';
import { OperationError } from '../../../lib/errors/operation.error';
import { operations } from '../../../lib/operation-list';
import { IUnstructuredDataRecord } from '../../../types';
import { IDataRepository } from '../../types';

class DataRepository implements IDataRepository {
  constructor(private readonly dbClient: Pool) {}

  async store(data: IUnstructuredDataRecord): Promise<string> {
    try {
      const result = await this.sendInsert(data);

      if (!result) {
        throw Error(`could not insert data: ${data}`);
      }

      return result.id;
    } catch (error) {
      const operationError = new OperationError({
        cause: error as Error,
        details: {
          operation: operations.storeUnstructuredData,
          input: data,
        },
      });

      throw operationError;
    }
  }

  private async sendInsert(
    data: IUnstructuredDataRecord
  ): Promise<{ id: string } | undefined> {
    const queryText =
      'INSERT INTO unstructured_data(data) VALUES($1) RETURNING id';
    const queryData = [data];

    const { rows } = await this.dbClient.query(queryText, queryData);

    if (!rows.length) {
      return;
    }

    return rows[0] as { id: string };
  }
}

export { DataRepository };
