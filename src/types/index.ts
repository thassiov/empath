type IRandomNumber = {
  randomNumber: number;
};

type IRandomNumberRecord = IRandomNumber & {
  timestamp: string;
};

type IQueryResponseRandomNumber = {
  randomNumber: { N: number };
};

export type { IQueryResponseRandomNumber, IRandomNumber, IRandomNumberRecord };
