type IRandomNumber = {
  randomNumber: number;
};

type IRandomNumberRecord = IRandomNumber & {
  timestamp: string;
};

export type { IRandomNumber, IRandomNumberRecord };
