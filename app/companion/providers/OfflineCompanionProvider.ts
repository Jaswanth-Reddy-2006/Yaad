import { ICompanionProvider } from './CompanionProvider';
import {
  CompanionResult,
  ConversationState,
  PatientContext,
} from '../types';
import { OfflineCompanionEngine } from '../OfflineCompanionEngine';

export class OfflineCompanionProvider implements ICompanionProvider {
  public readonly id = 'offline';
  public readonly name = 'Offline Rule-Based Companion';

  public isAvailable(): boolean {
    return true;
  }

  public async process(
    rawQuery: string,
    context: PatientContext = {},
    conversationState?: ConversationState
  ): Promise<CompanionResult> {
    return OfflineCompanionEngine.process(rawQuery, context, conversationState);
  }
}
