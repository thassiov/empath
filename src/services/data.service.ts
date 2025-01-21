import { IDataRepository } from '../repository/types';
import { IUnstructuredDataRecord } from '../types';
import { IDataService } from './types';

class DataService implements IDataService {
  constructor(private readonly dataRepository: IDataRepository) {}

  async storeUnstructuredData(data: IUnstructuredDataRecord): Promise<string> {
    return this.dataRepository.store(data);
  }
}

export { DataService };
