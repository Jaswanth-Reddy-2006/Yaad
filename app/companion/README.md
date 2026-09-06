# Offline Dementia Companion Engine

An isolated, lightweight, 100% deterministic offline companion engine connected safely to the local SQLite database.

## Architecture

```
User Question
      ↓
Normalize Question (lower, contractions, punctuation)
      ↓
Intent Detection (Exact match > Regex pattern > Keyword combinations + priority score)
      ↓
Existing Local Database (via PatientContextProvider)
      ↓
Patient Context (display_name, reminders, daily_tasks, schedules)
      ↓
Response Generation (Dementia-friendly 1-sentence calm & reassuring template)
      ↓
Patient Response
```

## Features
- **100% Offline**: Zero external APIs, zero LLMs, zero ML weights, zero network calls.
- **Fail-Safe Local DB Access**: Safe queries to existing SQLite tables (`patient_profile`, `reminders`, `daily_tasks`). Catches all errors gracefully without crashing or throwing.
- **Truthful & Dementia-Friendly**: Never fabricates or hallucinates facts when data is missing; provides soothing single-sentence responses.
- **Modular Separation**: The engine (`OfflineCompanionEngine.ts`) is completely separated from the data adapter (`PatientContextProvider.ts`).

## Supported Intents
1. `GREETING`
2. `WHO_AM_I`
3. `WHO_IS_CAREGIVER`
4. `WHERE_AM_I`
5. `NEXT_MEDICINE`
6. `WHAT_MEDICINE`
7. `NEXT_REMINDER`
8. `TODAY_PLAN`
9. `RECOMMEND_GAME`
10. `RECOMMEND_ACTIVITY`
11. `REPEAT`
12. `THANK_YOU`
13. `GOOD_MORNING`
14. `GOOD_NIGHT`
15. `CONFUSED`
16. `SCARED`
17. `NEEDS_HELP`
18. `UNKNOWN`

## Files in `app/companion/`
- `PatientContextProvider.ts`: Reads real patient data safely from the local SQLite database.
- `OfflineCompanionEngine.ts`: Unified engine class with `.process(query, context)` and async `.processWithDatabase(query)`.
- `types.ts`: Core data structures and intent definitions.
- `intents.ts`: Query normalization, intent matching rules, and confidence evaluation.
- `templates.ts`: Dementia-friendly response templates and patient context interpolation with missing-data fallbacks.
- `test_companion.ts`: Automated test suite covering seeded DB context, missing data, and DB error fallbacks.
