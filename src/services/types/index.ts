import { IRandomNumber } from '../../types';

type IRandomNumberService = {
  createRandomNumberRecord: () => Promise<IRandomNumber>;
  getLastRandomNumbers: () => Promise<IRandomNumber[]>;
};

export type { IRandomNumberService };
