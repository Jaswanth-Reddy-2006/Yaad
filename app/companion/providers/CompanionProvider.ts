import {
  CompanionResult,
  ConversationState,
  PatientContext,
} from '../types';

export interface ICompanionProvider {
  readonly id: string;
  readonly name: string;
  isAvailable(): Promise<boolean> | boolean;
  process(
    rawQuery: string,
    context?: PatientContext,
    conversationState?: ConversationState
  ): Promise<CompanionResult>;
}
