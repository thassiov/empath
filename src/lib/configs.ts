const numberGenerator = {
  minNumber: 0,
  maxNumber: 1_000_000_000_000,
};

const reposiory = {
  randomNumber: {
    retrieveMaxQuantity: 5,
    dynamodb: {
      tableName:
        process.env['RANDOMNUMBER_TABLE_NAME_DYNAMODB'] ??
        'random-number-table',
    },
  },
};

const configs = {
  numberGenerator,
  reposiory,
};

export { configs };
