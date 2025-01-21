type IRandomNumber = {
  randomNumber: number;
};

type IRandomNumberRecord = IRandomNumber & {
  timestamp: string;
};

type IQueryResponseRandomNumber = {
  randomNumber: { N: number };
};

type IUnstructuredDataRecord = string;

export type {
  IQueryResponseRandomNumber,
  IRandomNumber,
  IRandomNumberRecord,
  IUnstructuredDataRecord,
};
