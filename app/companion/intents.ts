import {
  CompanionIntent,
  ConversationState,
  ExtractedEntities,
  MatchEvaluation,
} from './types';
import { CONTRACTIONS, COMMON_TYPOS, SYNONYM_GROUPS } from './synonyms';

/**
 * Normalizes input text for deterministic pattern matching.
 * - Converts to lower case
 * - Expands contractions
 * - Fixes common typos
 * - Strips special characters
 * - Collapses consecutive whitespace
 */
export function normalizeQuery(query: string): string {
  if (!query) return '';

  let text = query.toLowerCase().trim();

  // 1. Expand contractions
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
    text = text.replace(regex, expansion);
  }

  // 2. Strip punctuation and special characters
  text = text.replace(/[^a-z0-9\s]/g, ' ');

  // 3. Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // 4. Fix common typos word by word
  const words = text.split(' ').map((w) => COMMON_TYPOS[w] || w);
  text = words.join(' ');

  return text;
}

/**
 * Extracts lightweight entities from a normalized query.
 */
export function extractEntities(normalizedQuery: string): ExtractedEntities {
  const entities: ExtractedEntities = {};

  // Time slot detection
  if (/\b(morning|breakfast)\b/i.test(normalizedQuery)) {
    entities.timeSlot = 'morning';
  } else if (/\b(afternoon|lunch|noon)\b/i.test(normalizedQuery)) {
    entities.timeSlot = 'afternoon';
  } else if (/\b(evening|tea\s+time|dusk)\b/i.test(normalizedQuery)) {
    entities.timeSlot = 'evening';
  } else if (/\b(night|bedtime|sleep)\b/i.test(normalizedQuery)) {
    entities.timeSlot = 'night';
  }

  // Medicine entities
  if (/\b(morning\s+medicine|morning\s+pill|morning\s+tablet)\b/i.test(normalizedQuery)) {
    entities.medicine = 'Morning Medicine';
  } else if (/\b(evening\s+medicine|evening\s+pill|evening\s+tablet)\b/i.test(normalizedQuery)) {
    entities.medicine = 'Evening Medicine';
  } else if (/\b(memory\s+pill|memory\s+tablet|memory\s+medicine)\b/i.test(normalizedQuery)) {
    entities.medicine = 'Memory Pill';
  }

  // Emotion entities
  if (/\b(scared|afraid|frightened|terrified|fear)\b/i.test(normalizedQuery)) {
    entities.emotion = 'scared';
  } else if (/\b(confused|lost|disoriented)\b/i.test(normalizedQuery)) {
    entities.emotion = 'confused';
  } else if (/\b(lonely|alone)\b/i.test(normalizedQuery)) {
    entities.emotion = 'lonely';
  }

  return entities;
}

/**
 * Checks if a query is a short follow-up and resolves it using conversation state.
 */
function resolveFollowUp(
  normalizedQuery: string,
  state?: ConversationState
): MatchEvaluation | null {
  if (!state || !state.previousTopic) return null;

  const topic = state.previousTopic;

  // Follow-ups regarding Medicine
  if (topic === 'medicine') {
    if (/^(what\s+time|when|what\s+time\s+is\s+it|when\s+is\s+it|at\s+what\s+time)$/i.test(normalizedQuery)) {
      return { intent: 'NEXT_MEDICINE', confidence: 0.92 };
    }
    if (/^(what\s+is\s+it|which\s+one|what\s+pill|what\s+medicine|what\s+tablet|which)$/i.test(normalizedQuery)) {
      return { intent: 'WHAT_MEDICINE', confidence: 0.92 };
    }
  }

  // Follow-ups regarding Caregiver
  if (topic === 'caregiver') {
    if (/^(where\s+is\s+she|where\s+is\s+he|where\s+are\s+they|where\s+is\s+caregiver|where)$/i.test(normalizedQuery)) {
      return { intent: 'WHERE_IS_CAREGIVER', confidence: 0.9 };
    }
    if (/^(who\s+is\s+she|who\s+is\s+he|what\s+is\s+her\s+name|what\s+is\s+his\s+name)$/i.test(normalizedQuery)) {
      return { intent: 'WHO_IS_CAREGIVER', confidence: 0.9 };
    }
  }

  // Follow-ups regarding Schedule / Next task
  if (topic === 'schedule') {
    if (/^(what\s+next|what\s+else|then\s+what|after\s+that)$/i.test(normalizedQuery)) {
      return { intent: 'NEXT_REMINDER', confidence: 0.88 };
    }
  }

  return null;
}

interface IntentRuleDef {
  intent: CompanionIntent;
  priority: number;
  exactMatches?: string[];
  patterns?: RegExp[];
  keywordGroups?: string[][]; // Array of synonym group names
}

const ADVANCED_INTENT_RULES: IntentRuleDef[] = [
  // High-Priority Emotional & Reassurance Intents
  {
    intent: 'SCARED',
    priority: 95,
    exactMatches: ['i am scared', 'i am afraid', 'i feel scared', 'i feel afraid', 'i am frightened', 'scared', 'afraid'],
    patterns: [
      /\b(scared|afraid|frightened|terrified|fear|panic|worried|anxious)\b/i,
      /\bhelp\s+i\s+am\s+scared\b/i,
    ],
  },
  {
    intent: 'LONELY',
    priority: 92,
    exactMatches: ['i am alone', 'nobody is here', 'no one is here', 'i am lonely', 'where is everybody', 'where is everyone', 'all by myself'],
    patterns: [
      /\b(nobody|no\s+one)\s+is\s+here\b/i,
      /\bi\s+am\s+(alone|lonely|by\s+myself)\b/i,
      /\bwhere\s+is\s+(everyone|everybody)\b/i,
    ],
  },
  {
    intent: 'CANNOT_REMEMBER',
    priority: 90,
    exactMatches: ['i cannot remember', 'i can not remember', 'i forgot', 'i do not remember', 'i lost my memory', 'i cannot recall', 'why am i here'],
    patterns: [
      /\b(cannot|can\s+not|cant|do\s+not|dont)\s+(remember|recall)\b/i,
      /\b(i\s+forgot|lost\s+my\s+memory|why\s+am\s+i\s+here)\b/i,
    ],
  },
  {
    intent: 'CONFUSED',
    priority: 88,
    exactMatches: ['i am confused', 'i feel confused', 'i do not understand', 'i am lost', 'everything is confusing'],
    patterns: [
      /\b(confused|lost|dont understand|do not understand|disoriented)\b/i,
      /\bwhat\s+is\s+happening\b/i,
    ],
  },
  {
    intent: 'NEEDS_HELP',
    priority: 86,
    exactMatches: ['help', 'help me', 'i need help', 'can you help me', 'please help me', 'please help', 'assistance'],
    patterns: [
      /\b(help\s+me|need\s+help|need\s+assistance|can\s+you\s+help|call\s+help)\b/i,
    ],
  },

  // Conversational Etiquette & Repeat
  {
    intent: 'GOOD_MORNING',
    priority: 80,
    exactMatches: ['good morning', 'morning', 'very good morning', 'guten morgen', 'subhodayam', 'suprabhat'],
    patterns: [/\bgood\s+morning\b/i],
  },
  {
    intent: 'GOOD_NIGHT',
    priority: 80,
    exactMatches: ['good night', 'night', 'sleep well', 'going to sleep', 'good night sleep tight', 'shubh ratri'],
    patterns: [/\b(good\s+night|sleep\s+well|going\s+to\s+bed|going\s+to\s+sleep)\b/i],
  },
  {
    intent: 'THANK_YOU',
    priority: 75,
    exactMatches: ['thank you', 'thanks', 'thank u', 'thanks a lot', 'thank you so much', 'dhanyawad', 'shukriya'],
    patterns: [/\b(thank\s+you|thanks|thanku|dhanyawad|shukriya)\b/i],
  },
  {
    intent: 'GREETING',
    priority: 70,
    exactMatches: ['hello', 'hi', 'hey', 'namaste', 'halo', 'greetings', 'vanakkam', 'namaskar'],
    patterns: [/\b(hello|hi|hey|namaste|vanakkam|namaskar)\b/i],
  },
  {
    intent: 'REPEAT',
    priority: 75,
    exactMatches: ['repeat', 'say that again', 'what did you say', 'can you repeat that', 'pardon', 'repeat that', 'say again', 'come again', 'say it again'],
    patterns: [/\b(repeat|say\s+that\s+again|what\s+did\s+you\s+say|say\s+again|pardon|say\s+it\s+again)\b/i],
  },

  // Orientation & Identity
  {
    intent: 'WHO_AM_I',
    priority: 85,
    exactMatches: ['who am i', 'what is my name', 'who i am', 'tell me my name', 'do you know who i am', 'my name'],
    patterns: [
      /\bwho\s+am\s+i\b/i,
      /\b(what\s+is|tell\s+me|know)\s+(my\s+name)\b/i,
    ],
  },
  {
    intent: 'WHERE_IS_CAREGIVER',
    priority: 84,
    exactMatches: ['where is my caregiver', 'where is caregiver', 'where is she', 'where is he', 'where is my nurse', 'where is my helper'],
    patterns: [
      /\bwhere\s+is\s+(my\s+)?(caregiver|carer|nurse|helper|she|he)\b/i,
    ],
  },
  {
    intent: 'WHO_IS_CAREGIVER',
    priority: 85,
    exactMatches: [
      'who is my caregiver',
      'who looks after me',
      'who takes care of me',
      'who is taking care of me',
      'caregiver name',
      'who is helping me',
      'who is with me',
      'who is my helper',
      'who is my carer',
      'who takes care',
      'who looks after',
    ],
    patterns: [
      /\bwho\s+(is\s+my\s+caregiver|is\s+my\s+carer|takes\s+care\s+of\s+me|looks\s+after\s+me|is\s+helping\s+me|is\s+with\s+me)\b/i,
      /\b(caregiver\s+name|my\s+caregiver|my\s+carer)\b/i,
    ],
  },
  {
    intent: 'WHERE_AM_I',
    priority: 85,
    exactMatches: [
      'where am i',
      'which place is this',
      'what place is this',
      'where are we',
      'am i home',
      'am i at home',
      'am i in hospital',
      'what is this place',
      'do not know where i am',
    ],
    patterns: [
      /\bwhere\s+(am\s+i|are\s+we)\b/i,
      /\b(what|which)\s+place\s+is\s+this\b/i,
      /\bam\s+i\s+(at\s+home|home|in\s+hospital)\b/i,
      /\bdo\s+not\s+know\s+where\s+i\s+am\b/i,
    ],
  },

  // Medication Routine (Time vs Name)
  {
    intent: 'NEXT_MEDICINE',
    priority: 85,
    exactMatches: [
      'when is my medicine',
      'when do i take my medicine',
      'what time is my medicine',
      'when should i take medicine',
      'when is my pill',
      'medicine time',
      'tablet time',
      'when to take medicines',
      'when is my next dose',
      'when is my tablet',
      'what time do i take my medicine',
    ],
    patterns: [
      /\b(when|what\s+time)\s+(is|do\s+i\s+take|should\s+i\s+take|to\s+take)\s+(my\s+)?(medicine|medicines|pill|pills|tablet|tablets|dose|medication)\b/i,
      /\b(medicine|tablet|pill|medication)\s+time\b/i,
    ],
  },
  {
    intent: 'WHAT_MEDICINE',
    priority: 80,
    exactMatches: [
      'what medicine do i take',
      'which medicine do i take',
      'what is my medicine',
      'what pills do i take',
      'what tablet should i take',
      'what medicine',
      'which tablets do i take',
      'my medicines',
      'what medication do i take',
    ],
    patterns: [
      /\b(what|which)\s+(medicine|medicines|pills|pill|tablet|tablets|medication)\s+(do\s+i\s+take|is|are|should\s+i\s+take)\b/i,
      /\bwhat\s+is\s+my\s+(medicine|tablet|pill|medication)\b/i,
    ],
  },

  // Reminders & Daily Plan
  {
    intent: 'NEXT_REMINDER',
    priority: 72,
    exactMatches: [
      'what is my next reminder',
      'next reminder',
      'do i have a reminder',
      'any upcoming reminders',
      'what should i do next',
      'my reminders',
      'what is next',
      'what do i do next',
    ],
    patterns: [
      /\b(next\s+reminder|upcoming\s+reminder|do\s+i\s+have\s+a\s+reminder)\b/i,
      /\bwhat\s+should\s+i\s+do\s+(next|now)\b/i,
      /\bwhat\s+is\s+next\b/i,
    ],
  },
  {
    intent: 'TODAY_PLAN',
    priority: 68,
    exactMatches: [
      'what is today plan',
      'what is todays plan',
      'what is my plan for today',
      'schedule for today',
      'what am i doing today',
      'today schedule',
      'what is planned today',
      'my day',
      'plan for today',
    ],
    patterns: [
      /\b(today\s+plan|plan\s+for\s+today|today\s+schedule|schedule\s+for\s+today|what\s+am\s+i\s+doing\s+today|what\s+is\s+planned\s+today)\b/i,
    ],
  },

  // Games & Activities
  {
    intent: 'RECOMMEND_GAME',
    priority: 70,
    exactMatches: [
      'recommend a game',
      'suggest a game',
      'i want to play a game',
      'let us play a game',
      'can we play a game',
      'memory game',
      'play game',
      'game recommendation',
      'play a game',
    ],
    patterns: [
      /\b(recommend|suggest|play|want)\s+(a\s+)?(game|memory\s+game|puzzle)\b/i,
      /\blet\s+us\s+play\s+a\s+game\b/i,
    ],
  },
  {
    intent: 'RECOMMEND_ACTIVITY',
    priority: 66,
    exactMatches: [
      'recommend an activity',
      'suggest an activity',
      'what can i do',
      'i am bored',
      'what activity should i do',
      'things to do',
      'activity recommendation',
    ],
    patterns: [
      /\b(recommend|suggest)\s+(an\s+)?activity\b/i,
      /\b(what\s+can\s+i\s+do|i\s+am\s+bored|things\s+to\s+do)\b/i,
    ],
  },
];

/**
 * Evaluates a single normalized query clause.
 */
function evaluateSingleClause(
  clause: string,
  state?: ConversationState
): MatchEvaluation {
  if (!clause || clause.length === 0) {
    return { intent: 'UNKNOWN', confidence: 0 };
  }

  // 1. Check Follow-Up resolution
  const followUpMatch = resolveFollowUp(clause, state);
  if (followUpMatch) {
    const entities = extractEntities(clause);
    return { ...followUpMatch, entities };
  }

  let bestIntent: CompanionIntent = 'UNKNOWN';
  let highestScore = 0;

  for (const rule of ADVANCED_INTENT_RULES) {
    let score = 0;

    // Exact Match (+120)
    if (rule.exactMatches && rule.exactMatches.includes(clause)) {
      score = 120 + rule.priority;
    }

    // Pattern Match (+80)
    if (score === 0 && rule.patterns) {
      for (const pattern of rule.patterns) {
        if (pattern.test(clause)) {
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

  // 2. Multi-keyword synonym scoring fallback if no exact pattern matched
  if (highestScore < 60) {
    const hasMed = SYNONYM_GROUPS.MEDICINE.some((m) => clause.includes(m));
    const hasCare = SYNONYM_GROUPS.CAREGIVER.some((c) => clause.includes(c));
    const hasTime = SYNONYM_GROUPS.TIME_QUERY.some((t) => clause.includes(t));
    const hasWhat = SYNONYM_GROUPS.WHAT_QUERY.some((w) => clause.includes(w));
    const hasGame = SYNONYM_GROUPS.GAME.some((g) => clause.includes(g));
    const hasFear = SYNONYM_GROUPS.FEAR_EMOTION.some((f) => clause.includes(f));
    const hasHelp = SYNONYM_GROUPS.HELP_REQUEST.some((h) => clause.includes(h));

    if (hasFear) {
      bestIntent = 'SCARED';
      highestScore = 140;
    } else if (hasHelp) {
      bestIntent = 'NEEDS_HELP';
      highestScore = 135;
    } else if (hasMed && hasTime) {
      bestIntent = 'NEXT_MEDICINE';
      highestScore = 150;
    } else if (hasMed && hasWhat) {
      bestIntent = 'WHAT_MEDICINE';
      highestScore = 145;
    } else if (hasCare && hasWhat) {
      bestIntent = 'WHO_IS_CAREGIVER';
      highestScore = 145;
    } else if (hasGame) {
      bestIntent = 'RECOMMEND_GAME';
      highestScore = 130;
    }
  }

  if (highestScore < 50) {
    return { intent: 'UNKNOWN', confidence: 0 };
  }

  const confidence = Math.min(Math.round((highestScore / 220) * 100) / 100, 1.0);
  const entities = extractEntities(clause);

  return { intent: bestIntent, confidence, entities };
}

/**
 * Main intent detector supporting multi-intent queries, typos, entities, and context.
 */
export function detectIntent(
  normalizedQuery: string,
  state?: ConversationState
): MatchEvaluation {
  if (!normalizedQuery || normalizedQuery.length === 0) {
    return { intent: 'UNKNOWN', confidence: 0 };
  }

  // Multi-intent check: split on " and ", " as well as ", " also "
  if (/\b(and|as\s+well\s+as)\b/i.test(normalizedQuery)) {
    const parts = normalizedQuery
      .split(/\b(?:and|as\s+well\s+as)\b/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 2);

    if (parts.length === 2) {
      const match1 = evaluateSingleClause(parts[0], state);
      const match2 = evaluateSingleClause(parts[1], state);

      if (
        match1.intent !== 'UNKNOWN' &&
        match2.intent !== 'UNKNOWN' &&
        match1.intent !== match2.intent
      ) {
        return {
          intent: 'MULTI_INTENT',
          confidence: Math.round(((match1.confidence + match2.confidence) / 2) * 100) / 100,
          subIntents: [match1.intent, match2.intent],
          entities: { ...match1.entities, ...match2.entities },
        };
      }
    }
  }

  return evaluateSingleClause(normalizedQuery, state);
}
