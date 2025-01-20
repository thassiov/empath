const numberGenerator = {
  minNumber: 0,
  maxNumber: 1_000_000_000_000,
};

const repository = {
  randomNumber: {
    retrieveMaxQuantity: 5,
    dynamodb: {
      partitionKey: '\0',
      tableName:
        process.env['RANDOMNUMBER_TABLE_NAME_DYNAMODB'] ??
        'random-number-table',
    },
  },
};

const configs = {
  numberGenerator,
  repository,
};

export { configs };
