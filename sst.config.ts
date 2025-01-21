/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/triple-slash-reference */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/// <reference path="./.sst/platform/config.d.ts" />

import { configs } from './src/lib/configs';

export default $config({
  app(input: sst) {
    return {
      name: 'backend-devops-challenge',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    };
  },
  run() {
    const vpc = new sst.aws.Vpc(configs.aws.vpc.name);

    const rds = new sst.aws.Postgres(configs.repository.data.databaseName, {
      name: configs.repository.data.databaseName,
      vpc,
      dev: {
        ...configs.devDatabase,
      },
    });

    new sst.x.DevCommand('wait-on-pg-and-run-migration', {
      dev: {
        autostart: true,
        command: 'npm run wait-on-pg-and-run-migration',
      },
    });

    const dynamodb = new sst.aws.Dynamo(
      configs.repository.randomNumber.dynamodb.tableName,
      {
        name: configs.repository.randomNumber.dynamodb.tableName,
        fields: {
          // 'p' for 'partition'
          p: 'string',
          timestamp: 'string',
        },
        primaryIndex: { hashKey: 'p', rangeKey: 'timestamp' },
      }
    );

    const api = new sst.aws.ApiGatewayV2(configs.aws.gateway.name);
    api.route('GET /random', {
      handler: configs.aws.lambda.functions.createRandomNumber.pathFromRoot,
      memory: configs.aws.lambda.opts.memory,
      description: configs.aws.lambda.functions.createRandomNumber.description,
      name: configs.aws.lambda.functions.createRandomNumber.name,
      link: [dynamodb],
    });

    api.route('GET /random/logs', {
      handler: configs.aws.lambda.functions.getRandomNumbers.pathFromRoot,
      memory: configs.aws.lambda.opts.memory,
      description: configs.aws.lambda.functions.getRandomNumbers.description,
      name: configs.aws.lambda.functions.getRandomNumbers.name,
      link: [dynamodb],
    });

    api.route('POST /data', {
      handler: configs.aws.lambda.functions.storeUnstructuredData.pathFromRoot,
      memory: configs.aws.lambda.opts.memory,
      description:
        configs.aws.lambda.functions.storeUnstructuredData.description,
      name: configs.aws.lambda.functions.storeUnstructuredData.name,
      link: [vpc, rds],
    });
  },
});
