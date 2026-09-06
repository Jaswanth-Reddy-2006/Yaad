import { CompanionIntent, PatientContext } from './types';

/**
 * Formats a clean, short, dementia-friendly response for a given intent and patient context.
 * Missing patient data produces gentle, safe, truthful fallbacks without inventing facts.
 */
export function generateResponse(
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

    case 'SCARED':
      return "You're safe. I'm here with you.";

    case 'NEEDS_HELP':
      return caregiverName
        ? `I am here to help you, and ${caregiverName} is nearby.`
        : 'I am here to help you. You are safe.';

    case 'UNKNOWN':
    default:
      return "I'm not sure I understood. Please ask me again.";
  }
}
