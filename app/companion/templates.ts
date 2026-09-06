import { CompanionIntent, PatientContext } from './types';

const UNKNOWN_VARIANTS = [
  "I'm not sure I understood. Please ask me again.",
  "I didn't quite understand that. Could you ask me again?",
  "I'm not sure about that yet. Please try asking in another way.",
];

/**
 * Formats a clean, short, dementia-friendly response for a single intent.
 */
export function generateSingleIntentResponse(
  intent: CompanionIntent,
  context: PatientContext = {}
): string {
  const {
    patientName,
    caregiverName,
    caregiverRelation,
    location,
    medicineName,
    medicineTime,
    nextReminder,
    nextReminderTime,
    todayPlanSummary,
    recommendedGame,
    recommendedActivity,
    lastResponse,
  } = context;

  switch (intent) {
    case 'GREETING':
      return patientName
        ? `Hello ${patientName}, it is wonderful to see you.`
        : 'Hello, it is wonderful to see you.';

    case 'WHO_AM_I':
      return patientName
        ? `Your name is ${patientName}.`
        : 'You are safe and surrounded by people who care about you.';

    case 'WHO_IS_CAREGIVER':
      if (caregiverName && caregiverRelation) {
        return `Your caregiver is ${caregiverName}, your ${caregiverRelation}.`;
      }
      if (caregiverName) {
        return `Your caregiver is ${caregiverName}.`;
      }
      return 'Your caregiver is right here taking care of you.';

    case 'WHERE_IS_CAREGIVER':
      if (caregiverName) {
        return `${caregiverName} is nearby and taking good care of you.`;
      }
      return 'Your caregiver is nearby and looking out for you.';

    case 'WHERE_AM_I':
      return location
        ? `You are safe at ${location}.`
        : 'You are in a safe and comfortable place.';

    case 'NEXT_MEDICINE':
      if (medicineName && medicineTime) {
        return `Your ${medicineName.toLowerCase()} is scheduled for ${medicineTime}.`;
      }
      if (medicineTime) {
        return `Your medicine is scheduled for ${medicineTime}.`;
      }
      return 'You do not have any upcoming medicines scheduled right now.';

    case 'WHAT_MEDICINE':
      return medicineName
        ? `You take ${medicineName}.`
        : 'You do not have any active medicines listed right now.';

    case 'NEXT_REMINDER':
      if (nextReminder && nextReminderTime) {
        return `Your next reminder is ${nextReminder} at ${nextReminderTime}.`;
      }
      if (nextReminder) {
        return `Your next reminder is ${nextReminder}.`;
      }
      return 'You have no upcoming reminders right now.';

    case 'TODAY_PLAN':
      return todayPlanSummary
        ? `Today's plan is ${todayPlanSummary}.`
        : 'You have a calm and relaxing day ahead.';

    case 'RECOMMEND_GAME':
      return recommendedGame
        ? `Let's play ${recommendedGame}.`
        : "Let's play a simple memory game.";

    case 'RECOMMEND_ACTIVITY':
      return recommendedActivity
        ? `How about ${recommendedActivity.toLowerCase()}?`
        : 'Listening to soothing music would be lovely.';

    case 'REPEAT':
      return lastResponse || 'I am right here with you.';

    case 'THANK_YOU':
      return 'You are very welcome.';

    case 'GOOD_MORNING':
      return patientName
        ? `Good morning ${patientName}, have a peaceful day.`
        : 'Good morning, have a peaceful day.';

    case 'GOOD_NIGHT':
      return patientName
        ? `Good night ${patientName}, sleep well.`
        : 'Good night, sleep well and rest peacefully.';

    case 'CONFUSED':
      return 'Take your time. You are safe, and everything is okay.';

    case 'CANNOT_REMEMBER':
      return 'It is completely okay to forget. I am right here with you.';

    case 'LONELY':
      return caregiverName
        ? `I am right here with you, and ${caregiverName} is nearby.`
        : 'I am right here with you, and you are surrounded by care.';

    case 'SCARED':
      return "You're safe. I'm here with you.";

    case 'NEEDS_HELP':
      return caregiverName
        ? `I am here to help you, and ${caregiverName} is nearby.`
        : 'I am here to help you. You are safe.';

    case 'UNKNOWN':
    default: {
      const idx = Math.floor(Math.random() * UNKNOWN_VARIANTS.length);
      return UNKNOWN_VARIANTS[idx] || UNKNOWN_VARIANTS[0];
    }
  }
}

/**
 * Generates a response, supporting multi-intent combinations and single intents.
 */
export function generateResponse(
  intent: CompanionIntent,
  context: PatientContext = {},
  subIntents?: CompanionIntent[]
): string {
  if (intent === 'MULTI_INTENT' && subIntents && subIntents.length === 2) {
    const resp1 = generateSingleIntentResponse(subIntents[0], context).replace(/\.$/, '');
    let resp2 = generateSingleIntentResponse(subIntents[1], context);
    // Lowercase the start of the second sentence for smooth conjunction
    if (resp2.length > 0) {
      resp2 = resp2.charAt(0).toLowerCase() + resp2.slice(1);
    }
    return `${resp1}, and ${resp2}`;
  }

  return generateSingleIntentResponse(intent, context);
}
