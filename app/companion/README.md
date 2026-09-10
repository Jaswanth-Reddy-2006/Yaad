# Offline Dementia Companion Engine (Phase 8 Architecture)

> [!NOTE]
> **This is an offline deterministic and personalized companion architecture and is not yet a local LLM.** It serves as the safe, deterministic baseline and modular context retrieval pipeline for future small on-device LLM integration.

An isolated, lightweight, 100% offline dementia companion engine. Phase 8 introduces rich structured patient context, strict zero-hallucination factual grounding, multi-profile personalization and isolation, bounded multi-turn conversational memory with pronoun/entity resolution, dementia-friendly communication patterns, emotional support handling, offline everyday general knowledge, and deterministic simple reasoning.

## Architecture

```
                       USER MESSAGE
                            ↓
                    NORMALIZATION & STT
                            ↓
                      SAFETY CHECK
                            ↓
                     INTENT DETECTION
                            ↓
                   CONVERSATION CONTEXT
                            ↓
                  PATIENT DATA RETRIEVAL
                            ↓
                    RELEVANCE RANKING
                            ↓
                    RESPONSE STRATEGY
                            ↓
           ┌────────────────┴────────────────┐
           ↓                                 ↓
 Deterministic Pipeline            [Future Local LLM]
           ↓                                 ↓
           └────────────────┬────────────────┘
                            ↓
                    SAFETY VALIDATION
                            ↓
                      FINAL RESPONSE
```

## Phase 8 Core Intelligence Capabilities

1. **Rich Patient Context & Strict Grounding**:
   - Structured fields: Identity (`patientName`, `preferredName`, `age`, `preferredLanguage`), People (`caregiverName`, `caregiverPhone`, `familyMembers`), Routine (`todayPlanSummary`, `nextReminder`), Medication (`medicineName`, `medicineDosage`, `medicineTime`), Appointments (`appointmentTitle`, `appointmentTime`, `appointmentLocation`, `appointmentWith`), Memories (`memories`), and Preferences (`favoriteActivity`, `favoriteFood`, `favoriteMusic`, `favoriteColor`).
   - **Zero Hallucination Policy**: If patient facts are missing, the system gracefully returns `KNOWN_INTENT_MISSING_DATA` without guessing or fabricating data.

2. **Personalization & Profile Isolation**:
   - Adapts suggestions dynamically (e.g. suggesting music for Patient A vs gardening for Patient B when asked *"I'm bored"*).
   - Strict profile isolation ensures Patient A and Patient B data never cross-contaminate.

3. **Multi-Turn Conversational Memory & Pronoun Resolution**:
   - Maintains bounded rolling conversation history (`ConversationTurn[]`).
   - Understands pronouns (*it*, *her*, *him*, *them*, *that*) and entity references across consecutive turns (*"What medicine do I take?"* -> *"When do I take it?"*).
   - Patiently handles repetitions (*"What was that again?"*, *"Tell me again"*) without frustration or condescension.

4. **Safety Priority & Medical Safeguards**:
   - Safety checks execute with highest priority (priority 150).
   - Emergency statements (*"I fell down"*, *"chest hurts"*, *"too much medicine"*) trigger immediate caregiver alerts.
   - For medication verification (*"Did I take my medicine?"*), the companion prompts checking with the caregiver rather than prescribing extra doses.

5. **General Everyday Knowledge & Simple Reasoning**:
   - Offline general knowledge for basic concepts (*"What is a dog?"*, *"Why is the sky blue?"*, *"What is India?"*, *"How many days in a week?"*).
   - Deterministic reasoning for day sequences (*"What comes after Monday?"*), time sequences (*"Is morning before afternoon?"*), basic arithmetic (*"5 plus 3"*, *"10 minus 4"*), comparisons (*"Which is bigger, 10 or 5?"*), and time offsets (*"What time is two hours after 3 PM?"*).

6. **Future Local LLM Integration Point**:
   - Designed with clean separation so a small on-device LLM can be swapped in downstream of Safety, Intent, and Patient Context ranking. The verified patient database remains the single source of truth.

## Phase 8 Benchmark & Test Suite Results

- **Total Curated Evaluation Questions**: **227** test cases across categories A through Z
- **Classification Accuracy Rate**: **100%**
- **Safety Test Pass Rate**: **100%** (10/10 safety critical alerts detected)
- **Profile Isolation Pass Rate**: **100%** (0 cross-patient leaks)
- **Zero Hallucination Accuracy**: **100%** (0 invented facts on empty contexts)
- **Multi-Turn Memory Pass Rate**: **100%** (Pronoun and repetition resolution verified)
- **UNKNOWN Rate**: **5%** (strictly reserved for out-of-scope queries like astrophysics, stock prices, or nuclear reactors)

## Files in `app/companion/`

- `OfflineCompanionEngine.ts`: Main entry point processing queries and coordinating memory, context, intents, and templates.
- `PatientContextProvider.ts`: Reads real patient records safely from SQLite.
- `intents.ts`: NLU intent matching, topic detection, question classification, pronoun resolution, and clarification fallbacks.
- `templates.ts`: Personalized response generator, zero-hallucination factual grounding, emotional reassurance, safety responses.
- `knowledge.ts`: Offline general knowledge base, simple reasoning engine, local FAQs, and device clock formatting.
- `synonyms.ts`: Dictionaries for STT fillers, contractions, phonetic typos, and semantic phrase groups.
- `context.ts`: Multi-turn conversation state manager, entity tracking, and observation recorder.
- `types.ts`: TypeScript definitions for `PatientContext`, `CompanionIntent`, `ConfidenceLevel`, `ResponseStrategyType`, `QuestionCategory`, `ConversationState`.
- `test_companion.ts`: 227-question evaluation suite covering categories A-Z, patient profiles A and B, and multi-turn workflows.
