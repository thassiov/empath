const numberGenerator = {
  minNumber: 0,
  maxNumber: 1_000_000_000_000,
};

const reposiory = {
  randomNumber: {
    tableName: process.env['RANDOMNUMBER_TABLE_NAME'] ?? 'random-number-table',
  },
};

const configs = {
  numberGenerator,
  reposiory,
};

export { configs };
