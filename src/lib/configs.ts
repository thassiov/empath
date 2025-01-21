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
  data: {
    databaseName: 'unstructured-data-db',
    tableName: 'unstructured_data',
  },
};

const aws = {
  vpc: {
    name: 'empath-challenge-vpc',
  },
  rds: {
    name: 'empath-challenge-rds',
  },
  dynamo: {
    name: 'empath-challenge-dynamo',
  },
  gateway: {
    name: 'empath-challenge-gateway',
  },
  lambda: {
    opts: {
      memory: '300 MB',
    },
    functions: {
      createRandomNumber: {
        name: 'create-random-number-record-function',
        description: 'Handler function for generating new random numbers',
        pathFromRoot:
          './src/infra/aws/functions/create-random-number-record.function.handler',
      },
      getRandomNumbers: {
        name: 'get-last-random-numbers-function',
        description:
          'Handler function retrieving last generated random numbers',
        pathFromRoot:
          './src/infra/aws/functions/get-last-random-numbers.function.handler',
      },
      storeUnstructuredData: {
        name: 'store-unstructured-data',
        description: 'Handler function that stored json in a RDS database',
        pathFromRoot:
          './src/infra/aws/functions/store-unstructured-data.function.handler',
      },
    },
  },
};

const devDatabase = {
  username: 'postgres',
  password: 'postgres',
  database: 'local',
  port: 5432,
};

const configs = {
  numberGenerator,
  repository,
  aws,
  devDatabase,
};

export { configs };
