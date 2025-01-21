import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { configs } from '../../../lib/configs';
import { DataRepository } from '../../../repositories/data/rds/data.repository';
import { DataService } from '../../../services/data.service';
import { getDbConnectionClient } from '../../database/postgres/lib/connection-client';
import { getLambdaFunctionLogger } from '../lib/utils';
import { isObjectPayloadValid } from '../lib/valitators';

const logger = getLambdaFunctionLogger(
  configs.aws.lambda.functions.storeUnstructuredData.name
);

const dbClient = getDbConnectionClient();
const dataRepository = new DataRepository(dbClient);
const dataService = new DataService(dataRepository);

async function handler(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
  if (!event.body || !isObjectPayloadValid(event.body)) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'The payload provided is not a valid JSON',
      }),
    };
  }

  try {
    const result = await dataService.storeUnstructuredData(event.body);
    logger.info('Data stored', { id: result });

    return {
      statusCode: StatusCodes.OK,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: result }),
    };
  } catch (error) {
    logger.error(
      'Unexpected error occurred while trying to store the payload',
      error as Error
    );

    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message:
          'Could not store the payload provided. Please check the logs and/or try again',
      }),
    };
  }
}

export { handler };
