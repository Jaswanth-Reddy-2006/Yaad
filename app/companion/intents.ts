import {
  CompanionIntent,
  CompanionTopic,
  QuestionCategory,
  ConfidenceLevel,
  ConversationState,
  ExtractedEntities,
  MatchEvaluation,
  QuestionType,
} from './types';

export {
  CompanionIntent,
  CompanionTopic,
  QuestionCategory,
  ConfidenceLevel,
  ConversationState,
  ExtractedEntities,
  MatchEvaluation,
  QuestionType,
};
import {
  CONTRACTIONS,
  COMMON_TYPOS,
  SYNONYM_GROUPS,
  STT_FILLERS,
} from './synonyms';
import { intentToCategory } from './context';
import { getGeneralKnowledgeAnswer, resolveSimpleReasoning } from './knowledge';

/**
 * Normalizes input text for deterministic pattern matching:
 * 1. Converts to lower case
 * 2. Removes conversational STT filler prefixes
 * 3. Expands contractions
 * 4. Strips special characters
 * 5. Corrects common typos
 */
export function normalizeQuery(query: string): string {
  if (!query) return '';

  let text = query.toLowerCase().trim();

  // 1. Remove STT filler prefixes
  for (const fillerRegex of STT_FILLERS) {
    text = text.replace(fillerRegex, '').trim();
  }

  // 2. Expand contractions
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
    text = text.replace(regex, expansion);
  }

  // 3. Strip non-alphanumeric characters
  text = text.replace(/[^a-z0-9\s]/g, ' ');

  // 4. Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // 5. Correct typos token by token
  const words = text.split(' ').map((w) => COMMON_TYPOS[w] || w);
  text = words.join(' ');

  return text;
}

/**
 * Detects the QuestionType of a normalized query.
 */
export function detectQuestionType(normalizedQuery: string): QuestionType {
  if (!normalizedQuery) return 'UNKNOWN';

  if (/\b(scared|afraid|frightened|terrified|lonely|confused|lost|forgot|cannot\s+remember)\b/i.test(normalizedQuery)) {
    return 'EMOTIONAL';
  }
  if (/^(who|whose|who\s+is|who\s+takes|who\s+looks)\b/i.test(normalizedQuery)) {
    return 'WHO';
  }
  if (/^(when|what\s+time|at\s+what\s+time|is\s+it\s+time)\b/i.test(normalizedQuery)) {
    return 'WHEN';
  }
  if (/^(where|which\s+place|what\s+place)\b/i.test(normalizedQuery)) {
    return 'WHERE';
  }
  if (/^(why)\b/i.test(normalizedQuery)) {
    return 'WHY';
  }
  if (/^(how|how\s+can|how\s+do)\b/i.test(normalizedQuery)) {
    return 'HOW';
  }
  if (/^(which)\b/i.test(normalizedQuery)) {
    return 'WHICH';
  }
  if (/^(what)\b/i.test(normalizedQuery)) {
    return 'WHAT';
  }
  if (/^(is|do|am|can|should|will|are|have|did)\b/i.test(normalizedQuery)) {
    return 'YES_NO';
  }
  if (/\b(help|recommend|suggest|play|tell\s+me)\b/i.test(normalizedQuery)) {
    return 'REQUEST';
  }

  return 'STATEMENT';
}

/**
 * Detects the CompanionTopic of a normalized query.
 */
export function detectTopic(normalizedQuery: string): CompanionTopic {
  if (!normalizedQuery) return 'UNKNOWN';

  if (SYNONYM_GROUPS.SAFETY.some((k) => normalizedQuery.includes(k))) return 'SAFETY';
  if (SYNONYM_GROUPS.MEDICINE.some((k) => normalizedQuery.includes(k))) return 'MEDICINE';
  if (SYNONYM_GROUPS.CAREGIVER.some((k) => normalizedQuery.includes(k))) return 'CAREGIVER';
  if (SYNONYM_GROUPS.FAMILY.some((k) => normalizedQuery.includes(k))) return 'FAMILY';
  if (SYNONYM_GROUPS.PATIENT.some((k) => normalizedQuery.includes(k))) return 'PATIENT';
  if (SYNONYM_GROUPS.LOCATION.some((k) => normalizedQuery.includes(k))) return 'LOCATION';
  if (SYNONYM_GROUPS.APPOINTMENT.some((k) => normalizedQuery.includes(k))) return 'APPOINTMENT';
  if (SYNONYM_GROUPS.REMINDER.some((k) => normalizedQuery.includes(k))) return 'REMINDER';
  if (SYNONYM_GROUPS.PREFERENCE.some((k) => normalizedQuery.includes(k))) return 'PREFERENCE';
  if (SYNONYM_GROUPS.DATE.some((k) => normalizedQuery.includes(k))) return 'DATE';
  if (SYNONYM_GROUPS.TIME.some((k) => normalizedQuery.includes(k))) return 'TIME';
  if (SYNONYM_GROUPS.ROUTINE.some((k) => normalizedQuery.includes(k))) return 'ROUTINE';
  if (SYNONYM_GROUPS.GAME.some((k) => normalizedQuery.includes(k))) return 'GAME';
  if (SYNONYM_GROUPS.ACTIVITY.some((k) => normalizedQuery.includes(k))) return 'ACTIVITY';
  if (SYNONYM_GROUPS.MEMORY.some((k) => normalizedQuery.includes(k))) return 'MEMORY';
  if (SYNONYM_GROUPS.HELP.some((k) => normalizedQuery.includes(k))) return 'HELP';
  if (SYNONYM_GROUPS.EMOTION.some((k) => normalizedQuery.includes(k))) return 'EMOTION';
  if (SYNONYM_GROUPS.GENERAL_CONVERSATION.some((k) => normalizedQuery.includes(k))) return 'GENERAL_CONVERSATION';
  if (SYNONYM_GROUPS.FAQ.some((k) => normalizedQuery.includes(k))) return 'FAQ';

  return 'UNKNOWN';
}

/**
 * Detects if a query is asking for gameplay analysis, scores, progress, difficulty, or performance trends.
 */
export function isGameplayAnalysisQuery(normalizedQuery: string): boolean {
  const norm = normalizedQuery.toLowerCase();
  return (
    /\b(how\s+am\s+i\s+doing|how\s+did\s+i\s+do|how\s+is\s+(the\s+)?patient\s+doing|how\s+is\s+my\s+performance|how\s+is\s+their\s+performance)\b/i.test(norm) ||
    (/\b(score|scores|performance|perform|progress|improve|improving|improved|decline|declining|declined|worse|better|difficult|difficulty|hardest|harder|hard|easiest|easier|easy|mistake|mistakes|accuracy|attempts|good\s+at)\b/i.test(norm) &&
      /\b(game|games|session|sessions|memory|match|pair|triplet|cognitive)\b/i.test(norm)) ||
    /\b(which\s+game|what\s+game|what\s+games|which\s+games)\s+.*(difficult|hard|hardest|easy|easiest|good\s+at|trouble|struggle)/i.test(norm) ||
    /\b(are\s+(my|their|the)\s+scores|has\s+(my|their|the)\s+performance|show\s+(me\s+)?(my|their|recent)\s+performance|show\s+(me\s+)?(my|their|recent)\s+game)/i.test(norm) ||
    /\b(cognitive\s+areas|game\s+history|game\s+performance|game\s+results|recent\s+games)\b/i.test(norm)
  );
}

/**
 * Extracts lightweight entities from query text.
 */
export function extractEntities(normalizedQuery: string): ExtractedEntities {
  const entities: ExtractedEntities = {};

  if (/\b(morning|breakfast)\b/i.test(normalizedQuery)) entities.timeSlot = 'morning';
  else if (/\b(afternoon|lunch|noon)\b/i.test(normalizedQuery)) entities.timeSlot = 'afternoon';
  else if (/\b(evening|tea\s+time|dusk)\b/i.test(normalizedQuery)) entities.timeSlot = 'evening';
  else if (/\b(night|bedtime|sleep)\b/i.test(normalizedQuery)) entities.timeSlot = 'night';

  if (/\b(today)\b/i.test(normalizedQuery)) entities.dateType = 'today';
  else if (/\b(tomorrow)\b/i.test(normalizedQuery)) entities.dateType = 'tomorrow';

  if (/\b(morning\s+medicine|morning\s+pill|morning\s+tablet)\b/i.test(normalizedQuery)) {
    entities.medicine = 'Morning Medicine';
  } else if (/\b(evening\s+medicine|evening\s+pill|evening\s+tablet)\b/i.test(normalizedQuery)) {
    entities.medicine = 'Evening Medicine';
  }

  if (/\b(scared|afraid|frightened)\b/i.test(normalizedQuery)) entities.emotion = 'scared';
  else if (/\b(confused|lost)\b/i.test(normalizedQuery)) entities.emotion = 'confused';
  else if (/\b(lonely|alone)\b/i.test(normalizedQuery)) entities.emotion = 'lonely';

  // Pronouns
  if (/\b(she|her)\b/i.test(normalizedQuery)) entities.pronoun = 'she';
  else if (/\b(he|him)\b/i.test(normalizedQuery)) entities.pronoun = 'he';
  else if (/\b(it|that)\b/i.test(normalizedQuery)) entities.pronoun = 'it';
  else if (/\b(they|them)\b/i.test(normalizedQuery)) entities.pronoun = 'they';

  // Preferences
  if (/\b(food|eat|dish|meal)\b/i.test(normalizedQuery)) entities.preferenceType = 'food';
  else if (/\b(music|song|listen)\b/i.test(normalizedQuery)) entities.preferenceType = 'music';
  else if (/\b(color|colour)\b/i.test(normalizedQuery)) entities.preferenceType = 'color';
  else if (/\b(activity|hobby|hobbies|fun|do)\b/i.test(normalizedQuery)) entities.preferenceType = 'activity';

  return entities;
}

/**
 * Context-aware follow-up resolver for short queries and pronoun references.
 */
function resolveFollowUp(
  normalizedQuery: string,
  state?: ConversationState
): { intent: CompanionIntent; confidence: number } | null {
  if (!state) return null;
  const lastTurn = state.history && state.history.length > 0 ? state.history[state.history.length - 1] : undefined;
  const topic = state.previousTopic || (state as any).lastTopic || lastTurn?.topic;
  const prevIntent = state.previousIntent || (state as any).lastIntent || lastTurn?.intent;

  // Repetition follow-ups
  if (/^(what\s+was\s+that\s+again|tell\s+me\s+again|say\s+that\s+again|who\s+was\s+that\s+again|what\s+did\s+you\s+say|repeat|i\s+forgot\s+what\s+you\s+said|say\s+that\s+once\s+more)$/i.test(normalizedQuery)) {
    if (prevIntent && prevIntent !== 'REPEAT' && prevIntent !== 'UNKNOWN') {
      return { intent: prevIntent, confidence: 0.95 };
    }
    return { intent: 'REPEAT', confidence: 0.95 };
  }

  // Multi-turn extension: "What else?" or "What other things?"
  if (/^(what\s+else|what\s+other\s+things?|anything\s+else|tell\s+me\s+more|and\s+then)$/i.test(normalizedQuery)) {
    return { intent: 'WHAT_ELSE', confidence: 0.95 };
  }

  // Medicine context follow-ups
  if (topic === 'MEDICINE') {
    if (/^(what\s+time|when|what\s+time\s+is\s+it|when\s+is\s+it|is\s+it\s+time|when\s+do\s+i\s+take\s+it|when\s+should\s+i\s+take\s+it|when\s+to\s+take\s+it)$/i.test(normalizedQuery)) {
      return { intent: 'NEXT_MEDICINE', confidence: 0.95 };
    }
    if (/^(what\s+is\s+it|which\s+one|what\s+pill|what\s+medicine|which|what\s+is\s+it\s+called|what\s+was\s+my\s+medicine\s+called\s+again|what\s+is\s+that)$/i.test(normalizedQuery)) {
      return { intent: 'WHAT_MEDICINE', confidence: 0.95 };
    }
    if (/^(how\s+much|how\s+many|dosage|how\s+much\s+should\s+i\s+take)$/i.test(normalizedQuery)) {
      return { intent: 'MEDICINE_DOSAGE', confidence: 0.95 };
    }
    if (/^(did\s+i\s+take\s+it|have\s+i\s+taken\s+it|did\s+i\s+take\s+my\s+medicine)$/i.test(normalizedQuery)) {
      return { intent: 'MEDICINE_TAKEN_QUERY', confidence: 0.92 };
    }
  }

  // Caregiver context follow-ups
  if (topic === 'CAREGIVER') {
    if (/^(where\s+is\s+she|where\s+is\s+he|where\s+are\s+they|where|where\s+does\s+she\s+live|where\s+does\s+he\s+live)$/i.test(normalizedQuery)) {
      return { intent: 'WHERE_IS_CAREGIVER', confidence: 0.95 };
    }
    if (/^(who\s+is\s+she|who\s+is\s+he|what\s+is\s+her\s+name|what\s+is\s+his\s+name|who\s+was\s+that\s+person|tell\s+me\s+about\s+(him|her))$/i.test(normalizedQuery)) {
      return { intent: 'WHO_IS_CAREGIVER', confidence: 0.95 };
    }
    if (/^(how\s+can\s+i\s+contact\s+her|how\s+to\s+call\s+her|how\s+can\s+i\s+call\s+her|contact\s+her|phone\s+number|can\s+i\s+call\s+them)$/i.test(normalizedQuery)) {
      return { intent: 'CONTACT_CAREGIVER', confidence: 0.95 };
    }
  }

  // Appointment context follow-ups
  if (topic === 'APPOINTMENT' || prevIntent === 'APPOINTMENT_QUERY' || prevIntent === 'TODAY_PLAN') {
    if (/^(where|where\s+is\s+it|what\s+place)$/i.test(normalizedQuery)) {
      return { intent: 'APPOINTMENT_QUERY', confidence: 0.95 };
    }
    if (/^(who\s+is\s+coming\s+with\s+me|who\s+will\s+come|who\s+is\s+accompanying\s+me|is\s+anyone\s+coming)$/i.test(normalizedQuery)) {
      return { intent: 'APPOINTMENT_QUERY', confidence: 0.95 };
    }
    if (/^(when|what\s+time|what\s+time\s+is\s+it)$/i.test(normalizedQuery)) {
      return { intent: 'APPOINTMENT_QUERY', confidence: 0.95 };
    }
  }

  return null;
}

interface IntentRuleDef {
  intent: CompanionIntent;
  priority: number;
  exactMatches?: string[];
  patterns?: RegExp[];
}

const INTENT_RULES: IntentRuleDef[] = [
  // Safety Critical Alerts (Highest Priority = 150)
  {
    intent: 'SAFETY_ALERT',
    priority: 150,
    exactMatches: [
      'i took too much medicine',
      'i took my medicine twice',
      'i may have taken my medicine twice',
      'i fell',
      'i fell down',
      'i am hurt',
      'i hurt myself',
      'i cannot breathe',
      'cant breathe',
      'my chest hurts',
      'chest pain',
      'i need help emergency',
      'emergency help',
      'call an ambulance',
      'i am trapped',
      'i took two doses of my medicine',
    ],
    patterns: [
      /\b(took|take)\s+(too\s+much|extra|double|twice|two\s+doses)\s+(medicine|medicines|pill|pills|tablet|tablets|dose)\b/i,
      /\b(may\s+have\s+)?taken\s+(my\s+)?(medicine|pills|tablets)\s+(twice|two\s+doses)\b/i,
      /\b(fell\s+down|i\s+fell|i\s+am\s+hurt|hurt\s+myself|fell\s+on\s+the\s+floor)\b/i,
      /\b(cannot|can\s+not|cant)\s+breathe\b/i,
      /\b(chest\s+hurts|chest\s+pain|heart\s+attack|shortness\s+of\s+breath)\b/i,
      /\b(emergency|call\s+ambulance|severe\s+pain)\b/i,
    ],
  },

  // Medication Safety / Taken check
  {
    intent: 'MEDICINE_TAKEN_QUERY',
    priority: 96,
    exactMatches: [
      'i do not remember if i took my medicine',
      'did i take my medicine',
      'have i taken my pills',
      'did i take my pill',
      'did i take my medicine today',
      'did i take my pills',
    ],
    patterns: [
      /\b(did|have)\s+i\s+(taken|take)\s+(my\s+)?(medicine|pill|pills|tablet|tablets)\b/i,
      /\bi\s+do\s+not\s+remember\s+if\s+i\s+took\s+my\s+medicine\b/i,
    ],
  },

  // Device Time & Date Queries
  {
    intent: 'TIME_DEVICE_QUERY',
    priority: 95,
    exactMatches: ['what time is it', 'what is the time', 'tell me the time', 'current time', 'what time is it now', 'what time it is'],
    patterns: [
      /\b(what\s+time\s+is\s+it|tell\s+me\s+the\s+time|current\s+time|what\s+is\s+the\s+time)\b/i,
    ],
  },
  {
    intent: 'DATE_DEVICE_QUERY',
    priority: 95,
    exactMatches: ['what day is today', 'what is the date', 'what day is it', 'what is today', 'current date', 'which day is today'],
    patterns: [
      /\b(what\s+day\s+is\s+(it|today)|what\s+is\s+the\s+date|current\s+date|which\s+day\s+is\s+today)\b/i,
    ],
  },

  // Personal Identity & Age & Home
  {
    intent: 'WHO_AM_I',
    priority: 88,
    exactMatches: [
      'who am i',
      'what is my name',
      'who i am',
      'tell me my name',
      'my name',
      'what am i called',
      'what do people call me',
      'can you tell me my name',
      'remind me of my name',
      'remind me my name',
      'can you remind me who i am',
      'what my name is',
      'what is my name again',
      'what was my name again',
      'i forgot my name',
    ],
    patterns: [
      /\bwho\s+am\s+i\b/i,
      /\b(what\s+is|tell\s+me|remind\s+me\s+of|what)\s+(my\s+)?name(\s+is)?(\s+again)?\b/i,
      /\bwhat\s+(am\s+i\s+called|do\s+people\s+call\s+me)\b/i,
      /\b(who\s+i\s+am|what\s+my\s+name\s+is)\b/i,
    ],
  },
  {
    intent: 'PATIENT_AGE',
    priority: 86,
    exactMatches: ['how old am i', 'what is my age', 'my age'],
    patterns: [/\b(how\s+old\s+am\s+i|what\s+is\s+my\s+age)\b/i],
  },
  {
    intent: 'WHERE_AM_I',
    priority: 85,
    exactMatches: ['where am i', 'which place is this', 'what place is this', 'where are we', 'am i home', 'what is this place', 'this place'],
    patterns: [/\bwhere\s+(am\s+i|are\s+we)\b/i, /\b(what|which)\s+place\s+is\s+this\b/i, /\bthis\s+place\b/i],
  },

  // Caregiver Queries & Contact
  {
    intent: 'WHO_IS_CAREGIVER',
    priority: 88,
    exactMatches: [
      'who is my caregiver',
      'who looks after me',
      'who takes care of me',
      'who is taking care of me',
      'who is my helper',
      'who is my carer',
      'who helps me',
      'caregiver name',
      'caregiver',
      'who is looking after me',
      'can you tell me who takes care of me',
      'person helping me',
      'person that looks after me',
      'who was that person you mentioned',
      'who is she',
      'who is he',
      'who was that again',
      'tell me about him',
      'tell me about her',
      'i cannot remember who looks after me',
      'i cannot remember who she is',
      'i forgot who takes care of me',
    ],
    patterns: [
      /\bwho\s+(is\s+my\s+caregiver|is\s+my\s+carer|takes\s+care\s+of\s+me|looks\s+after\s+me|is\s+helping\s+me|helps\s+me|is\s+looking\s+after\s+me)\b/i,
      /\bwho\s+is\s+the\s+person\s+(that\s+)?(takes\s+care|looks\s+after|helps)\b/i,
      /\bwho\s+was\s+that\s+(person|one)\b/i,
      /\bwho\s+is\s+(she|he)\b/i,
      /\btell\s+me\s+about\s+(him|her)\b/i,
    ],
  },
  {
    intent: 'WHERE_IS_CAREGIVER',
    priority: 84,
    exactMatches: ['where is my caregiver', 'where is caregiver', 'where is she', 'where is he', 'where does she live'],
    patterns: [/\bwhere\s+(is|does)\s+(my\s+)?(caregiver|carer|nurse|helper|she|he)(\s+live)?\b/i],
  },
  {
    intent: 'CONTACT_CAREGIVER',
    priority: 84,
    exactMatches: [
      'how can i contact my caregiver',
      'call my caregiver',
      'how can i call her',
      'how can i contact her',
      'how can i contact him',
      'can i call them',
      'contact caregiver',
      'caregiver phone number',
      'phone number of caregiver',
    ],
    patterns: [
      /\b(how\s+can\s+i\s+)?(contact|call)\s+(my\s+)?(caregiver|carer|her|him|them)\b/i,
      /\bcaregiver\s+(phone|number|contact)\b/i,
      /\bcan\s+i\s+call\s+(her|him|them)\b/i,
    ],
  },

  // Family Info & Memories
  {
    intent: 'FAMILY_INFO',
    priority: 84,
    exactMatches: [
      'tell me about my family',
      'who is in my family',
      'do i have family',
      'do i have any children',
      'who are my children',
      'who are my relatives',
      'my family',
      'family',
    ],
    patterns: [
      /\b(about\s+my\s+family|who\s+is\s+in\s+my\s+family|do\s+i\s+have\s+(any\s+)?(family|children|relatives|kids)|my\s+family|who\s+are\s+my\s+(children|relatives|family)|my\s+daughter|my\s+son|family)\b/i,
    ],
  },

  // Appointments
  {
    intent: 'APPOINTMENT_QUERY',
    priority: 82,
    exactMatches: [
      'what is my next appointment',
      'do i have an appointment',
      'when is my appointment',
      'when is my doctor appointment',
      'where is my appointment',
      'did you say my appointment is today',
      'appointment today',
      'what appointments do i have today',
      'clinic appointment time',
      'who is coming with me to the doctor',
      'who is coming with me',
      'is anita coming with me',
      'doctor',
    ],
    patterns: [
      /\b(appointment|appointments|clinic\s+visit|doctor\s+visit|see\s+the\s+doctor|doctor)\b/i,
      /\bis\s+.*coming\s+with\s+me\b/i,
    ],
  },

  // Medication Routine & Details & Dosage
  {
    intent: 'NEXT_MEDICINE',
    priority: 88,
    exactMatches: [
      'when is my medicine',
      'when do i take my medicine',
      'what time is my medicine',
      'when should i take medicine',
      'when should i take my pills',
      'when is my medication',
      'when is my pill',
      'medicine time',
      'tablet time',
      'medicine now',
      'next pill',
      'when do i take it',
      'when to take medicines',
      'when is my next dose',
      'what time do i take my medicine',
      'is it time for my medicine',
      'is it time to take my medicine',
      'do i need to take my medicine now',
      'do i need to take my medicine',
      'can you tell me again when i take my pills',
    ],
    patterns: [
      /\b(when|what\s+time|is\s+it\s+time)\s+(is|do\s+i\s+take|should\s+i\s+take|to\s+take|for)?\s*(my\s+)?(medicine|medicines|pill|pills|tablet|tablets|dose|medication)\b/i,
      /\bdo\s+i\s+(need\s+to\s+)?take\s+my\s+(medicine|tablet|pill|medication)\b/i,
      /\bnext\s+pill\b/i,
      /\bwhen\s+do\s+i\s+take\s+it\b/i,
    ],
  },
  {
    intent: 'WHAT_MEDICINE',
    priority: 85,
    exactMatches: [
      'what medicine do i take',
      'which medicine do i take',
      'what is my medicine',
      'what pills do i take',
      'what pills am i supposed to take',
      'what tablet should i take',
      'my medicine',
      'what is that',
      'what was my medicine called again',
      'i forgot what medicine i take',
    ],
    patterns: [
      /\b(what|which)\s+(medicine|medicines|pills|pill|tablet|tablets|medication)\s+(do\s+i\s+take|is|are|should\s+i\s+take|am\s+i\s+supposed\s+to\s+take|called)\b/i,
      /\bwhat\s+was\s+my\s+medicine\s+called(\s+again)?\b/i,
    ],
  },
  {
    intent: 'MEDICINE_DOSAGE',
    priority: 82,
    exactMatches: ['what is my dosage', 'how much medicine do i take', 'dosage of my medicine', 'how many pills do i take'],
    patterns: [/\b(dosage|how\s+much\s+medicine|how\s+many\s+pills)\b/i],
  },

  // Reminders & Schedule
  {
    intent: 'NEXT_REMINDER',
    priority: 78,
    exactMatches: [
      'what is my next reminder',
      'next reminder',
      'do i have a reminder',
      'any upcoming reminders',
      'what should i do next',
      'what is next',
      'what next',
      'what comes next',
      'what now',
      'what do i need to do',
      'what am i supposed to do',
      'do i have anything scheduled',
      'what is scheduled today',
      'remind me what i need to do',
      'what do i have to do after lunch',
      'what do i have today',
    ],
    patterns: [
      /\b(next\s+reminder|upcoming\s+reminder|do\s+i\s+have\s+a\s+reminder)\b/i,
      /\bwhat\s+(should|do)\s+i\s+(need\s+to\s+)?do\s+(next|now|after\s+lunch|today)\b/i,
      /\bwhat\s+(comes\s+next|is\s+scheduled|am\s+i\s+supposed\s+to\s+do|do\s+i\s+have\s+today)\b/i,
    ],
  },
  {
    intent: 'TODAY_PLAN',
    priority: 70,
    exactMatches: [
      'what is today plan',
      'what is todays plan',
      'what is my plan for today',
      'schedule for today',
      'today schedule',
      'what am i doing today',
      'i do not know what i am doing today',
      'what is my routine',
      'my routine',
    ],
    patterns: [
      /\b(today\s+plan|plan\s+for\s+today|today\s+schedule|schedule\s+for\s+today|what\s+am\s+i\s+doing\s+today|my\s+routine|what\s+is\s+my\s+routine)\b/i,
    ],
  },

  // Personal Memories & Preferences
  {
    intent: 'MEMORY_ABOUT_ME',
    priority: 92,
    exactMatches: [
      'what do you remember about me',
      'tell me something you remember about me',
      'tell me something you remember',
      'do you remember me',
      'tell me about myself',
      'about myself',
      'what do you know about me',
      'tell me one of my memories',
      'one of my memories',
      'tell me my memories',
      'my memories',
      'remember me',
    ],
    patterns: [
      /\b(what\s+do\s+you\s+remember|something\s+you\s+remember|about\s+myself|know\s+about\s+me|one\s+of\s+my\s+memories|my\s+memories)\b/i,
      /\b(do\s+you\s+remember\s+me|remember\s+about\s+me)\b/i,
    ],
  },
  {
    intent: 'FAVORITE_ACTIVITY',
    priority: 82,
    exactMatches: ['what is my favorite activity', 'what do i like to do', 'what do i like', 'my favorite hobby', 'what are my hobbies'],
    patterns: [/\b(favorite\s+activity|what\s+do\s+i\s+like\s+to\s+do|my\s+hobby|my\s+hobbies)\b/i],
  },
  {
    intent: 'FAVORITE_FOOD',
    priority: 82,
    exactMatches: ['what is my favorite food', 'what do i like to eat', 'what food do i like', 'my favorite dish'],
    patterns: [/\b(favorite\s+food|like\s+to\s+eat|what\s+food\s+do\s+i\s+like|favorite\s+dish)\b/i],
  },
  {
    intent: 'FAVORITE_MUSIC',
    priority: 82,
    exactMatches: ['what is my favorite music', 'what songs do i like', 'my favorite songs'],
    patterns: [/\b(favorite\s+music|favorite\s+song|songs\s+do\s+i\s+like)\b/i],
  },
  {
    intent: 'FAVORITE_COLOR',
    priority: 82,
    exactMatches: ['what is my favorite color', 'what is my favourite colour', 'what color do i like'],
    patterns: [/\b(favorite\s+color|favourite\s+colour|what\s+color\s+do\s+i\s+like)\b/i],
  },

  // Games & Activities
  {
    intent: 'RECOMMEND_GAME',
    priority: 75,
    exactMatches: ['recommend a game', 'suggest a game', 'i want to play a game', 'let us play a game', 'can we play a game', 'can we play', 'play game'],
    patterns: [/\b(recommend|suggest|play|want)\s+(a\s+)?(game|memory\s+game|puzzle)\b/i, /\bcan\s+we\s+play\b/i],
  },
  {
    intent: 'RECOMMEND_ACTIVITY',
    priority: 72,
    exactMatches: [
      'recommend an activity',
      'suggest an activity',
      'what can i do',
      'i am bored',
      'give me something to do',
      'suggest something fun',
      'what can i do for fun',
      'something to do',
      'entertain me',
      'what can i do now',
    ],
    patterns: [
      /\b(recommend|suggest)\s+(an\s+)?activity\b/i,
      /\bwhat\s+can\s+i\s+do(\s+for\s+fun|\s+now)?\b/i,
      /\b(give\s+me\s+)?something\s+to\s+do\b/i,
      /\bi\s+am\s+bored\b/i,
    ],
  },

  // Emotional Reassurance
  {
    intent: 'SCARED',
    priority: 95,
    exactMatches: ['i am scared', 'i am afraid', 'i feel scared', 'i feel afraid', 'i am frightened', 'scared', 'afraid', 'i feel worried', 'i am worried'],
    patterns: [/\b(scared|afraid|frightened|terrified|fear|panic|worried|anxious)\b/i],
  },
  {
    intent: 'LONELY',
    priority: 92,
    exactMatches: [
      'i am alone',
      'nobody is here',
      'no one is here',
      'i am lonely',
      'i feel lonely',
      'i feel sad',
      'i am sad',
      'where is everybody',
      'where is everyone',
      'all by myself',
      'i miss my family',
    ],
    patterns: [/\b(nobody|no\s+one)\s+is\s+here\b/i, /\bi\s+(am|feel)\s+(alone|lonely|sad|by\s+myself)\b/i, /\bi\s+miss\s+my\s+family\b/i],
  },
  {
    intent: 'CANNOT_REMEMBER',
    priority: 84,
    exactMatches: [
      'i cannot remember',
      'i can not remember',
      'i forgot',
      'i do not remember',
      'i lost my memory',
      'i cannot recall',
      'why am i here',
    ],
    patterns: [/\b(cannot|can\s+not|cant|do\s+not|dont)\s+(remember|recall)\b/i, /^i\s+forgot$/i],
  },
  {
    intent: 'CONFUSED',
    priority: 88,
    exactMatches: [
      'i am confused',
      'i feel confused',
      'i do not understand',
      'i am lost',
      'everything is confusing',
      'i do not know what to do',
      'dont know what to do',
      'i am a bit confused',
    ],
    patterns: [/\b(confused|lost|dont understand|do not understand|disoriented|dont\s+know\s+what\s+to\s+do|a\s+bit\s+confused)\b/i],
  },
  {
    intent: 'NEEDS_HELP',
    priority: 86,
    exactMatches: ['help', 'help me', 'i need help', 'can you help me', 'please help me', 'please help', 'can someone help me', 'i need someone', 'assistance'],
    patterns: [/\b(help\s+me|need\s+help|need\s+assistance|can\s+you\s+help|call\s+help|can\s+someone\s+help)\b/i],
  },

  // Entertainment / Stories / Jokes
  {
    intent: 'TELL_JOKE',
    priority: 85,
    exactMatches: ['tell me a joke', 'tell a joke', 'say a joke', 'tell me a simple joke', 'make me laugh with a joke', 'joke'],
    patterns: [/\b(tell|say|make\s+me\s+laugh|crack)?\s*(me\s+)?(a\s+)?joke\b/i],
  },
  {
    intent: 'TELL_STORY',
    priority: 85,
    exactMatches: ['tell me a story', 'tell a story', 'tell me a short story', 'can you tell me a story', 'story'],
    patterns: [/\b(tell|read|share)\s+(me\s+)?(a\s+)?(short\s+)?story\b/i, /\b(a\s+)?story\b/i],
  },
  {
    intent: 'WHAT_ELSE',
    priority: 80,
    exactMatches: ['what else', 'what else can i do', 'tell me more', 'anything else', 'what else is there', 'and then'],
    patterns: [/\b(what\s+else|anything\s+else|tell\s+me\s+more|and\s+then)\b/i],
  },

  // Local Knowledge FAQ Layer
  {
    intent: 'FAQ_DEMENTIA',
    priority: 90,
    exactMatches: ['what is dementia', 'explain dementia', 'tell me about dementia'],
    patterns: [/\b(what\s+is\s+dementia|explain\s+dementia|tell\s+me\s+about\s+dementia)\b/i],
  },
  {
    intent: 'FAQ_MEMORY',
    priority: 90,
    exactMatches: ['what is a memory', 'what is memory', 'explain memory'],
    patterns: [/\b(what\s+is\s+(a\s+)?memory|explain\s+memory)\b/i],
  },
  {
    intent: 'FAQ_REMINDERS',
    priority: 90,
    exactMatches: ['why do i need reminders', 'why reminders', 'purpose of reminders'],
    patterns: [/\bwhy\s+(do\s+i\s+need|have)\s+reminders\b/i],
  },
  {
    intent: 'FAQ_RELAX',
    priority: 90,
    exactMatches: ['how can i relax', 'how to relax', 'ways to relax'],
    patterns: [/\bhow\s+(can\s+i|to)\s+relax\b/i],
  },
  {
    intent: 'FAQ_WORRY',
    priority: 90,
    exactMatches: ['what if i am worried', 'what to do if worried', 'i am worried'],
    patterns: [/\b(what\s+if\s+i\s+am\s+worried|what\s+to\s+do\s+if\s+worried)\b/i],
  },

  // Etiquette & Repeat
  {
    intent: 'GOOD_MORNING',
    priority: 80,
    exactMatches: ['good morning', 'morning', 'very good morning'],
    patterns: [/\bgood\s+morning\b/i],
  },
  {
    intent: 'GOOD_NIGHT',
    priority: 80,
    exactMatches: ['good night', 'night', 'sleep well', 'going to sleep', 'bye', 'goodbye', 'see you later'],
    patterns: [/\b(good\s+night|sleep\s+well|going\s+to\s+sleep|bye|goodbye)\b/i],
  },
  {
    intent: 'THANK_YOU',
    priority: 75,
    exactMatches: ['thank you', 'thanks', 'thank u', 'thanks a lot', 'thank you so much'],
    patterns: [/\b(thank\s+you|thanks|thanku)\b/i],
  },
  {
    intent: 'GREETING',
    priority: 70,
    exactMatches: ['hello', 'hi', 'hey', 'namaste', 'halo', 'greetings', 'hi companion', 'good afternoon', 'afternoon'],
    patterns: [/\b(hello|hi|hey|namaste|good\s+afternoon)\b/i],
  },
  {
    intent: 'REPEAT',
    priority: 75,
    exactMatches: [
      'repeat',
      'say that again',
      'what did you say',
      'can you repeat that',
      'pardon',
      'what was that again',
      'tell me again',
      'i forgot what you said',
      'say that once more',
    ],
    patterns: [
      /\b(repeat|say\s+that\s+again|what\s+did\s+you\s+say|can\s+you\s+repeat|tell\s+me\s+again|what\s+was\s+that\s+again|forgot\s+what\s+you\s+said|say\s+that\s+once\s+more|pardon)\b/i,
    ],
  },
];

/**
 * Evaluates a single clause against rules, general knowledge, and simple reasoning.
 */
function evaluateClause(
  clause: string,
  state?: ConversationState
): MatchEvaluation {
  const qType = detectQuestionType(clause);
  const topic = detectTopic(clause);

  if (!clause || clause.length === 0) {
    return { intent: 'UNKNOWN', confidence: 0, questionType: qType, topic, category: 'UNKNOWN' };
  }

  // Check follow-ups first
  const fu = resolveFollowUp(clause, state);
  if (fu) {
    const category = intentToCategory(fu.intent);
    return { ...fu, questionType: qType, topic, category, entities: extractEntities(clause) };
  }

  // Check Simple Reasoning engine
  const reasoningAns = resolveSimpleReasoning(clause);
  if (reasoningAns) {
    return {
      intent: 'SIMPLE_REASONING',
      confidence: 0.95,
      questionType: qType,
      topic: 'REASONING',
      category: 'SIMPLE_REASONING',
      entities: extractEntities(clause),
    };
  }

  // Check General Knowledge database
  const gkAns = getGeneralKnowledgeAnswer(clause);
  if (gkAns) {
    return {
      intent: 'GENERAL_KNOWLEDGE',
      confidence: 0.95,
      questionType: qType,
      topic: 'GENERAL_KNOWLEDGE',
      category: 'GENERAL_KNOWLEDGE',
      entities: extractEntities(clause),
    };
  }

  let bestIntent: CompanionIntent = 'UNKNOWN';
  let highestScore = 0;

  for (const rule of INTENT_RULES) {
    let score = 0;

    if (rule.exactMatches && rule.exactMatches.includes(clause)) {
      score = 120 + rule.priority;
    } else if (rule.patterns) {
      for (const pattern of rule.patterns) {
        if (pattern.test(clause)) {
          if (rule.intent === 'RECOMMEND_GAME' && isGameplayAnalysisQuery(clause)) {
            continue;
          }
          score = 80 + rule.priority;
          break;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestIntent = rule.intent;
    }
  }

  // Topic/QuestionType fallback synthesis if no pattern triggered
  if (highestScore < 60) {
    if (topic === 'MEDICINE' && (qType === 'WHEN' || qType === 'YES_NO')) {
      bestIntent = 'NEXT_MEDICINE';
      highestScore = 140;
    } else if (topic === 'MEDICINE' && (qType === 'WHAT' || qType === 'WHICH')) {
      bestIntent = 'WHAT_MEDICINE';
      highestScore = 140;
    } else if (topic === 'CAREGIVER' && qType === 'WHO') {
      bestIntent = 'WHO_IS_CAREGIVER';
      highestScore = 140;
    } else if (topic === 'CAREGIVER' && qType === 'WHERE') {
      bestIntent = 'WHERE_IS_CAREGIVER';
      highestScore = 140;
    } else if (topic === 'LOCATION' && qType === 'WHERE') {
      bestIntent = 'WHERE_AM_I';
      highestScore = 140;
    } else if (topic === 'PATIENT' && qType === 'WHO') {
      bestIntent = 'WHO_AM_I';
      highestScore = 140;
    } else if (topic === 'TIME' && qType === 'WHAT') {
      bestIntent = 'TIME_DEVICE_QUERY';
      highestScore = 145;
    } else if (topic === 'DATE' && (qType === 'WHAT' || qType === 'WHICH')) {
      bestIntent = 'DATE_DEVICE_QUERY';
      highestScore = 145;
    } else if (topic === 'GAME') {
      if (!isGameplayAnalysisQuery(clause)) {
        bestIntent = 'RECOMMEND_GAME';
        highestScore = 130;
      }
    } else if (topic === 'ACTIVITY') {
      bestIntent = 'RECOMMEND_ACTIVITY';
      highestScore = 130;
    } else if (topic === 'PREFERENCE') {
      bestIntent = 'PREFERENCE_QUERY';
      highestScore = 130;
    } else if (topic === 'APPOINTMENT') {
      bestIntent = 'APPOINTMENT_QUERY';
      highestScore = 135;
    } else if (topic === 'EMOTION') {
      if (clause.includes('scared') || clause.includes('afraid')) bestIntent = 'SCARED';
      else if (clause.includes('lonely') || clause.includes('alone')) bestIntent = 'LONELY';
      else if (clause.includes('forgot') || clause.includes('remember')) bestIntent = 'CANNOT_REMEMBER';
      else bestIntent = 'CONFUSED';
      highestScore = 135;
    }
  }

  // Handle low-confidence / ambiguous questions with targeted clarification fallback
  if (highestScore < 50) {
    if (topic === 'MEDICINE' || /^(what\s+should\s+i\s+take|what\s+to\s+take)$/i.test(clause)) {
      return {
        intent: 'CLARIFICATION_NEEDED',
        confidence: 0.65,
        questionType: qType,
        topic: 'MEDICINE',
        category: 'CLARIFICATION',
        entities: { clarificationTarget: 'MEDICINE' },
      };
    }
    if (topic === 'TIME' || clause === 'when') {
      return {
        intent: 'CLARIFICATION_NEEDED',
        confidence: 0.65,
        questionType: qType,
        topic: 'TIME',
        category: 'CLARIFICATION',
        entities: { clarificationTarget: 'TIME' },
      };
    }
    if (topic === 'CAREGIVER' || clause === 'who') {
      return {
        intent: 'CLARIFICATION_NEEDED',
        confidence: 0.65,
        questionType: qType,
        topic: 'CAREGIVER',
        category: 'CLARIFICATION',
        entities: { clarificationTarget: 'CAREGIVER' },
      };
    }
    return { intent: 'UNKNOWN', confidence: 0, questionType: qType, topic, category: 'UNKNOWN' };
  }

  const confidence = Math.min(Math.round((highestScore / 220) * 100) / 100, 1.0);
  const entities = extractEntities(clause);
  const category = intentToCategory(bestIntent);

  return { intent: bestIntent, confidence, questionType: qType, topic, category, entities };
}

/**
 * Main intent detector supporting question types, topics, multi-intent, entities, and context.
 */
export function detectIntent(
  normalizedQuery: string,
  state?: ConversationState
): MatchEvaluation {
  const qType = detectQuestionType(normalizedQuery);
  const topic = detectTopic(normalizedQuery);

  if (!normalizedQuery || normalizedQuery.length === 0) {
    return { intent: 'UNKNOWN', confidence: 0, questionType: qType, topic, category: 'UNKNOWN' };
  }

  // Multi-intent check
  if (/\b(and|as\s+well\s+as)\b/i.test(normalizedQuery)) {
    const parts = normalizedQuery
      .split(/\b(?:and|as\s+well\s+as)\b/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 2);

    if (parts.length === 2) {
      const match1 = evaluateClause(parts[0], state);
      const match2 = evaluateClause(parts[1], state);

      if (
        match1.intent !== 'UNKNOWN' &&
        match2.intent !== 'UNKNOWN' &&
        match1.intent !== match2.intent
      ) {
        return {
          intent: 'MULTI_INTENT',
          confidence: Math.round(((match1.confidence + match2.confidence) / 2) * 100) / 100,
          questionType: qType,
          topic,
          category: 'CONVERSATION',
          subIntents: [match1.intent, match2.intent],
          entities: { ...match1.entities, ...match2.entities },
        };
      }
    }
  }

  return evaluateClause(normalizedQuery, state);
}

