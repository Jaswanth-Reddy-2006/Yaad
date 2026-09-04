import { connectionRepository } from '../repositories/ConnectionRepository';
import { ConnectionIdentity } from '../types';

export class ConnectionService {
  public async getPatientConnectionIdentity(): Promise<ConnectionIdentity | null> {
    return await connectionRepository.getConnectionIdentity();
  }
}

export const connectionService = new ConnectionService();
