import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

import { configs } from '../../../lib/configs';
import { OperationError } from '../../../lib/errors/operation.error';
import { operations } from '../../../lib/operation-list';
import { IRandomNumber, IRandomNumberRecord } from '../../../types';
import { RandomNumberRepository } from './random-number.repository';

jest.mock('crypto');

describe('[repository] random number - dynamodb', () => {
  const mockDynamoDbClient = {};

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('store', () => {
    it('stores the random number record', async () => {
      const mockItemId = 'id';
      const mockRandomNumberRecord: IRandomNumberRecord = {
        randomNumber: 10,
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      const mockSendPut = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendPut')
        .mockResolvedValueOnce(true);

      (randomUUID as jest.Mock).mockReturnValueOnce(mockItemId);

      const instance = new RandomNumberRepository(
        mockDynamoDbClient as unknown as DynamoDBDocumentClient
      );

      await expect(
        instance.store(mockRandomNumberRecord)
      ).resolves.toBeUndefined();

      expect(mockSendPut).toHaveBeenCalledTimes(1);
      expect(mockSendPut).toHaveBeenCalledWith({
        TableName: configs.reposiory.randomNumber.dynamodb.tableName,
        Item: {
          ...mockRandomNumberRecord,
          id: mockItemId,
        },
      });
    });

    it('fails to store the record due to an error thrown by the storage driver', async () => {
      const mockItemId = 'id';
      const mockRandomNumberRecord: IRandomNumberRecord = {
        randomNumber: 10,
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      const mockError = new Error('some-error');
      const mockSendPut = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendPut')
        .mockRejectedValueOnce(mockError);

      (randomUUID as jest.Mock).mockReturnValueOnce(mockItemId);

      const instance = new RandomNumberRepository(
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
        TableName: configs.reposiory.randomNumber.dynamodb.tableName,
        Item: {
          ...mockRandomNumberRecord,
          id: mockItemId,
        },
      });
    });

    it('fails due to an error related to assignment of values of the new record', async () => {
      const mockRandomNumberRecord: IRandomNumberRecord = {
        randomNumber: 10,
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      const mockError = new Error('some-error');
      (randomUUID as jest.Mock).mockImplementationOnce(() => {
        throw mockError;
      });
      const mockSendPut = jest.spyOn(
        RandomNumberRepository.prototype as any,
        'sendPut'
      );

      const instance = new RandomNumberRepository(
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
      expect(mockSendPut).toHaveBeenCalledTimes(0);
    });
  });

  describe('retrieve', () => {
    it('retrieves the last records in storage ordered by their timestamps', async () => {
      const records: IRandomNumber[] = [
        { randomNumber: 1 },
        { randomNumber: 2 },
        { randomNumber: 3 },
        { randomNumber: 4 },
        { randomNumber: 5 },
      ];

      const mockSendQuery = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ Items: records });

      const instance = new RandomNumberRepository(
        mockDynamoDbClient as unknown as DynamoDBDocumentClient
      );

      const result = await instance.retrieve();

      expect(result).toStrictEqual(records);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith({
        TableName: configs.reposiory.randomNumber.dynamodb.tableName,
        ProjectionExpression: 'randomNumber',
        ScanIndexForward: false,
        Limit: configs.reposiory.randomNumber.retrieveMaxQuantity,
      });
    });

    it('returns an empty list of records due to having no data in storage', async () => {
      const records: IRandomNumber[] = [];

      const mockSendQuery = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ Items: undefined });

      const instance = new RandomNumberRepository(
        mockDynamoDbClient as unknown as DynamoDBDocumentClient
      );

      const result = await instance.retrieve();

      expect(result).toStrictEqual(records);
      expect(mockSendQuery).toHaveBeenCalledTimes(1);
      expect(mockSendQuery).toHaveBeenCalledWith({
        TableName: configs.reposiory.randomNumber.dynamodb.tableName,
        ProjectionExpression: 'randomNumber',
        ScanIndexForward: false,
        Limit: configs.reposiory.randomNumber.retrieveMaxQuantity,
      });
    });

    it('fails to retrieve records due to an error thrown by the storage driver', async () => {
      const mockError = new Error('some-error');
      const mockSendQuery = jest
        .spyOn(RandomNumberRepository.prototype as any, 'sendQuery')
        .mockRejectedValueOnce(mockError);

      const instance = new RandomNumberRepository(
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
        TableName: configs.reposiory.randomNumber.dynamodb.tableName,
        ProjectionExpression: 'randomNumber',
        ScanIndexForward: false,
        Limit: configs.reposiory.randomNumber.retrieveMaxQuantity,
      });
    });
  });
});
