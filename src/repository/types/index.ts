import { IRandomNumber, IRandomNumberRecord } from '../../types';

type IRandomNumberRepository = {
  store: (randomNumberRecord: IRandomNumberRecord) => Promise<boolean>;
  retrieve: () => Promise<IRandomNumber[]>;
};

export type { IRandomNumberRepository };
