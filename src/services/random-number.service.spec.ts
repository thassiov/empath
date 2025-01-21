import { OperationError } from '../lib/errors/operation.error';
import { IRandomNumberRepository } from '../repositories/types';
import { RandomNumberService } from './random-number.service';

describe('[service] random number', () => {
  const mockRandomNumberRepository: IRandomNumberRepository = {
    store: jest.fn(),
    retrieve: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('createRandomNumberRecord', () => {
    it('should create a new random number record', async () => {
      const mockRandomNumber = 10;
      const mockDateTimestamp = '2025-01-01T00:00:00.000Z';
      jest
        .spyOn(RandomNumberService.prototype as any, 'getNewNumber')
        .mockReturnValue(mockRandomNumber);
      jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue(mockDateTimestamp);
      (mockRandomNumberRepository.store as jest.Mock).mockResolvedValueOnce(
        true
      );

      const instance = new RandomNumberService(mockRandomNumberRepository);

      const result = await instance.createRandomNumberRecord();
      expect(result).toStrictEqual({ randomNumber: mockRandomNumber });
      expect(mockRandomNumberRepository.store).toHaveBeenCalledTimes(1);
      expect(mockRandomNumberRepository.store).toHaveBeenLastCalledWith({
        randomNumber: mockRandomNumber,
        timestamp: mockDateTimestamp,
      });
    });

    it('should fail due to an operation error thrown by the repository', async () => {
      const mockRandomNumber = 10;
      const mockDateTimestamp = '2025-01-01T00:00:00.000Z';
      jest
        .spyOn(RandomNumberService.prototype as any, 'getNewNumber')
        .mockReturnValue(mockRandomNumber);
      jest
        .spyOn(Date.prototype, 'toISOString')
        .mockReturnValue(mockDateTimestamp);

      const mockOperationType = 'create-random-number-record';
      const mockError = new Error('repository-error');
      const mockOperationError = new OperationError({
        cause: mockError,
        details: {
          operation: mockOperationType,
        },
      });

      (mockRandomNumberRepository.store as jest.Mock).mockRejectedValueOnce(
        mockOperationError
      );

      const instance = new RandomNumberService(mockRandomNumberRepository);

      let thrown;
      try {
        await instance.createRandomNumberRecord();
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(OperationError);
      expect((thrown as OperationError).cause).toEqual(mockError);
      expect((thrown as OperationError).details).toEqual(
        mockOperationError.details
      );
      expect(mockRandomNumberRepository.store).toHaveBeenCalledTimes(1);
      expect(mockRandomNumberRepository.store).toHaveBeenLastCalledWith({
        randomNumber: mockRandomNumber,
        timestamp: mockDateTimestamp,
      });
    });

    it('should fail due to an error related to assignment of values of the new record', async () => {
      const mockError = new Error('some-error');
      jest
        .spyOn(RandomNumberService.prototype as any, 'getNewNumber')
        .mockImplementationOnce(() => {
          throw mockError;
        });

      const mockOperationType = 'create-random-number-record';

      const instance = new RandomNumberService(mockRandomNumberRepository);

      let thrown;
      try {
        await instance.createRandomNumberRecord();
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(OperationError);
      expect((thrown as OperationError).cause).toEqual(mockError);
      expect((thrown as OperationError).details).toEqual({
        operation: mockOperationType,
      });
      expect(mockRandomNumberRepository.store).toHaveBeenCalledTimes(0);
    });
  });

  describe('getLastRandomNumbers', () => {
    it('should return the last random numbers (max 5)', async () => {
      const mockRandomNumbers = [
        { randomNumber: 1 },
        { randomNumber: 2 },
        { randomNumber: 3 },
        { randomNumber: 4 },
        { randomNumber: 5 },
      ];

      (mockRandomNumberRepository.retrieve as jest.Mock).mockResolvedValueOnce(
        mockRandomNumbers
      );

      const instance = new RandomNumberService(mockRandomNumberRepository);

      const result = await instance.getLastRandomNumbers();
      expect(result).toStrictEqual(mockRandomNumbers);
      expect(mockRandomNumberRepository.retrieve).toHaveBeenCalledTimes(1);
      expect(mockRandomNumberRepository.retrieve).toHaveBeenCalledWith();
    });
  });
});
