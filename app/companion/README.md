# Offline Dementia Companion Engine

An isolated, lightweight, 100% deterministic offline companion engine connected safely to the local SQLite database, featuring advanced intent scoring, typo resilience, conversation context, entity extraction, and multi-intent reasoning.

## Architecture

```
User Question
      ↓
Normalize & Typo Correction (lower, contractions, typos, punctuation)
      ↓
Multi-Intent / Follow-Up Detection (with rolling conversation context)
      ↓
Advanced Intent Scoring (Exact match > RegEx pattern > Synonym group synergy)
      ↓
Existing Local Database (via PatientContextProvider)
      ↓
Personalized Dementia-Friendly Template Response
      ↓
Conversation Memory Update
      ↓
Patient Response
```

## Key Capabilities
- **100% Offline**: Zero external APIs, zero LLMs, zero ML weights, zero network calls.
- **Typo & Phrasing Resilience**: Automatically handles common typing errors (e.g. `"whn is my medicne?"`), verb variations, and colloquial expressions.
- **Multi-Turn Conversation Memory**: Resolves contextual follow-ups (e.g., *"When is my medicine?"* followed by *"What is it?"* or *"Who is my caregiver?"* followed by *"Where is she?"*).
- **Compound / Multi-Intent Questions**: Understands dual requests (e.g., *"When is my medicine and who is my caregiver?"*) and synthesizes a smooth, calm single response.
- **Dementia & Emotional Support**: Gentle, reassuring handling of confusion, fear (*"I'm scared"*), memory gaps (*"I can't remember"*), and loneliness (*"Nobody is here"*).
- **Safe & Truthful Fallbacks**: Never hallucinates missing patient records or medical prescriptions; selects from a variety of gentle, safe unknown responses.

## Files in `app/companion/`
- `OfflineCompanionEngine.ts`: Unified entry point with sync/async pipelines and conversation state management.
- `PatientContextProvider.ts`: Reads real patient data safely from local SQLite tables.
- `intents.ts`: Advanced scoring engine, typo correction, multi-intent splitter, entity extractor, follow-up resolver.
- `templates.ts`: Natural response variants, multi-intent combination, dementia-safe fallbacks.
- `synonyms.ts`: Dictionaries for contractions, common typos, and structured synonym/phrase groups.
- `context.ts`: Bounded rolling conversation history and topic manager.
- `types.ts`: Core data structures, intent definitions, entity interfaces, and conversation states.
- `test_companion.ts`: Comprehensive test suite testing all phrasings, typos, follow-ups, emotional queries, and multi-intent questions.
