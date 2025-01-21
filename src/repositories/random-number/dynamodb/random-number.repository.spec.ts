import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { configs } from '../../../lib/configs';
import { OperationError } from '../../../lib/errors/operation.error';
import { operations } from '../../../lib/operation-list';
import {
  IQueryResponseRandomNumber,
  IRandomNumber,
  IRandomNumberRecord,
} from '../../../types';
import { RandomNumberRepository } from './random-number.repository';

describe('[repository] random number - dynamodb', () => {
  const mockDynamoDbClient = {};
  const mockDynamoDbTableName = 'mock-table';

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('store', () => {
    it('stores the random number record', async () => {
      const mockItemId = '\0';
      const mockRandomNumberRecord: IRandomNumberRecord = {
        randomNumber: 10,
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      const mockSendPut = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendPut')
        .mockResolvedValueOnce(true);

      const instance = new RandomNumberRepository(
        mockDynamoDbTableName,
        mockDynamoDbClient as unknown as DynamoDBDocumentClient
      );

      await expect(
        instance.store(mockRandomNumberRecord)
      ).resolves.toBeUndefined();

      expect(mockSendPut).toHaveBeenCalledTimes(1);
      expect(mockSendPut).toHaveBeenCalledWith({
        TableName: mockDynamoDbTableName,
        Item: {
          ...mockRandomNumberRecord,
          p: mockItemId,
        },
      });
    });

    it('fails to store the record due to an error thrown by the storage driver', async () => {
      const mockItemId = '\0';
      const mockRandomNumberRecord: IRandomNumberRecord = {
        randomNumber: 10,
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      const mockError = new Error('some-error');
      const mockSendPut = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendPut')
        .mockRejectedValueOnce(mockError);

      const instance = new RandomNumberRepository(
        mockDynamoDbTableName,
        mockDynamoDbClient as unknown as DynamoDBDocumentClient
      );

      let thrown;
      try {
        await instance.store(mockRandomNumberRecord);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(OperationError);
      expect((thrown as OperationError).cause).toEqual(mockError);
      expect((thrown as OperationError).details).toEqual({
        operation: operations.createRandomNumberRecord,
        input: mockRandomNumberRecord,
      });
      expect(mockSendPut).toHaveBeenCalledTimes(1);
      expect(mockSendPut).toHaveBeenCalledWith({
        TableName: mockDynamoDbTableName,
        Item: {
          ...mockRandomNumberRecord,
          p: mockItemId,
        },
      });
    });
  });

  describe('retrieve', () => {
    it('retrieves the last records in storage ordered by their timestamps', async () => {
      const mockDynamoDbQueryResult: IQueryResponseRandomNumber[] = [
        { randomNumber: { N: 1 } },
        { randomNumber: { N: 2 } },
        { randomNumber: { N: 3 } },
        { randomNumber: { N: 4 } },
        { randomNumber: { N: 5 } },
      ];

      const records: IRandomNumber[] = [
        { randomNumber: 1 },
        { randomNumber: 2 },
        { randomNumber: 3 },
        { randomNumber: 4 },
        { randomNumber: 5 },
      ];

      const mockSendQuery = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ Items: mockDynamoDbQueryResult });

      const instance = new RandomNumberRepository(
        mockDynamoDbTableName,
        mockDynamoDbClient as unknown as DynamoDBDocumentClient
      );

      const result = await instance.retrieve();

      expect(result).toStrictEqual(records);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith({
        TableName: mockDynamoDbTableName,
        ProjectionExpression: 'randomNumber',
        KeyConditionExpression: 'p = :partitionKey ',
        ExpressionAttributeValues: {
          ':partitionKey': {
            S: configs.repository.randomNumber.dynamodb.partitionKey,
          },
        },
        ScanIndexForward: false,
        Limit: configs.repository.randomNumber.retrieveMaxQuantity,
      });
    });

    it('returns an empty list of records due to having no data in storage', async () => {
      const records: IRandomNumber[] = [];

      const mockSendQuery = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ Items: undefined });

      const instance = new RandomNumberRepository(
        mockDynamoDbTableName,
        mockDynamoDbClient as unknown as DynamoDBDocumentClient
      );

      const result = await instance.retrieve();

      expect(result).toStrictEqual(records);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith({
        TableName: mockDynamoDbTableName,
        ProjectionExpression: 'randomNumber',
        KeyConditionExpression: 'p = :partitionKey ',
        ExpressionAttributeValues: {
          ':partitionKey': {
            S: configs.repository.randomNumber.dynamodb.partitionKey,
          },
        },
        ScanIndexForward: false,
        Limit: configs.repository.randomNumber.retrieveMaxQuantity,
      });
    });

    it('fails to retrieve records due to an error thrown by the storage driver', async () => {
      const mockError = new Error('some-error');
      const mockSendQuery = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendQuery')
        .mockRejectedValueOnce(mockError);

      const instance = new RandomNumberRepository(
        mockDynamoDbTableName,
        mockDynamoDbClient as unknown as DynamoDBDocumentClient
      );

      let thrown;
      try {
        await instance.retrieve();
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(OperationError);
      expect((thrown as OperationError).cause).toEqual(mockError);
      expect((thrown as OperationError).details).toEqual({
        operation: operations.retrieveRandomNumberRecord,
      });
      expect(mockSendQuery).toHaveBeenCalledWith({
        TableName: mockDynamoDbTableName,
        ProjectionExpression: 'randomNumber',
        KeyConditionExpression: 'p = :partitionKey ',
        ExpressionAttributeValues: {
          ':partitionKey': {
            S: configs.repository.randomNumber.dynamodb.partitionKey,
          },
        },
        ScanIndexForward: false,
        Limit: configs.repository.randomNumber.retrieveMaxQuantity,
      });
    });
  });
});
