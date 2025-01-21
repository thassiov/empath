import { Pool } from 'pg';
import { OperationError } from '../../../lib/errors/operation.error';
import { operations } from '../../../lib/operation-list';
import { DataRepository } from './data.repository';

describe('[repository] data', () => {
  const mockDbClient = {};

  const mockData = JSON.stringify({
    field: 1,
    field2: 3,
    field4: true,
    field5: [1, 'a', false],
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should insert json data into the database', async () => {
    const mockQueryReturnValue = { id: 'someid' };

    const mockSendInsert = jest
      .spyOn(DataRepository.prototype as any, 'sendInsert')
      .mockResolvedValueOnce(mockQueryReturnValue);

    const instance = new DataRepository(mockDbClient as unknown as Pool);

    const result = await instance.store(mockData);

    expect(result).toEqual(mockQueryReturnValue.id);
    expect(mockSendInsert).toHaveBeenCalledTimes(1);
    expect(mockSendInsert).toHaveBeenCalledWith(mockData);
  });

  it('should fail due to an error during the query operation', async () => {
    const mockError = new Error('some-error');
    const mockSendInsert = jest
      .spyOn(DataRepository.prototype as any, 'sendInsert')
      .mockRejectedValueOnce(mockError);

    const instance = new DataRepository(mockDbClient as unknown as Pool);

    let thrown;
    try {
      await instance.store(mockData);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(OperationError);
    expect((thrown as OperationError).cause).toEqual(mockError);
    expect((thrown as OperationError).details).toEqual({
      operation: operations.storeUnstructuredData,
      input: mockData,
    });
    expect(mockSendInsert).toHaveBeenCalledTimes(1);
    expect(mockSendInsert).toHaveBeenCalledWith(mockData);
  });
});
