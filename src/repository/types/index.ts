import {
  IRandomNumber,
  IRandomNumberRecord,
  IUnstructuredDataRecord,
} from '../../types';

type IRandomNumberRepository = {
  store: (randomNumberRecord: IRandomNumberRecord) => Promise<void>;
  retrieve: () => Promise<IRandomNumber[]>;
};

type IDataRepository = {
  store: (data: IUnstructuredDataRecord) => Promise<string>;
};

export type { IDataRepository, IRandomNumberRepository };
