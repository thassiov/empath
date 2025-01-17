import { configs } from '../lib/configs';
import { OperationError } from '../lib/errors/operation.error';
import { operations } from '../lib/operation-list';
import { IRandomNumberRepository } from '../repository/types';
import { IRandomNumber, IRandomNumberRecord } from '../types';
import { IRandomNumberService } from './types';

class RandomNumberService implements IRandomNumberService {
  constructor(
    private readonly randomNumberRepository: IRandomNumberRepository
  ) {}

  async createRandomNumberRecord(): Promise<IRandomNumber> {
    try {
      const record: IRandomNumberRecord = {
        randomNumber: this.getNewNumber(),
        timestamp: new Date().toISOString(),
      };

      await this.randomNumberRepository.store(record);

      return { randomNumber: record.randomNumber };
    } catch (error) {
      if (error instanceof OperationError) {
        throw error;
      }

      const operationError = new OperationError({
        cause: error as Error,
        details: {
          operation: operations.createRandomNumberRecord,
        },
      });

      throw operationError;
    }
  }

  async getLastRandomNumbers(): Promise<IRandomNumber[]> {
    return this.randomNumberRepository.retrieve();
  }

  private getNewNumber(): number {
    return Math.floor(
      Math.random() *
        (configs.numberGenerator.maxNumber -
          configs.numberGenerator.minNumber +
          1) +
        configs.numberGenerator.minNumber
    );
  }
}

export { RandomNumberService };
