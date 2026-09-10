import {
  CompanionIntent,
  CompanionTopic,
  QuestionCategory,
  ConversationState,
  ConversationTurn,
  ExtractedEntities,
} from './types';

const MAX_HISTORY = 6;

/**
 * Creates a clean initial conversation state.
 */
export function createInitialConversationState(): ConversationState {
  return {
    history: [],
    interactionCount: 0,
    observedPreferences: {},
  };
}

/**
 * Maps an intent to a general question category.
 */
export function intentToCategory(intent: CompanionIntent): QuestionCategory {
  switch (intent) {
    case 'SAFETY_ALERT':
      return 'SAFETY';
    case 'NEEDS_HELP':
      return 'HELP';
    case 'WHO_AM_I':
    case 'PATIENT_AGE':
    case 'PERSON_QUERY':
      return 'PATIENT_FACT';
    case 'WHO_IS_CAREGIVER':
    case 'WHERE_IS_CAREGIVER':
    case 'CONTACT_CAREGIVER':
      return 'CAREGIVER';
    case 'FAMILY_INFO':
    case 'FAMILY_MEMORIES':
      return 'FAMILY';
    case 'WHERE_AM_I':
    case 'PATIENT_HOME':
      return 'LOCATION';
    case 'NEXT_MEDICINE':
      return 'MEDICATION_TIME';
    case 'WHAT_MEDICINE':
    case 'MEDICINE_DOSAGE':
    case 'MEDICINE_TAKEN_QUERY':
      return 'MEDICATION';
    case 'NEXT_REMINDER':
      return 'REMINDER';
    case 'TODAY_PLAN':
      return 'ROUTINE';
    case 'APPOINTMENT_QUERY':
      return 'APPOINTMENT';
    case 'RECOMMEND_GAME':
      return 'GAME';
    case 'RECOMMEND_ACTIVITY':
      return 'ACTIVITY';
    case 'MEMORY_ABOUT_ME':
      return 'MEMORY';
    case 'FAVORITE_ACTIVITY':
    case 'FAVORITE_FOOD':
    case 'FAVORITE_MUSIC':
    case 'FAVORITE_COLOR':
    case 'PREFERENCE_QUERY':
      return 'PREFERENCE';
    case 'SCARED':
    case 'CONFUSED':
    case 'CANNOT_REMEMBER':
    case 'LONELY':
    case 'EMOTIONAL_SUPPORT':
      return 'EMOTIONAL_SUPPORT';
    case 'TIME_DEVICE_QUERY':
    case 'DATE_DEVICE_QUERY':
    case 'FAQ_DEMENTIA':
    case 'FAQ_MEMORY':
    case 'FAQ_REMINDERS':
    case 'FAQ_RELAX':
    case 'FAQ_WORRY':
    case 'GENERAL_KNOWLEDGE':
      return 'GENERAL_KNOWLEDGE';
    case 'SIMPLE_REASONING':
      return 'SIMPLE_REASONING';
    case 'GREETING':
    case 'GOOD_MORNING':
    case 'GOOD_NIGHT':
    case 'THANK_YOU':
    case 'REPEAT':
    case 'REPEAT_PATIENT':
    case 'WHAT_ELSE':
    case 'TELL_JOKE':
    case 'TELL_STORY':
      return 'CONVERSATION';
    case 'CLARIFICATION_NEEDED':
      return 'CLARIFICATION';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Maps an intent to a general conversation topic.
 */
export function intentToTopic(intent: CompanionIntent): CompanionTopic {
  switch (intent) {
    case 'SAFETY_ALERT':
      return 'SAFETY';
    case 'NEEDS_HELP':
      return 'HELP';
    case 'NEXT_MEDICINE':
    case 'WHAT_MEDICINE':
    case 'MEDICINE_DOSAGE':
    case 'MEDICINE_TAKEN_QUERY':
      return 'MEDICINE';
    case 'WHO_IS_CAREGIVER':
    case 'WHERE_IS_CAREGIVER':
    case 'CONTACT_CAREGIVER':
      return 'CAREGIVER';
    case 'FAMILY_INFO':
    case 'FAMILY_MEMORIES':
      return 'FAMILY';
    case 'WHO_AM_I':
    case 'PATIENT_AGE':
    case 'PERSON_QUERY':
      return 'PATIENT';
    case 'WHERE_AM_I':
    case 'PATIENT_HOME':
      return 'LOCATION';
    case 'TODAY_PLAN':
      return 'ROUTINE';
    case 'NEXT_REMINDER':
      return 'REMINDER';
    case 'APPOINTMENT_QUERY':
      return 'APPOINTMENT';
    case 'RECOMMEND_GAME':
      return 'GAME';
    case 'RECOMMEND_ACTIVITY':
      return 'ACTIVITY';
    case 'MEMORY_ABOUT_ME':
      return 'MEMORY';
    case 'FAVORITE_ACTIVITY':
    case 'FAVORITE_FOOD':
    case 'FAVORITE_MUSIC':
    case 'FAVORITE_COLOR':
    case 'PREFERENCE_QUERY':
      return 'PREFERENCE';
    case 'SCARED':
    case 'CONFUSED':
    case 'CANNOT_REMEMBER':
    case 'LONELY':
    case 'EMOTIONAL_SUPPORT':
      return 'EMOTION';
    case 'TIME_DEVICE_QUERY':
      return 'TIME';
    case 'DATE_DEVICE_QUERY':
      return 'DATE';
    case 'FAQ_DEMENTIA':
    case 'FAQ_MEMORY':
    case 'FAQ_REMINDERS':
    case 'FAQ_RELAX':
    case 'FAQ_WORRY':
    case 'GENERAL_KNOWLEDGE':
      return 'GENERAL_KNOWLEDGE';
    case 'SIMPLE_REASONING':
      return 'REASONING';
    case 'GREETING':
    case 'GOOD_MORNING':
    case 'GOOD_NIGHT':
    case 'THANK_YOU':
    case 'REPEAT':
    case 'REPEAT_PATIENT':
    case 'WHAT_ELSE':
    case 'TELL_JOKE':
    case 'TELL_STORY':
      return 'GENERAL_CONVERSATION';
    default:
      return 'UNKNOWN';
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
    ? {
        ...currentState,
        history: Array.isArray(currentState.history) ? [...currentState.history] : [],
        observedPreferences: { ...(currentState.observedPreferences || {}) },
      }
    : createInitialConversationState();

  state.interactionCount = (state.interactionCount || 0) + 1;

  const topic = intentToTopic(intent);
  const category = intentToCategory(intent);

  const turn: ConversationTurn = {
    query,
    normalizedQuery,
    intent,
    response,
    topic,
    category,
    entities,
    timestamp: Date.now(),
  };

  state.history.push(turn);
  if (state.history.length > MAX_HISTORY) {
    state.history.shift();
  }

  if (topic !== 'UNKNOWN') {
    state.previousTopic = topic;
  }
  state.previousCategory = category;
  state.previousIntent = intent;

  if (entities && Object.keys(entities).length > 0) {
    state.previousEntities = { ...state.previousEntities, ...entities };
    if (entities.person) state.lastMentionedPerson = entities.person;
    if (entities.medicine) state.lastMentionedMedicine = entities.medicine;
  }

  return state;
}
