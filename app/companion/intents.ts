import { CompanionIntent, IntentRule } from './types';

/**
 * Normalizes input text for deterministic pattern matching.
 * - Converts to lower case
 * - Expands common contractions
 * - Strips special characters/punctuation
 * - Collapses consecutive whitespace
 */
export function normalizeQuery(query: string): string {
  if (!query) return '';

  let text = query.toLowerCase().trim();

  // Normalize contractions
  text = text
    .replace(/i'm/g, 'i am')
    .replace(/what's/g, 'what is')
    .replace(/who's/g, 'who is')
    .replace(/where's/g, 'where is')
    .replace(/when's/g, 'when is')
    .replace(/let's/g, 'let us')
    .replace(/can't/g, 'cannot')
    .replace(/don't/g, 'do not')
    .replace(/it's/g, 'it is')
    .replace(/you're/g, 'you are');

  // Strip punctuation and special characters
  text = text.replace(/[^a-z0-9\s]/g, ' ');

  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Intent classification rules ordered by priority and specificity.
 */
export const INTENT_RULES: IntentRule[] = [
  // High-priority emotional and safety reassurance
  {
    intent: 'SCARED',
    priority: 95,
    exactMatches: ['i am scared', 'i am afraid', 'i feel scared', 'i feel afraid', 'i am frightened', 'scared', 'afraid'],
    patterns: [
      /\b(scared|afraid|frightened|terrified|anxious|fear)\b/i,
      /\bhelp\s+i\s+am\s+scared\b/i,
    ],
  },
  {
    intent: 'CONFUSED',
    priority: 90,
    exactMatches: ['i am confused', 'i feel confused', 'i do not understand', 'i am lost', 'everything is confusing'],
    patterns: [
      /\b(confused|lost|dont understand|do not understand|disoriented)\b/i,
      /\bwhat is happening\b/i,
    ],
  },
  {
    intent: 'NEEDS_HELP',
    priority: 85,
    exactMatches: ['help', 'help me', 'i need help', 'can you help me', 'please help me', 'please help', 'assistance'],
    patterns: [
      /\b(help me|need help|need assistance|can you help|call help)\b/i,
    ],
  },

  // Greetings & Conversational Etiquette
  {
    intent: 'GOOD_MORNING',
    priority: 80,
    exactMatches: ['good morning', 'morning', 'very good morning'],
    patterns: [/\bgood\s+morning\b/i],
  },
  {
    intent: 'GOOD_NIGHT',
    priority: 80,
    exactMatches: ['good night', 'night', 'sleep well', 'going to sleep', 'good night sleep tight'],
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
    exactMatches: ['hello', 'hi', 'hey', 'namaste', 'halo', 'greetings'],
    patterns: [/\b(hello|hi|hey|namaste)\b/i],
  },
  {
    intent: 'REPEAT',
    priority: 75,
    exactMatches: ['repeat', 'say that again', 'what did you say', 'can you repeat that', 'pardon', 'repeat that', 'say again', 'come again'],
    patterns: [/\b(repeat|say that again|what did you say|say again|pardon)\b/i],
  },

  // Identity & Orientation
  {
    intent: 'WHO_AM_I',
    priority: 85,
    exactMatches: ['who am i', 'what is my name', 'who i am', 'tell me my name', 'do you know who i am', 'my name'],
    patterns: [
      /\bwho\s+am\s+i\b/i,
      /\b(what is|tell me|know)\s+(my\s+name)\b/i,
    ],
    requiredKeywords: [
      ['who', 'i'],
      ['my', 'name'],
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
    ],
    patterns: [
      /\bwho\s+(is\s+my\s+caregiver|takes\s+care\s+of\s+me|looks\s+after\s+me|is\s+helping\s+me|is\s+with\s+me)\b/i,
      /\b(caregiver\s+name|my\s+caregiver)\b/i,
    ],
    requiredKeywords: [
      ['caregiver'],
      ['takes', 'care'],
      ['looks', 'after'],
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
    ],
    patterns: [
      /\bwhere\s+(am\s+i|are\s+we)\b/i,
      /\b(what|which)\s+place\s+is\s+this\b/i,
      /\bam\s+i\s+(at\s+home|home|in\s+hospital)\b/i,
    ],
    requiredKeywords: [
      ['where', 'i'],
      ['which', 'place'],
      ['what', 'place'],
    ],
  },

  // Medication & Health Routine (Careful distinction between timing vs name)
  {
    intent: 'NEXT_MEDICINE',
    priority: 80,
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
    ],
    patterns: [
      /\bwhen\s+(is|do\s+i\s+take|should\s+i\s+take|to\s+take)\s+(my\s+)?(medicine|medicines|pill|pills|tablet|tablets|dose)\b/i,
      /\bwhat\s+time\s+is\s+(my\s+)?(medicine|medicines|pill|pills|tablet|tablets)\b/i,
      /\b(medicine|tablet|pill)\s+time\b/i,
    ],
    requiredKeywords: [
      ['when', 'medicine'],
      ['when', 'medicines'],
      ['when', 'tablet'],
      ['when', 'tablets'],
      ['when', 'pill'],
      ['when', 'pills'],
      ['time', 'medicine'],
      ['time', 'tablet'],
    ],
  },
  {
    intent: 'WHAT_MEDICINE',
    priority: 75,
    exactMatches: [
      'what medicine do i take',
      'which medicine do i take',
      'what is my medicine',
      'what pills do i take',
      'what tablet should i take',
      'what medicine',
      'which tablets do i take',
      'my medicines',
    ],
    patterns: [
      /\b(what|which)\s+(medicine|medicines|pills|pill|tablet|tablets)\s+(do\s+i\s+take|is|are|should\s+i\s+take)\b/i,
      /\bwhat\s+is\s+my\s+(medicine|tablet|pill)\b/i,
    ],
    requiredKeywords: [
      ['what', 'medicine'],
      ['which', 'medicine'],
      ['what', 'tablet'],
      ['which', 'tablet'],
      ['what', 'pill'],
    ],
  },

  // Reminders & Daily Schedule
  {
    intent: 'NEXT_REMINDER',
    priority: 70,
    exactMatches: [
      'what is my next reminder',
      'next reminder',
      'do i have a reminder',
      'any upcoming reminders',
      'what should i do next',
      'my reminders',
      'what is next',
    ],
    patterns: [
      /\b(next\s+reminder|upcoming\s+reminder|do\s+i\s+have\s+a\s+reminder)\b/i,
      /\bwhat\s+should\s+i\s+do\s+next\b/i,
    ],
    requiredKeywords: [
      ['next', 'reminder'],
      ['upcoming', 'reminder'],
    ],
  },
  {
    intent: 'TODAY_PLAN',
    priority: 65,
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
    requiredKeywords: [
      ['today', 'plan'],
      ['schedule', 'today'],
      ['doing', 'today'],
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
      /\b(recommend|suggest|play|want)\s+(a\s+)?(game|memory\s+game)\b/i,
      /\blet\s+us\s+play\s+a\s+game\b/i,
    ],
    requiredKeywords: [
      ['game'],
      ['games'],
    ],
  },
  {
    intent: 'RECOMMEND_ACTIVITY',
    priority: 65,
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
    requiredKeywords: [
      ['activity'],
      ['activities'],
      ['bored'],
    ],
  },
];

export interface MatchEvaluation {
  intent: CompanionIntent;
  confidence: number;
}

/**
 * Evaluates the normalized text against all intent rules and returns the best matching intent.
 */
export function detectIntent(normalizedQuery: string): MatchEvaluation {
  if (!normalizedQuery || normalizedQuery.length === 0) {
    return { intent: 'UNKNOWN', confidence: 0 };
  }

  const words = normalizedQuery.split(' ');
  let bestMatch: MatchEvaluation = { intent: 'UNKNOWN', confidence: 0 };
  let highestScore = 0;

  for (const rule of INTENT_RULES) {
    let score = 0;

    // 1. Exact match (highest confidence)
    if (rule.exactMatches && rule.exactMatches.includes(normalizedQuery)) {
      score = 100 + rule.priority;
    }

    // 2. Pattern match
    if (score === 0 && rule.patterns) {
      for (const pattern of rule.patterns) {
        if (pattern.test(normalizedQuery)) {
          score = 80 + rule.priority;
          break;
        }
      }
    }

    // 3. Required keyword combinations
    if (score === 0 && rule.requiredKeywords) {
      for (const group of rule.requiredKeywords) {
        const allPresent = group.every((kw) => words.includes(kw));
        if (allPresent) {
          // If all keywords are present, compute a score based on group specificity
          score = 50 + group.length * 10 + rule.priority;
          break;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      // Normalize confidence to a scale between 0.0 and 1.0
      const confidence = Math.min(Math.round((score / 200) * 100) / 100, 1.0);
      bestMatch = { intent: rule.intent, confidence };
    }
  }

  // If score is too low or not matched, return UNKNOWN
  if (highestScore < 50) {
    return { intent: 'UNKNOWN', confidence: 0 };
  }

  return bestMatch;
}
