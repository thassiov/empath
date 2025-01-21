import { Knex } from 'knex';
import { OperationError } from '../../../lib/errors/operation.error';
import { operations } from '../../../lib/operation-list';
import { IUnstructuredDataRecord } from '../../../types';
import { IDataRepository } from '../../types';

class DataRepository implements IDataRepository {
  constructor(private readonly dbClient: Knex) {}

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
    const [result] = (await this.dbClient('unstructured_data')
      .insert({ data })
      .returning('id')) as { id: string }[];

    return result;
  }
}

export { DataRepository };
