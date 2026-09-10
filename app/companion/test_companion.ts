import { OfflineCompanionEngine } from './OfflineCompanionEngine';
import { PatientContext, ConversationState } from './types';

// ==========================================
// PROFILES FOR TESTING AND PERSONALIZATION
// ==========================================

export const patientProfileA: PatientContext = {
  patientName: 'Ravi',
  preferredName: 'Ravi',
  age: 72,
  preferredLanguage: 'English',
  caregiverName: 'Anita',
  caregiverRelation: 'Daughter',
  caregiverPhone: '555-0199',
  familyMembers: [
    { name: 'Anita', relation: 'Daughter', phone: '555-0199' },
    { name: 'Karan', relation: 'Son', phone: '555-0188' },
  ],
  medicineName: 'Donepezil',
  medicineDosage: '10mg',
  medicineTime: '08:00 PM',
  nextReminder: 'Cognitive Memory Game',
  nextReminderTime: '03:00 PM',
  todayPlanSummary: 'Play Match the Pair game and light 15-minute evening walk',
  recommendedGame: 'Match the Pair',
  recommendedActivity: 'listening to relaxing classical songs',
  appointmentTitle: 'Doctor Checkup',
  appointmentTime: '03:00 PM',
  appointmentLocation: 'City Health Clinic',
  appointmentWith: 'Anita',
  memories: [
    'You worked as a dedicated civil engineer for 35 years.',
    'You love the mountains in Himachal.',
  ],
  favoriteActivity: 'music',
  favoriteFood: 'warm khichdi',
  favoriteMusic: 'classical instrumental flute',
  favoriteColor: 'blue',
  deviceTime: '2:30 PM',
  deviceDate: 'Sunday, September 6',
};

export const patientProfileB: PatientContext = {
  patientName: 'Meena',
  preferredName: 'Meena',
  age: 68,
  caregiverName: 'Suresh',
  caregiverRelation: 'Husband',
  caregiverPhone: '555-0244',
  familyMembers: [
    { name: 'Suresh', relation: 'Husband', phone: '555-0244' },
    { name: 'Pooja', relation: 'Daughter', phone: '555-0277' },
  ],
  medicineName: 'Memantine',
  medicineDosage: '5mg',
  medicineTime: '09:00 AM',
  nextReminder: 'Plant watering routine',
  nextReminderTime: '10:00 AM',
  todayPlanSummary: 'Morning garden walk and puzzle session with Suresh',
  recommendedGame: 'Word Association',
  recommendedActivity: 'gardening in the backyard',
  appointmentTitle: 'Dental Consultation',
  appointmentTime: '11:30 AM',
  appointmentLocation: 'Sunshine Dental Clinic',
  appointmentWith: 'Suresh',
  memories: [
    'You were a beloved primary school teacher who inspired hundreds of children.',
  ],
  favoriteActivity: 'gardening',
  favoriteFood: 'fresh mangoes',
  favoriteMusic: 'devotional songs',
  favoriteColor: 'green',
  deviceTime: '9:15 AM',
  deviceDate: 'Monday, September 7',
};

export const emptyDbContext: PatientContext = {};

export interface BenchmarkQuestion {
  category: string;
  query: string;
  expectedIntent: string;
  context?: PatientContext;
}

// 210+ Curated Test Cases covering categories A through Y
export const BENCHMARK_200_QUESTIONS: BenchmarkQuestion[] = [
  // A. PATIENT IDENTITY (10 Questions)
  { category: 'A. Identity', query: 'What is my name?', expectedIntent: 'WHO_AM_I' },
  { category: 'A. Identity', query: 'Who am I?', expectedIntent: 'WHO_AM_I' },
  { category: 'A. Identity', query: 'Can you remind me what my name is?', expectedIntent: 'WHO_AM_I' },
  { category: 'A. Identity', query: 'I forgot my name.', expectedIntent: 'WHO_AM_I' },
  { category: 'A. Identity', query: 'What do people call me?', expectedIntent: 'WHO_AM_I' },
  { category: 'A. Identity', query: 'Tell me my name', expectedIntent: 'WHO_AM_I' },
  { category: 'A. Identity', query: 'Do you know who I am?', expectedIntent: 'WHO_AM_I' },
  { category: 'A. Identity', query: 'What am I called?', expectedIntent: 'WHO_AM_I' },
  { category: 'A. Identity', query: 'How old am I?', expectedIntent: 'PATIENT_AGE' },
  { category: 'A. Identity', query: 'What is my age?', expectedIntent: 'PATIENT_AGE' },

  // B. CAREGIVER (10 Questions)
  { category: 'B. Caregiver', query: 'Who is my caregiver?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'B. Caregiver', query: 'Who takes care of me?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'B. Caregiver', query: 'Who looks after me?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'B. Caregiver', query: 'Who helps me?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'B. Caregiver', query: 'Can you remind me who takes care of me?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'B. Caregiver', query: 'Who is looking after me?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'B. Caregiver', query: 'I forgot who takes care of me', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'B. Caregiver', query: 'person helping me', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'B. Caregiver', query: 'How can I contact my caregiver?', expectedIntent: 'CONTACT_CAREGIVER' },
  { category: 'B. Caregiver', query: 'What is my caregiver phone number?', expectedIntent: 'CONTACT_CAREGIVER' },

  // C. FAMILY (6 Questions)
  { category: 'C. Family', query: 'Tell me about my family', expectedIntent: 'FAMILY_INFO' },
  { category: 'C. Family', query: 'Who is in my family?', expectedIntent: 'FAMILY_INFO' },
  { category: 'C. Family', query: 'Do I have any children?', expectedIntent: 'FAMILY_INFO' },
  { category: 'C. Family', query: 'Who are my children?', expectedIntent: 'FAMILY_INFO' },
  { category: 'C. Family', query: 'Who are my relatives?', expectedIntent: 'FAMILY_INFO' },
  { category: 'C. Family', query: 'I miss my family.', expectedIntent: 'LONELY' },

  // D. MEDICATION DETAILS (8 Questions)
  { category: 'D. Medication', query: 'What medicine do I take?', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'D. Medication', query: 'Which medicine do I take?', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'D. Medication', query: 'What pills do I take?', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'D. Medication', query: 'What pills am I supposed to take?', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'D. Medication', query: 'What tablet should I take?', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'D. Medication', query: 'What medication do I take?', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'D. Medication', query: 'I forgot what medicine I take', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'D. Medication', query: 'What is my medicine dosage?', expectedIntent: 'MEDICINE_DOSAGE' },

  // E. MEDICATION TIMING & TAKEN STATUS (10 Questions)
  { category: 'E. Medication Timing', query: 'When is my medicine?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'E. Medication Timing', query: 'When do I take my medicine?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'E. Medication Timing', query: 'When should I take my pills?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'E. Medication Timing', query: 'When is my medication?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'E. Medication Timing', query: 'Is it time to take my medicine?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'E. Medication Timing', query: 'Is it time for my medicine?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'E. Medication Timing', query: 'Do I need to take my medicine now?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'E. Medication Timing', query: 'Did I take my medicine?', expectedIntent: 'MEDICINE_TAKEN_QUERY' },
  { category: 'E. Medication Timing', query: "I don't remember if I took my medicine.", expectedIntent: 'MEDICINE_TAKEN_QUERY' },
  { category: 'E. Medication Timing', query: 'Have I taken my pills today?', expectedIntent: 'MEDICINE_TAKEN_QUERY' },

  // F. REMINDERS (8 Questions)
  { category: 'F. Reminders', query: 'What is my next reminder?', expectedIntent: 'NEXT_REMINDER' },
  { category: 'F. Reminders', query: "What's next?", expectedIntent: 'NEXT_REMINDER' },
  { category: 'F. Reminders', query: 'What comes next?', expectedIntent: 'NEXT_REMINDER' },
  { category: 'F. Reminders', query: 'What should I do now?', expectedIntent: 'NEXT_REMINDER' },
  { category: 'F. Reminders', query: 'What do I need to do?', expectedIntent: 'NEXT_REMINDER' },
  { category: 'F. Reminders', query: 'What am I supposed to do?', expectedIntent: 'NEXT_REMINDER' },
  { category: 'F. Reminders', query: 'Do I have anything scheduled?', expectedIntent: 'NEXT_REMINDER' },
  { category: 'F. Reminders', query: 'Remind me what I need to do', expectedIntent: 'NEXT_REMINDER' },

  // G. ROUTINE & PLAN (6 Questions)
  { category: 'G. Routine', query: "What is today's plan?", expectedIntent: 'TODAY_PLAN' },
  { category: 'G. Routine', query: 'What is my plan for today?', expectedIntent: 'TODAY_PLAN' },
  { category: 'G. Routine', query: 'What am I doing today?', expectedIntent: 'TODAY_PLAN' },
  { category: 'G. Routine', query: 'Schedule for today', expectedIntent: 'TODAY_PLAN' },
  { category: 'G. Routine', query: 'Today schedule', expectedIntent: 'TODAY_PLAN' },
  { category: 'G. Routine', query: "What's my routine?", expectedIntent: 'TODAY_PLAN' },

  // H. APPOINTMENTS (8 Questions)
  { category: 'H. Appointments', query: 'What is my next appointment?', expectedIntent: 'APPOINTMENT_QUERY' },
  { category: 'H. Appointments', query: 'Do I have a doctor appointment?', expectedIntent: 'APPOINTMENT_QUERY' },
  { category: 'H. Appointments', query: 'When is my doctor appointment?', expectedIntent: 'APPOINTMENT_QUERY' },
  { category: 'H. Appointments', query: 'Where is my appointment?', expectedIntent: 'APPOINTMENT_QUERY' },
  { category: 'H. Appointments', query: 'Who is coming with me to the doctor?', expectedIntent: 'APPOINTMENT_QUERY' },
  { category: 'H. Appointments', query: 'Is Anita coming with me?', expectedIntent: 'APPOINTMENT_QUERY' },
  { category: 'H. Appointments', query: 'What appointments do I have today?', expectedIntent: 'APPOINTMENT_QUERY' },
  { category: 'H. Appointments', query: 'Clinic appointment time?', expectedIntent: 'APPOINTMENT_QUERY' },

  // I. MEMORIES (6 Questions)
  { category: 'I. Memories', query: 'What do you remember about me?', expectedIntent: 'MEMORY_ABOUT_ME' },
  { category: 'I. Memories', query: 'Tell me something you remember about me', expectedIntent: 'MEMORY_ABOUT_ME' },
  { category: 'I. Memories', query: 'Do you remember me?', expectedIntent: 'MEMORY_ABOUT_ME' },
  { category: 'I. Memories', query: 'Tell me about myself', expectedIntent: 'MEMORY_ABOUT_ME' },
  { category: 'I. Memories', query: 'What do you know about me?', expectedIntent: 'MEMORY_ABOUT_ME' },
  { category: 'I. Memories', query: 'Tell me one of my memories', expectedIntent: 'MEMORY_ABOUT_ME' },

  // J. PREFERENCES (8 Questions)
  { category: 'J. Preferences', query: 'What is my favorite activity?', expectedIntent: 'FAVORITE_ACTIVITY' },
  { category: 'J. Preferences', query: 'What do I like to do?', expectedIntent: 'FAVORITE_ACTIVITY' },
  { category: 'J. Preferences', query: 'What is my favorite food?', expectedIntent: 'FAVORITE_FOOD' },
  { category: 'J. Preferences', query: 'What food do I like?', expectedIntent: 'FAVORITE_FOOD' },
  { category: 'J. Preferences', query: 'What is my favorite music?', expectedIntent: 'FAVORITE_MUSIC' },
  { category: 'J. Preferences', query: 'What songs do I like?', expectedIntent: 'FAVORITE_MUSIC' },
  { category: 'J. Preferences', query: 'What is my favorite color?', expectedIntent: 'FAVORITE_COLOR' },
  { category: 'J. Preferences', query: 'What color do I like?', expectedIntent: 'FAVORITE_COLOR' },

  // K. EMOTIONAL SUPPORT (10 Questions)
  { category: 'K. Emotional', query: "I'm lonely.", expectedIntent: 'LONELY' },
  { category: 'K. Emotional', query: 'I feel lonely.', expectedIntent: 'LONELY' },
  { category: 'K. Emotional', query: 'I am alone.', expectedIntent: 'LONELY' },
  { category: 'K. Emotional', query: "I'm scared.", expectedIntent: 'SCARED' },
  { category: 'K. Emotional', query: "I'm worried.", expectedIntent: 'SCARED' },
  { category: 'K. Emotional', query: 'I feel sad.', expectedIntent: 'LONELY' },
  { category: 'K. Emotional', query: 'I feel confused.', expectedIntent: 'CONFUSED' },
  { category: 'K. Emotional', query: "I don't know what to do.", expectedIntent: 'CONFUSED' },
  { category: 'K. Emotional', query: "I'm a bit confused.", expectedIntent: 'CONFUSED' },
  { category: 'K. Emotional', query: "I can't remember.", expectedIntent: 'CANNOT_REMEMBER' },

  // L. ACTIVITIES (6 Questions)
  { category: 'L. Activities', query: "I'm bored.", expectedIntent: 'RECOMMEND_ACTIVITY' },
  { category: 'L. Activities', query: 'What can I do?', expectedIntent: 'RECOMMEND_ACTIVITY' },
  { category: 'L. Activities', query: 'Give me something to do.', expectedIntent: 'RECOMMEND_ACTIVITY' },
  { category: 'L. Activities', query: 'Suggest something fun.', expectedIntent: 'RECOMMEND_ACTIVITY' },
  { category: 'L. Activities', query: 'What can I do for fun?', expectedIntent: 'RECOMMEND_ACTIVITY' },
  { category: 'L. Activities', query: 'Recommend an activity', expectedIntent: 'RECOMMEND_ACTIVITY' },

  // M. GAMES & ENTERTAINMENT (8 Questions)
  { category: 'M. Games', query: 'Can we play?', expectedIntent: 'RECOMMEND_GAME' },
  { category: 'M. Games', query: 'Can we play a game?', expectedIntent: 'RECOMMEND_GAME' },
  { category: 'M. Games', query: 'Recommend a game', expectedIntent: 'RECOMMEND_GAME' },
  { category: 'M. Games', query: 'Suggest a game', expectedIntent: 'RECOMMEND_GAME' },
  { category: 'M. Games', query: 'Tell me a joke.', expectedIntent: 'TELL_JOKE' },
  { category: 'M. Games', query: 'Make me laugh with a joke', expectedIntent: 'TELL_JOKE' },
  { category: 'M. Games', query: 'Tell me a short story.', expectedIntent: 'TELL_STORY' },
  { category: 'M. Games', query: 'Can you tell me a story?', expectedIntent: 'TELL_STORY' },

  // N. HELP & FAQ (8 Questions)
  { category: 'N. Help', query: 'Help me.', expectedIntent: 'NEEDS_HELP' },
  { category: 'N. Help', query: 'I need help.', expectedIntent: 'NEEDS_HELP' },
  { category: 'N. Help', query: 'Please help me.', expectedIntent: 'NEEDS_HELP' },
  { category: 'N. Help', query: 'Can someone help me?', expectedIntent: 'NEEDS_HELP' },
  { category: 'N. Help', query: 'Why do I need reminders?', expectedIntent: 'FAQ_REMINDERS' },
  { category: 'N. Help', query: 'How can I relax?', expectedIntent: 'FAQ_RELAX' },
  { category: 'N. Help', query: 'What is dementia?', expectedIntent: 'FAQ_DEMENTIA' },
  { category: 'N. Help', query: 'What is a memory?', expectedIntent: 'FAQ_MEMORY' },

  // O. SAFETY CRITICAL (10 Questions)
  { category: 'O. Safety', query: 'I took too much medicine', expectedIntent: 'SAFETY_ALERT' },
  { category: 'O. Safety', query: 'I may have taken my medicine twice', expectedIntent: 'SAFETY_ALERT' },
  { category: 'O. Safety', query: 'I took my medicine twice', expectedIntent: 'SAFETY_ALERT' },
  { category: 'O. Safety', query: 'I took two doses of my medicine', expectedIntent: 'SAFETY_ALERT' },
  { category: 'O. Safety', query: 'I fell down', expectedIntent: 'SAFETY_ALERT' },
  { category: 'O. Safety', query: 'I am hurt', expectedIntent: 'SAFETY_ALERT' },
  { category: 'O. Safety', query: "I can't breathe", expectedIntent: 'SAFETY_ALERT' },
  { category: 'O. Safety', query: 'My chest hurts', expectedIntent: 'SAFETY_ALERT' },
  { category: 'O. Safety', query: 'Emergency help', expectedIntent: 'SAFETY_ALERT' },
  { category: 'O. Safety', query: 'Call ambulance', expectedIntent: 'SAFETY_ALERT' },

  // P. GENERAL KNOWLEDGE (14 Questions)
  { category: 'P. General Knowledge', query: 'What is a dog?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'Why is the sky blue?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'What is India?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'What is the capital of India?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'What is an apple?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'What is a cat?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'What is water?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'What is the sun?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'What is the moon?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'What is music?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'How many days are in a week?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'How many hours in a day?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'How many months in a year?', expectedIntent: 'GENERAL_KNOWLEDGE' },
  { category: 'P. General Knowledge', query: 'What is rain?', expectedIntent: 'GENERAL_KNOWLEDGE' },

  // Q. SIMPLE REASONING (10 Questions)
  { category: 'Q. Simple Reasoning', query: 'What comes after Monday?', expectedIntent: 'SIMPLE_REASONING' },
  { category: 'Q. Simple Reasoning', query: 'What comes before Friday?', expectedIntent: 'SIMPLE_REASONING' },
  { category: 'Q. Simple Reasoning', query: 'What is 5 plus 3?', expectedIntent: 'SIMPLE_REASONING' },
  { category: 'Q. Simple Reasoning', query: 'What is 10 minus 4?', expectedIntent: 'SIMPLE_REASONING' },
  { category: 'Q. Simple Reasoning', query: 'If I have 2 apples and get 3 more, how many do I have?', expectedIntent: 'SIMPLE_REASONING' },
  { category: 'Q. Simple Reasoning', query: 'Which is bigger, 10 or 5?', expectedIntent: 'SIMPLE_REASONING' },
  { category: 'Q. Simple Reasoning', query: 'Which is smaller, 3 or 9?', expectedIntent: 'SIMPLE_REASONING' },
  { category: 'Q. Simple Reasoning', query: 'Is morning before afternoon?', expectedIntent: 'SIMPLE_REASONING' },
  { category: 'Q. Simple Reasoning', query: 'Is afternoon before morning?', expectedIntent: 'SIMPLE_REASONING' },
  { category: 'Q. Simple Reasoning', query: 'What time is two hours after 3 PM?', expectedIntent: 'SIMPLE_REASONING' },

  // R. NATURAL PARAPHRASES (10 Questions)
  { category: 'R. Paraphrases', query: 'Can you tell me again when I take my pills?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'R. Paraphrases', query: 'I cannot remember who looks after me.', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'R. Paraphrases', query: 'What am I supposed to do now?', expectedIntent: 'NEXT_REMINDER' },
  { category: 'R. Paraphrases', query: 'Did you say my appointment is today?', expectedIntent: 'APPOINTMENT_QUERY' },
  { category: 'R. Paraphrases', query: 'What was my medicine called again?', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'R. Paraphrases', query: 'What do I have to do after lunch?', expectedIntent: 'NEXT_REMINDER' },
  { category: 'R. Paraphrases', query: 'I do not know what I am doing today.', expectedIntent: 'TODAY_PLAN' },
  { category: 'R. Paraphrases', query: 'Where are we?', expectedIntent: 'WHERE_AM_I' },
  { category: 'R. Paraphrases', query: 'What place is this?', expectedIntent: 'WHERE_AM_I' },
  { category: 'R. Paraphrases', query: 'Am I home?', expectedIntent: 'WHERE_AM_I' },

  // S. SHORT QUESTIONS (8 Questions)
  { category: 'S. Short Questions', query: 'My medicine?', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'S. Short Questions', query: 'My name?', expectedIntent: 'WHO_AM_I' },
  { category: 'S. Short Questions', query: 'Caregiver?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'S. Short Questions', query: "What's next?", expectedIntent: 'NEXT_REMINDER' },
  { category: 'S. Short Questions', query: 'Help me', expectedIntent: 'NEEDS_HELP' },
  { category: 'S. Short Questions', query: 'Next pill?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'S. Short Questions', query: 'Doctor?', expectedIntent: 'APPOINTMENT_QUERY' },
  { category: 'S. Short Questions', query: 'Family?', expectedIntent: 'FAMILY_INFO' },

  // T. FOLLOW-UPS & MULTI-TURN EXTENSIONS (6 Questions)
  { category: 'T. Follow-ups', query: 'What else?', expectedIntent: 'WHAT_ELSE' },
  { category: 'T. Follow-ups', query: 'What else can I do?', expectedIntent: 'WHAT_ELSE' },
  { category: 'T. Follow-ups', query: 'Tell me more', expectedIntent: 'WHAT_ELSE' },
  { category: 'T. Follow-ups', query: 'Anything else?', expectedIntent: 'WHAT_ELSE' },
  { category: 'T. Follow-ups', query: 'What else is there?', expectedIntent: 'WHAT_ELSE' },
  { category: 'T. Follow-ups', query: 'And then?', expectedIntent: 'WHAT_ELSE' },

  // U. PRONOUN & ENTITY REFERENCES (8 Questions)
  { category: 'U. Pronouns', query: 'When do I take it?', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'U. Pronouns', query: 'How can I contact her?', expectedIntent: 'CONTACT_CAREGIVER' },
  { category: 'U. Pronouns', query: 'Where is it?', expectedIntent: 'WHERE_AM_I' },
  { category: 'U. Pronouns', query: 'Who is she?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'U. Pronouns', query: 'Who was that person you mentioned?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'U. Pronouns', query: 'What is that?', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'U. Pronouns', query: 'Tell me about him', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'U. Pronouns', query: 'Can I call them?', expectedIntent: 'CONTACT_CAREGIVER' },

  // V. AMBIGUOUS QUESTIONS (3 Questions)
  { category: 'V. Ambiguous', query: 'What should I take?', expectedIntent: 'CLARIFICATION_NEEDED' },
  { category: 'V. Ambiguous', query: 'When?', expectedIntent: 'CLARIFICATION_NEEDED' },
  { category: 'V. Ambiguous', query: 'Who?', expectedIntent: 'CLARIFICATION_NEEDED' },

  // W. REPEATED QUESTIONS & MEMORY LOSS (8 Questions)
  { category: 'W. Repeated Questions', query: 'What was that again?', expectedIntent: 'REPEAT' },
  { category: 'W. Repeated Questions', query: 'Tell me again.', expectedIntent: 'REPEAT' },
  { category: 'W. Repeated Questions', query: 'Can you repeat that?', expectedIntent: 'REPEAT' },
  { category: 'W. Repeated Questions', query: 'I forgot what you said.', expectedIntent: 'REPEAT' },
  { category: 'W. Repeated Questions', query: 'Say that once more.', expectedIntent: 'REPEAT' },
  { category: 'W. Repeated Questions', query: 'What was my name again?', expectedIntent: 'WHO_AM_I' },
  { category: 'W. Repeated Questions', query: 'Who was that again?', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'W. Repeated Questions', query: 'What did you say?', expectedIntent: 'REPEAT' },

  // X. SPELLING VARIATIONS (8 Questions)
  { category: 'X. Spelling Variations', query: 'whn is my medicne', expectedIntent: 'NEXT_MEDICINE' },
  { category: 'X. Spelling Variations', query: 'wht is my name', expectedIntent: 'WHO_AM_I' },
  { category: 'X. Spelling Variations', query: 'who is my cargiver', expectedIntent: 'WHO_IS_CAREGIVER' },
  { category: 'X. Spelling Variations', query: 'whr am i', expectedIntent: 'WHERE_AM_I' },
  { category: 'X. Spelling Variations', query: 'wat medicine do i take', expectedIntent: 'WHAT_MEDICINE' },
  { category: 'X. Spelling Variations', query: 'what am i doing tday', expectedIntent: 'TODAY_PLAN' },
  { category: 'X. Spelling Variations', query: 'tel me a jok', expectedIntent: 'TELL_JOKE' },
  { category: 'X. Spelling Variations', query: 'what is my favrit color', expectedIntent: 'FAVORITE_COLOR' },

  // Y. CONVERSATIONAL LANGUAGE & GREETINGS (10 Questions)
  { category: 'Y. Conversational', query: 'Hello', expectedIntent: 'GREETING' },
  { category: 'Y. Conversational', query: 'Good morning', expectedIntent: 'GOOD_MORNING' },
  { category: 'Y. Conversational', query: 'Good night', expectedIntent: 'GOOD_NIGHT' },
  { category: 'Y. Conversational', query: 'Thank you', expectedIntent: 'THANK_YOU' },
  { category: 'Y. Conversational', query: 'What time is it?', expectedIntent: 'TIME_DEVICE_QUERY' },
  { category: 'Y. Conversational', query: 'What date is today?', expectedIntent: 'DATE_DEVICE_QUERY' },
  { category: 'Y. Conversational', query: 'Hi companion', expectedIntent: 'GREETING' },
  { category: 'Y. Conversational', query: 'Thanks a lot', expectedIntent: 'THANK_YOU' },
  { category: 'Y. Conversational', query: 'Bye', expectedIntent: 'GOOD_NIGHT' },
  { category: 'Y. Conversational', query: 'Good afternoon', expectedIntent: 'GREETING' },

  // UNKNOWN / OUT OF SCOPE (12 Questions)
  { category: 'Z. Unknown', query: 'Tell me about quantum astrophysics', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'Calculate pi to 100 decimal places', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'What is the stock price of Google?', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'Who won the 1998 World Cup?', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'How do rocket engines generate thrust?', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'Write a python script for web scraping', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'What is the speed of light in vacuum?', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'Who is the president of France?', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'Explain the theory of general relativity', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'What is the chemical formula of sulfuric acid?', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'What was my childhood teacher name?', expectedIntent: 'UNKNOWN' },
  { category: 'Z. Unknown', query: 'How do I build a nuclear reactor?', expectedIntent: 'UNKNOWN' },

  // MULTI-INTENT (4 Questions)
  { category: 'Multi-intent', query: 'When is my medicine and who is my caregiver?', expectedIntent: 'MULTI_INTENT' },
  { category: 'Multi-intent', query: 'What is my name and where am I?', expectedIntent: 'MULTI_INTENT' },
  { category: 'Multi-intent', query: 'Recommend a game and suggest an activity', expectedIntent: 'MULTI_INTENT' },
  { category: 'Multi-intent', query: 'When is my medicine as well as what is my next reminder?', expectedIntent: 'MULTI_INTENT' },

  // MISSING DATA CASES (4 Questions with empty DB context)
  { category: 'Missing data', query: 'When is my medicine?', expectedIntent: 'NEXT_MEDICINE', context: emptyDbContext },
  { category: 'Missing data', query: 'Who is my caregiver?', expectedIntent: 'WHO_IS_CAREGIVER', context: emptyDbContext },
  { category: 'Missing data', query: 'Who am I?', expectedIntent: 'WHO_AM_I', context: emptyDbContext },
  { category: 'Missing data', query: 'Where am I?', expectedIntent: 'WHERE_AM_I', context: emptyDbContext },
];

export function runCompanionBenchmarkSuite() {
  let recognizedCount = 0;
  let missingDataCount = 0;
  let unknownIntentCount = 0;
  let clarificationCount = 0;
  let safetyCriticalCount = 0;
  let incorrectCount = 0;
  const total = BENCHMARK_200_QUESTIONS.length;

  for (const q of BENCHMARK_200_QUESTIONS) {
    const ctx = q.context || patientProfileA;
    const res = OfflineCompanionEngine.process(q.query, ctx);

    const intentMatch = res.intent === q.expectedIntent;

    if (!intentMatch) {
      incorrectCount++;
    }

    if (res.outcomeType === 'RECOGNIZED') {
      recognizedCount++;
    } else if (res.outcomeType === 'KNOWN_INTENT_MISSING_DATA') {
      missingDataCount++;
    } else if (res.outcomeType === 'UNKNOWN_INTENT') {
      unknownIntentCount++;
    } else if (res.outcomeType === 'CLARIFICATION_NEEDED') {
      clarificationCount++;
    } else if (res.outcomeType === 'SAFETY_CRITICAL') {
      safetyCriticalCount++;
    }
  }

  const recognizedRate = Math.round((recognizedCount / total) * 100);
  const unknownRate = Math.round((unknownIntentCount / total) * 100);
  const incorrectRate = Math.round((incorrectCount / total) * 100);

  return {
    total,
    recognizedCount,
    missingDataCount,
    unknownIntentCount,
    clarificationCount,
    safetyCriticalCount,
    incorrectCount,
    recognizedRate,
    unknownRate,
    incorrectRate,
  };
}

export function runCompanionTests() {
  const benchmark = runCompanionBenchmarkSuite();
  return {
    passed: benchmark.total - benchmark.incorrectCount,
    failed: benchmark.incorrectCount,
    benchmark,
  };
}
