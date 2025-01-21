import { IRandomNumber, IUnstructuredDataRecord } from '../../types';

type IRandomNumberService = {
  createRandomNumberRecord: () => Promise<IRandomNumber>;
  getLastRandomNumbers: () => Promise<IRandomNumber[]>;
};

type IDataService = {
  storeUnstructuredData: (data: IUnstructuredDataRecord) => Promise<string>;
};

export type { IDataService, IRandomNumberService };
