import { Logger } from '@aws-lambda-powertools/logger';

function getLambdaFunctionLogger(serviceName: string): Logger {
  return new Logger({ serviceName });
}

export { getLambdaFunctionLogger };
