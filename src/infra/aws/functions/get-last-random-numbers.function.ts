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
  configs.aws.lambda.functions.getRandomNumbers.name
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
    const numbers = await randomNumberService.getLastRandomNumbers();
    logger.info('Random numbers retrieved', { numbers });

    return {
      statusCode: StatusCodes.OK,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(numbers),
    };
  } catch (error) {
    logger.error(
      'Unexpected error occurred while trying to retrieve list of random numbers',
      error as Error
    );

    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message:
          'Could not retrieve list of random numbers. Please check the logs and/or try again',
      }),
    };
  }
}

export { handler };
