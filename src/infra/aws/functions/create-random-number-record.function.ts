import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
// @ts-expect-error linter is talking about sst not being 'importable'
import { Resource } from 'sst';
import { configs } from '../../../lib/configs';
import { RandomNumberRepository } from '../../../repository/random-number/dynamodb/random-number.repository';
import { RandomNumberService } from '../../../services/random-number.service';
import { getLambdaFunctionLogger } from '../lib/utils';

const logger = getLambdaFunctionLogger('create-random-number-record');
const dynamodbClient = new DynamoDBClient();
const randomNumberRepository = new RandomNumberRepository(
  (
    Resource[
      configs.repository.randomNumber.dynamodb.tableName as keyof Resource
    ] as {
      name: string;
    }
  ).name,
  dynamodbClient
);
const randomNumberService = new RandomNumberService(randomNumberRepository);

async function handler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  logger.appendKeys({
    resource_path: event.requestContext.resourcePath,
  });

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
