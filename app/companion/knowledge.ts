import { CompanionIntent } from './types';

/**
 * Curated local FAQ Knowledge base for general companion questions.
 * 100% offline, dementia-friendly, and concise.
 */
export const LOCAL_KNOWLEDGE_BASE: Record<string, string> = {
  FAQ_DEMENTIA:
    'Dementia is a health condition that affects memory and thinking over time. A doctor or your caregiver can help answer medical questions.',
  FAQ_MEMORY:
    'A memory is a thought or feeling from something you experienced in the past.',
  FAQ_REMINDERS:
    'Reminders help keep your day smooth and peaceful without having to remember everything.',
  FAQ_RELAX:
    'Taking slow deep breaths, listening to gentle music, or sitting comfortably can help you feel relaxed.',
  FAQ_WORRY:
    'Taking deep breaths and letting your caregiver know how you feel can help you feel better.',
  TELL_JOKE:
    'Why did the sun wear sunglasses? Because it was so bright and cheerful!',
  TELL_STORY:
    'Once upon a time, a gentle bird built a warm nest under a shady banyan tree and sang peaceful songs each morning for the whole garden.',
};

/**
 * Curated offline general knowledge database for everyday questions.
 */
export const GENERAL_KNOWLEDGE_MAP: Record<string, string> = {
  'what is a dog': 'A dog is a friendly, loyal animal that many people keep as a loving companion and pet.',
  'what is a cat': 'A cat is a calm, furry animal known for soft purring and gentle companionship.',
  'why is the sky blue': 'The sky looks blue because the Earth’s atmosphere scatters sunlight in all directions, and blue light scatters the most.',
  'what is india': 'India is a beautiful country known for its rich culture, diverse traditions, and historic heritage.',
  'what is the capital of india': 'The capital of India is New Delhi.',
  'how many days are in a week': 'There are 7 days in a week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday.',
  'how many days in a week': 'There are 7 days in a week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday.',
  'how many months in a year': 'There are 12 months in a year.',
  'how many hours in a day': 'There are 24 hours in a full day.',
  'what is the sun': 'The sun is a bright star at the center of our solar system that gives us light and warmth.',
  'what is the moon': 'The moon is Earth’s natural satellite that glows gently in the night sky.',
  'what is water': 'Water is a clear, essential liquid that is vital for all living things.',
  'what is an apple': 'An apple is a sweet, nutritious fruit that grows on apple trees.',
  'what is rain': 'Rain is droplets of water that fall from clouds in the sky, nourishing plants and trees.',
  'what is music': 'Music is the art of arranging sounds and melodies in harmony to create pleasant and moving experiences.',
};

/**
 * Resolves deterministic answers for simple reasoning queries.
 */
export function resolveSimpleReasoning(query: string): string | null {
  const norm = query.toLowerCase().trim();

  // Days sequence
  if (/\bafter\s+monday\b/i.test(norm)) return 'Tuesday comes after Monday.';
  if (/\bafter\s+tuesday\b/i.test(norm)) return 'Wednesday comes after Tuesday.';
  if (/\bafter\s+wednesday\b/i.test(norm)) return 'Thursday comes after Wednesday.';
  if (/\bafter\s+thursday\b/i.test(norm)) return 'Friday comes after Thursday.';
  if (/\bafter\s+friday\b/i.test(norm)) return 'Saturday comes after Friday.';
  if (/\bafter\s+saturday\b/i.test(norm)) return 'Sunday comes after Saturday.';
  if (/\bafter\s+sunday\b/i.test(norm)) return 'Monday comes after Sunday.';

  if (/\bbefore\s+friday\b/i.test(norm)) return 'Thursday comes before Friday.';
  if (/\bbefore\s+monday\b/i.test(norm)) return 'Sunday comes before Monday.';
  if (/\bbefore\s+tuesday\b/i.test(norm)) return 'Monday comes before Tuesday.';
  if (/\bbefore\s+wednesday\b/i.test(norm)) return 'Tuesday comes before Wednesday.';
  if (/\bbefore\s+thursday\b/i.test(norm)) return 'Wednesday comes before Thursday.';
  if (/\bbefore\s+saturday\b/i.test(norm)) return 'Friday comes before Saturday.';
  if (/\bbefore\s+sunday\b/i.test(norm)) return 'Saturday comes before Sunday.';

  // Time sequence: morning before afternoon?
  if (/is\s+morning\s+before\s+afternoon/i.test(norm)) {
    return 'Yes, morning comes before afternoon.';
  }
  if (/is\s+afternoon\s+before\s+morning/i.test(norm)) {
    return 'No, afternoon comes after morning.';
  }
  if (/is\s+afternoon\s+before\s+evening/i.test(norm)) {
    return 'Yes, afternoon comes before evening.';
  }

  // Arithmetic: 5 plus 3, 10 minus 4, etc.
  const mathAdd = norm.match(/(\d+)\s+(?:plus|\+)\s+(\d+)/i);
  if (mathAdd) {
    const a = parseInt(mathAdd[1], 10);
    const b = parseInt(mathAdd[2], 10);
    return `${a} plus ${b} is ${a + b}.`;
  }

  const mathSub = norm.match(/(\d+)\s+(?:minus|\-)\s+(\d+)/i);
  if (mathSub) {
    const a = parseInt(mathSub[1], 10);
    const b = parseInt(mathSub[2], 10);
    return `${a} minus ${b} is ${a - b}.`;
  }

  // Word math: e.g. "if I have 2 apples and get 3 more"
  const applesMatch = norm.match(/have\s+(\d+)\s+.*get\s+(\d+)\s+more/i);
  if (applesMatch) {
    const a = parseInt(applesMatch[1], 10);
    const b = parseInt(applesMatch[2], 10);
    return `You will have ${a + b} in total.`;
  }

  // Comparison: "Which is bigger, 10 or 5?" or "Which is smaller, 3 or 9?"
  const compBigger = norm.match(/which\s+is\s+(bigger|larger|greater)[\s,]+(\d+)\s+or\s+(\d+)/i);
  if (compBigger) {
    const a = parseInt(compBigger[2], 10);
    const b = parseInt(compBigger[3], 10);
    const maxVal = Math.max(a, b);
    return `${maxVal} is bigger.`;
  }

  const compSmaller = norm.match(/which\s+is\s+(smaller|lesser|less)[\s,]+(\d+)\s+or\s+(\d+)/i);
  if (compSmaller) {
    const a = parseInt(compSmaller[2], 10);
    const b = parseInt(compSmaller[3], 10);
    const minVal = Math.min(a, b);
    return `${minVal} is smaller.`;
  }

  // Time offset: "What time is two hours after 3 PM?" or "2 hours after 3 pm"
  const wordToNum: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  const timeOffset = norm.match(/(one|two|three|four|five|six|\d+)\s+hours?\s+after\s+(\d+)(?:\s*(am|pm))?/i);
  if (timeOffset) {
    const addHours = wordToNum[timeOffset[1].toLowerCase()] || parseInt(timeOffset[1], 10);
    let baseHour = parseInt(timeOffset[2], 10);
    const period = timeOffset[3] ? timeOffset[3].toUpperCase() : '';
    let newHour = baseHour + addHours;
    if (newHour > 12) newHour = newHour % 12 || 12;
    return `${addHours} hours after ${baseHour} ${period} is ${newHour} ${period}`.trim() + '.';
  }

  return null;
}

/**
 * Returns a general knowledge answer for common everyday questions.
 */
export function getGeneralKnowledgeAnswer(query: string): string | null {
  const norm = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [key, ans] of Object.entries(GENERAL_KNOWLEDGE_MAP)) {
    if (norm.includes(key)) {
      return ans;
    }
  }
  return null;
}

/**
 * Formats the current local device time into a patient-friendly string (e.g., "2:30 PM").
 */
export function getFormattedDeviceTime(): string {
  try {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'the current hour';
  }
}

/**
 * Formats the current local device date into a patient-friendly string (e.g., "Sunday, September 6").
 */
export function getFormattedDeviceDate(): string {
  try {
    const now = new Date();
    return now.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'today';
  }
}

/**
 * Returns a knowledge answer if the intent is a local FAQ or device time/date query.
 */
export function getKnowledgeAnswer(
  intent: CompanionIntent,
  overrideTime?: string,
  overrideDate?: string
): string | null {
  if (intent === 'TIME_DEVICE_QUERY') {
    const timeStr = overrideTime || getFormattedDeviceTime();
    return `Right now it is ${timeStr}.`;
  }

  if (intent === 'DATE_DEVICE_QUERY') {
    const dateStr = overrideDate || getFormattedDeviceDate();
    return `Today is ${dateStr}.`;
  }

  if (LOCAL_KNOWLEDGE_BASE[intent]) {
    return LOCAL_KNOWLEDGE_BASE[intent];
  }

  return null;
}
