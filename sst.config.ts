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

    const api = new sst.aws.ApiGatewayV2('random-number-api');
    api.route('GET /random', {
      handler:
        './src/infra/aws/functions/create-random-number-record.function.handler',
      memory: '300 MB',
      description: 'Handler function for generating new random numbers',
      name: `create-random-number-record-function`,
      link: [dynamodb],
    });

    api.route('GET /random/logs', {
      handler:
        './src/infra/aws/functions/get-last-random-numbers.function.handler',
      memory: '300 MB',
      description: 'Handler function retrieving last generated random numbers',
      name: `get-last-random-numbers-function`,
      link: [dynamodb],
    });
  },
});
