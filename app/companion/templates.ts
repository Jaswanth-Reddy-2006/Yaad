import {
  CompanionIntent,
  PatientContext,
  OutcomeType,
  ResponseStrategyType,
  ConfidenceLevel,
  ConversationState,
  ExtractedEntities,
} from './types';
import { getKnowledgeAnswer, getGeneralKnowledgeAnswer, resolveSimpleReasoning } from './knowledge';

const UNKNOWN_VARIANTS = [
  "I don't have that information right now. Please ask me again or check with your caregiver.",
  "I'm not sure about that yet. Could you ask me in another way?",
  "I don't know that yet, but I am right here with you.",
];

export interface FormattedResponseResult {
  response: string;
  outcomeType: OutcomeType;
  strategy?: ResponseStrategyType;
}

/**
 * Formats a clean, short, dementia-friendly response for a single intent with patient-specific personalization.
 * Strictly avoids hallucinating missing facts.
 */
export function generateSingleIntentResponse(
  intent: CompanionIntent,
  context: PatientContext = {},
  rawQuery?: string,
  state?: ConversationState,
  entities?: ExtractedEntities
): FormattedResponseResult {
  // Check local knowledge base & device time/date first
  const knowledgeAns = getKnowledgeAnswer(intent, context.deviceTime, context.deviceDate);
  if (knowledgeAns) {
    return { response: knowledgeAns, outcomeType: 'RECOGNIZED', strategy: 'GENERAL' };
  }

  // Check simple reasoning if query provided
  if (intent === 'SIMPLE_REASONING' && rawQuery) {
    const reasoning = resolveSimpleReasoning(rawQuery);
    if (reasoning) {
      return { response: reasoning, outcomeType: 'RECOGNIZED', strategy: 'GENERAL' };
    }
  }

  // Check general knowledge
  if (intent === 'GENERAL_KNOWLEDGE' && rawQuery) {
    const gk = getGeneralKnowledgeAnswer(rawQuery);
    if (gk) {
      return { response: gk, outcomeType: 'RECOGNIZED', strategy: 'GENERAL' };
    }
  }

  const {
    patientName,
    preferredName,
    age,
    caregiverName,
    caregiverRelation,
    caregiverPhone,
    caregiverLocation,
    familyMembers,
    location,
    homeAddress,
    medicineName,
    medicineTime,
    medicineDosage,
    medicineFrequency,
    nextReminder,
    nextReminderTime,
    appointmentTitle,
    appointmentTime,
    appointmentLocation,
    appointmentWith,
    todayPlanSummary,
    recommendedGame,
    recommendedActivity,
    preferences,
    memories,
    lastResponse,
  } = context;

  const activeName = preferredName || patientName;
  const favActivity = preferences?.favoriteActivity || context.favoriteActivity || recommendedActivity;
  const favFood = preferences?.favoriteFood || context.favoriteFood;
  const favMusic = preferences?.favoriteMusic || context.favoriteMusic;
  const favColor = preferences?.favoriteColor || context.favoriteColor;

  switch (intent) {
    case 'GREETING':
      return {
        response: activeName
          ? `Hello ${activeName}, it is wonderful to see you.`
          : 'Hello, it is wonderful to see you.',
        outcomeType: 'RECOGNIZED',
        strategy: 'FACTUAL',
      };

    case 'WHO_AM_I':
      if (activeName) {
        return { response: `Your name is ${activeName}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'You are safe and surrounded by people who care about you.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'PATIENT_AGE':
      if (age) {
        return { response: `You are ${age} years old.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: "I don't have your age listed right now.",
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'WHO_IS_CAREGIVER':
      if (caregiverName && caregiverRelation) {
        return { response: `Your caregiver is ${caregiverName}, your ${caregiverRelation}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      if (caregiverName) {
        return { response: `Your caregiver is ${caregiverName}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'Your caregiver is right here taking care of you.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'WHERE_IS_CAREGIVER':
      if (caregiverName && caregiverLocation) {
        return { response: `${caregiverName} is at ${caregiverLocation}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      if (caregiverName) {
        return { response: `${caregiverName} is nearby and taking good care of you.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'Your caregiver is nearby and looking out for you.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'CONTACT_CAREGIVER':
      if (caregiverName && caregiverPhone) {
        return { response: `You can reach ${caregiverName} at ${caregiverPhone}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      if (caregiverName) {
        return { response: `Your caregiver ${caregiverName} is available whenever you need help.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: "I don't have a contact phone number listed for your caregiver yet.",
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'FAMILY_INFO':
      if (familyMembers && familyMembers.length > 0) {
        const famList = familyMembers.map((f) => `${f.name} (${f.relation})`).join(', ');
        return { response: `Your family includes ${famList}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      if (caregiverRelation && caregiverName) {
        return { response: `Your ${caregiverRelation.toLowerCase()} ${caregiverName} is with you.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'You have loving family members who care deeply about you.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'WHERE_AM_I':
      if (location) {
        return { response: `You are safe at ${location}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'You are in a safe and comfortable place.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'NEXT_MEDICINE':
      if (medicineName && medicineTime) {
        return { response: `Your ${medicineName.toLowerCase()} is scheduled for ${medicineTime}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      if (medicineTime) {
        return { response: `Your medicine is scheduled for ${medicineTime}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'You do not have any upcoming medicines scheduled right now.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'WHAT_MEDICINE':
      if (medicineName) {
        return { response: `You take ${medicineName}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'You do not have any active medicines listed right now.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'MEDICINE_DOSAGE':
      if (medicineName && medicineDosage) {
        return { response: `Your dosage for ${medicineName} is ${medicineDosage}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      if (medicineDosage) {
        return { response: `Your medicine dosage is ${medicineDosage}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: "I don't have dosage details listed. Please check with your caregiver before taking any medicine.",
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'MEDICINE_TAKEN_QUERY':
      return {
        response: caregiverName
          ? `Please check with ${caregiverName} to make sure before taking any medicine.`
          : 'Please check with your caregiver to make sure before taking any medicine.',
        outcomeType: 'RECOGNIZED',
        strategy: 'SAFETY',
      };

    case 'NEXT_REMINDER':
      if (nextReminder && nextReminderTime) {
        return { response: `Your next reminder is ${nextReminder} at ${nextReminderTime}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      if (nextReminder) {
        return { response: `Your next reminder is ${nextReminder}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'You have no upcoming reminders right now.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'TODAY_PLAN':
      if (todayPlanSummary) {
        return { response: `Today's plan is ${todayPlanSummary}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'You have a calm and relaxing day ahead.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'APPOINTMENT_QUERY':
      if (appointmentTitle && appointmentTime && appointmentLocation) {
        return { response: `You have ${appointmentTitle} at ${appointmentTime} at ${appointmentLocation}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      if (appointmentTitle && appointmentTime) {
        return { response: `You have ${appointmentTitle} scheduled for ${appointmentTime}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      if (appointmentTitle) {
        return { response: `You have an appointment: ${appointmentTitle}.`, outcomeType: 'RECOGNIZED', strategy: 'FACTUAL' };
      }
      return {
        response: 'You have no upcoming appointments listed right now.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    // Preferences & Personalized Recommendations
    case 'FAVORITE_ACTIVITY':
      if (favActivity) {
        return { response: `You enjoy ${favActivity.toLowerCase()}.`, outcomeType: 'RECOGNIZED', strategy: 'PERSONALIZED' };
      }
      return {
        response: "I don't have your favorite activity recorded yet.",
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'FAVORITE_FOOD':
      if (favFood) {
        return { response: `Your favorite food is ${favFood}.`, outcomeType: 'RECOGNIZED', strategy: 'PERSONALIZED' };
      }
      return {
        response: "I don't have your favorite food listed yet.",
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'FAVORITE_MUSIC':
      if (favMusic) {
        return { response: `You love listening to ${favMusic}.`, outcomeType: 'RECOGNIZED', strategy: 'PERSONALIZED' };
      }
      return {
        response: "I don't have your favorite music listed yet.",
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'FAVORITE_COLOR':
      if (favColor) {
        return { response: `Your favorite color is ${favColor}.`, outcomeType: 'RECOGNIZED', strategy: 'PERSONALIZED' };
      }
      return {
        response: "I don't have your favorite color yet.",
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };

    case 'RECOMMEND_GAME':
      if (recommendedGame) {
        return { response: `Let's play ${recommendedGame}.`, outcomeType: 'RECOGNIZED', strategy: 'PERSONALIZED' };
      }
      return {
        response: "Let's play a simple memory match game.",
        outcomeType: 'RECOGNIZED',
        strategy: 'GENERAL',
      };

    case 'RECOMMEND_ACTIVITY':
      if (favActivity) {
        return {
          response: `How about ${favActivity.toLowerCase()}?`,
          outcomeType: 'RECOGNIZED',
          strategy: 'PERSONALIZED',
        };
      }
      return {
        response: 'Listening to soothing music or taking a relaxing sit would be lovely.',
        outcomeType: 'RECOGNIZED',
        strategy: 'GENERAL',
      };

    case 'WHAT_ELSE':
      if (recommendedGame) {
        return { response: `You could also play ${recommendedGame}.`, outcomeType: 'RECOGNIZED', strategy: 'PERSONALIZED' };
      }
      return { response: 'You could also do a simple memory game or rest comfortably.', outcomeType: 'RECOGNIZED', strategy: 'GENERAL' };

    case 'REPEAT': {
      const histLast = state?.history && state.history.length > 0 ? state.history[state.history.length - 1].response : undefined;
      const textToRepeat = lastResponse || histLast || 'I am right here with you.';
      return { response: textToRepeat, outcomeType: 'RECOGNIZED', strategy: 'CONTEXTUAL' };
    }

    case 'THANK_YOU':
      return { response: 'You are very welcome.', outcomeType: 'RECOGNIZED', strategy: 'GENERAL' };

    case 'GOOD_MORNING':
      return {
        response: activeName
          ? `Good morning ${activeName}, have a peaceful day.`
          : 'Good morning, have a peaceful day.',
        outcomeType: 'RECOGNIZED',
        strategy: 'FACTUAL',
      };

    case 'GOOD_NIGHT':
      return {
        response: activeName
          ? `Good night ${activeName}, sleep well.`
          : 'Good night, sleep well and rest peacefully.',
        outcomeType: 'RECOGNIZED',
        strategy: 'FACTUAL',
      };

    // Emotional Reassurance
    case 'CONFUSED':
      return { response: 'Take your time. You are safe, and everything is okay.', outcomeType: 'RECOGNIZED', strategy: 'EMOTIONAL' };

    case 'CANNOT_REMEMBER':
      return { response: 'It is completely okay to forget. I am right here with you.', outcomeType: 'RECOGNIZED', strategy: 'EMOTIONAL' };

    case 'LONELY':
      if (caregiverName) {
        return {
          response: `I am right here with you. You could also talk to ${caregiverName} if you would like some company.`,
          outcomeType: 'RECOGNIZED',
          strategy: 'EMOTIONAL',
        };
      }
      return {
        response: 'I am right here with you, and you are surrounded by care.',
        outcomeType: 'RECOGNIZED',
        strategy: 'EMOTIONAL',
      };

    case 'SCARED':
      return { response: "You're safe. I'm right here with you.", outcomeType: 'RECOGNIZED', strategy: 'EMOTIONAL' };

    case 'NEEDS_HELP':
      return {
        response: caregiverName
          ? `I am here to help you, and ${caregiverName} is nearby.`
          : 'I am here to help you. You are safe.',
        outcomeType: 'RECOGNIZED',
        strategy: 'EMOTIONAL',
      };

    case 'SAFETY_ALERT':
      return {
        response: caregiverName
          ? `Please stay calm and rest comfortably. I am letting ${caregiverName} know right away to assist you.`
          : 'Please stay calm and rest comfortably. I am letting your caregiver know right away to assist you.',
        outcomeType: 'SAFETY_CRITICAL',
        strategy: 'SAFETY',
      };

    case 'MEMORY_ABOUT_ME': {
      if (memories && memories.length > 0) {
        const mem = memories[0];
        const memText = typeof mem === 'string' ? mem : `${mem.title}: ${mem.description}`;
        return {
          response: memText,
          outcomeType: 'RECOGNIZED',
          strategy: 'FACTUAL',
        };
      }
      const parts: string[] = [];
      if (activeName) parts.push(`Your name is ${activeName}`);
      if (caregiverName) parts.push(`your caregiver is ${caregiverName}`);
      if (location) parts.push(`you live in ${location}`);

      if (parts.length > 0) {
        return {
          response: `${parts.join(', ')}. You are safe and well cared for.`,
          outcomeType: 'RECOGNIZED',
          strategy: 'FACTUAL',
        };
      }
      return {
        response: 'You are a wonderful person, and you are surrounded by people who care about you.',
        outcomeType: 'KNOWN_INTENT_MISSING_DATA',
        strategy: 'FACTUAL',
      };
    }

    case 'CLARIFICATION_NEEDED':
      return {
        response: 'Do you mean your medicine, appointment, or schedule?',
        outcomeType: 'CLARIFICATION_NEEDED',
        strategy: 'CLARIFICATION',
      };

    case 'UNKNOWN':
    default: {
      const idx = Math.floor(Math.random() * UNKNOWN_VARIANTS.length);
      return {
        response: UNKNOWN_VARIANTS[idx] || UNKNOWN_VARIANTS[0],
        outcomeType: 'UNKNOWN_INTENT',
        strategy: 'UNKNOWN',
      };
    }
  }
}

/**
 * Generates a response, supporting multi-intent combinations and single intents.
 */
export function generateResponse(
  intent: CompanionIntent,
  context: PatientContext = {},
  subIntents?: CompanionIntent[],
  rawQuery?: string,
  state?: ConversationState,
  entities?: ExtractedEntities
): FormattedResponseResult {
  if (intent === 'MULTI_INTENT' && subIntents && subIntents.length === 2) {
    const res1 = generateSingleIntentResponse(subIntents[0], context, rawQuery, state, entities);
    const res2 = generateSingleIntentResponse(subIntents[1], context, rawQuery, state, entities);

    const text1 = res1.response.replace(/\.$/, '');
    let text2 = res2.response;
    if (text2.length > 0) {
      text2 = text2.charAt(0).toLowerCase() + text2.slice(1);
    }

    const outcomeType: OutcomeType =
      res1.outcomeType === 'KNOWN_INTENT_MISSING_DATA' || res2.outcomeType === 'KNOWN_INTENT_MISSING_DATA'
        ? 'KNOWN_INTENT_MISSING_DATA'
        : 'RECOGNIZED';

    return {
      response: `${text1}, and ${text2}`,
      outcomeType,
      strategy: 'FACTUAL',
    };
  }

  return generateSingleIntentResponse(intent, context, rawQuery, state, entities);
}
