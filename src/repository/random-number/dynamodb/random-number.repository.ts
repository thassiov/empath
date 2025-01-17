import {
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { configs } from '../../../lib/configs';
import { OperationError } from '../../../lib/errors/operation.error';
import { operations } from '../../../lib/operation-list';
import { IRandomNumber, IRandomNumberRecord } from '../../../types';
import { IRandomNumberRepository } from '../../types';

class RandomNumberRepository implements IRandomNumberRepository {
  private tableName: string;
  private retrieveMaxQuantity: number;
  constructor(private readonly dynamo: DynamoDBDocumentClient) {
    this.tableName = configs.reposiory.randomNumber.dynamodb.tableName;
    this.retrieveMaxQuantity =
      configs.reposiory.randomNumber.retrieveMaxQuantity;
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

      await this.sendPut(putParams);
    } catch (error) {
      const operationError = new OperationError({
        cause: error as Error,
        details: {
          operation: operations.createRandomNumberRecord,
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
        Limit: this.retrieveMaxQuantity,
      };

      const result = await this.sendQuery(queryParams);

      if (!result.Items) {
        return [];
      }

      return result.Items as unknown as IRandomNumber[];
    } catch (error) {
      const operationError = new OperationError({
        cause: error as Error,
        details: {
          operation: operations.retrieveRandomNumberRecord,
        },
      });

      throw operationError;
    }
  }

  private async sendQuery(
    queryParams: QueryCommandInput
  ): Promise<QueryCommandOutput> {
    return this.dynamo.send(new QueryCommand(queryParams));
  }

  private async sendPut(putParams: PutCommandInput): Promise<void> {
    await this.dynamo.send(new PutCommand(putParams));
  }
}

export { RandomNumberRepository };
