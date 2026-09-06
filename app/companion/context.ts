import {
  CompanionIntent,
  ConversationState,
  ConversationTurn,
  ExtractedEntities,
} from './types';

const MAX_HISTORY = 5;

/**
 * Creates a clean initial conversation state.
 */
export function createInitialConversationState(): ConversationState {
  return {
    history: [],
  };
}

/**
 * Maps an intent to a general conversation topic.
 */
export function intentToTopic(
  intent: CompanionIntent
): 'medicine' | 'caregiver' | 'identity' | 'location' | 'schedule' | 'game' | 'emotion' | undefined {
  switch (intent) {
    case 'NEXT_MEDICINE':
    case 'WHAT_MEDICINE':
      return 'medicine';
    case 'WHO_IS_CAREGIVER':
    case 'WHERE_IS_CAREGIVER':
      return 'caregiver';
    case 'WHO_AM_I':
    case 'PERSON_QUERY':
      return 'identity';
    case 'WHERE_AM_I':
      return 'location';
    case 'TODAY_PLAN':
    case 'NEXT_REMINDER':
    case 'RECOMMEND_ACTIVITY':
      return 'schedule';
    case 'RECOMMEND_GAME':
      return 'game';
    case 'SCARED':
    case 'CONFUSED':
    case 'CANNOT_REMEMBER':
    case 'LONELY':
      return 'emotion';
    default:
      return undefined;
  }
}

/**
 * Updates the conversation state with the latest turn, keeping history bounded.
 */
export function updateConversationState(
  currentState: ConversationState | undefined,
  query: string,
  normalizedQuery: string,
  intent: CompanionIntent,
  response: string,
  entities?: ExtractedEntities
): ConversationState {
  const state: ConversationState = currentState
    ? { ...currentState, history: [...currentState.history] }
    : createInitialConversationState();

  const turn: ConversationTurn = {
    query,
    normalizedQuery,
    intent,
    response,
    entities,
    timestamp: Date.now(),
  };

  state.history.push(turn);
  if (state.history.length > MAX_HISTORY) {
    state.history.shift();
  }

  // Update rolling topic context if the intent carries a clear topic
  const topic = intentToTopic(intent);
  if (topic) {
    state.previousTopic = topic;
  }

  state.previousIntent = intent;
  if (entities && Object.keys(entities).length > 0) {
    state.previousEntities = { ...state.previousEntities, ...entities };
  }

  return state;
}
