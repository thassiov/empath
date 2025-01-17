import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { configs } from '../lib/configs';
import { OperationError } from '../lib/errors/operation.error';
import { IRandomNumber, IRandomNumberRecord } from '../types';
import { IRandomNumberRepository } from './types';

class RandomNumberRepository implements IRandomNumberRepository {
  private tableName: string;
  constructor(private readonly dynamo: DynamoDBDocumentClient) {
    this.tableName = configs.reposiory.randomNumber.tableName;
  }

  async store(randomNumberRecord: IRandomNumberRecord): Promise<void> {
    try {
      const putParams: PutCommandInput = {
        TableName: this.tableName,
        Item: {
          id: randomUUID(),
          ...randomNumberRecord,
        },
      };

      await this.dynamo.send(new PutCommand(putParams));
    } catch (error) {
      const operationError = new OperationError({
        cause: error as Error,
        details: {
          operation: 'create-random-number-record',
          input: randomNumberRecord,
        },
      });

      throw operationError;
    }
  }

  async retrieve(): Promise<IRandomNumber[]> {
    try {
      const queryParams: QueryCommandInput = {
        TableName: this.tableName,
        ProjectionExpression: 'randomNumber',
        ScanIndexForward: false,
        Limit: 5,
      };

      const { Items } = await this.dynamo.send(new QueryCommand(queryParams));

      if (!Items) {
        return [];
      }

      return Items as unknown as IRandomNumber[];
    } catch (error) {
      const operationError = new OperationError({
        cause: error as Error,
        details: {
          operation: 'retrieve-random-number-records',
        },
      });

      throw operationError;
    }
  }
}

export { RandomNumberRepository };
