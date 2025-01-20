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
import { configs } from '../../../lib/configs';
import { OperationError } from '../../../lib/errors/operation.error';
import { operations } from '../../../lib/operation-list';
import {
  IQueryResponseRandomNumber,
  IRandomNumber,
  IRandomNumberRecord,
} from '../../../types';
import { IRandomNumberRepository } from '../../types';

class RandomNumberRepository implements IRandomNumberRepository {
  private retrieveMaxQuantity: number;
  private partitionKey: string;
  constructor(
    private readonly tableName: string,
    private readonly dynamo: DynamoDBDocumentClient
  ) {
    this.retrieveMaxQuantity =
      configs.repository.randomNumber.retrieveMaxQuantity;
    this.partitionKey = configs.repository.randomNumber.dynamodb.partitionKey;
  }

  async store(randomNumberRecord: IRandomNumberRecord): Promise<void> {
    try {
      const putParams: PutCommandInput = {
        TableName: this.tableName,
        Item: {
          p: this.partitionKey,
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
        KeyConditionExpression: 'p = :partitionKey ',
        ExpressionAttributeValues: {
          ':partitionKey': {
            S: this.partitionKey,
          },
        },
        ScanIndexForward: false,
        Limit: this.retrieveMaxQuantity,
      };

      const result = await this.sendQuery(queryParams);

      if (!result.Items) {
        return [];
      }

      return this.formatQueryResponse(
        result.Items as unknown as IQueryResponseRandomNumber[]
      );
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

  private formatQueryResponse(
    response: IQueryResponseRandomNumber[]
  ): IRandomNumber[] {
    return response.map((number) => ({
      randomNumber: number.randomNumber.N,
    }));
  }
}

export { RandomNumberRepository };
