// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Resource } = require('sst');
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyResult } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../../lib/configs';
import { RandomNumberRepository } from '../../../repositories/random-number/dynamodb/random-number.repository';
import { RandomNumberService } from '../../../services/random-number.service';
import { getLambdaFunctionLogger } from '../lib/utils';

const logger = getLambdaFunctionLogger(
  configs.aws.lambda.functions.createRandomNumber.name
);
const dynamodbClient = new DynamoDBClient();
const randomNumberRepository = new RandomNumberRepository(
  (
    Resource[
      configs.repository.randomNumber.dynamodb
        .tableName as keyof typeof Resource
    ] as {
      name: string;
    }
  ).name,
  dynamodbClient
);
const randomNumberService = new RandomNumberService(randomNumberRepository);

async function handler(): Promise<APIGatewayProxyResult> {
  try {
    const number = await randomNumberService.createRandomNumberRecord();
    logger.info('New random number generated', number);

    return {
      statusCode: StatusCodes.CREATED,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(number),
    };
  } catch (error) {
    logger.error(
      'Unexpected error occurred while trying to generate a new random number',
      error as Error
    );

    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message:
          'Could not generate a new random number. Please check the logs and/or try again',
      }),
    };
  }
}

export { handler };
