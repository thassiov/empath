import { IRandomNumber, IRandomNumberRecord } from '../../types';

type IRandomNumberRepository = {
  store: (randomNumberRecord: IRandomNumberRecord) => Promise<void>;
  retrieve: () => Promise<IRandomNumber[]>;
};

export type { IRandomNumberRepository };
