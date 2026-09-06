# Offline IndicTrans2 TranslationService Architecture & Implementation

## Overview

The `TranslationService` in MitraCare (`Yaad`) provides a **100% offline, zero-network, on-device translation engine** for bidirectional translation between 22 Indian scheduled languages and English.

It combines:
1. Pure TypeScript `IndicTokenizer` & `IndicProcessor` (sub-millisecond BPE & Brahmic script normalization).
2. ONNX Runtime React Native engine (`onnxruntime-react-native`).
3. Quantized INT8 IndicTrans2 Seq2Seq models (`models/indic-en-onnx-int8`, `models/en-indic-onnx-int8`).
4. Autoregressive greedy decoding with full cross-attention memory retention.

---

## 1. Architecture & Component Hierarchy

```
services/
├── TranslationService.ts          # Main Singleton translation interface
└── translation/
    ├── types.ts                   # Type definitions & metric structures
    ├── languageMapping.ts         # MitraCare short codes <-> FLORES-200 mapping
    ├── GenerationEngine.ts        # Encoder & autoregressive greedy decoder loop
    ├── ModelSession.ts            # Directional model session & memory management
    ├── index.ts                   # Export hub
    ├── testTranslationService.ts  # End-to-end automated verification runner
    └── tokenizer/                 # TypeScript IndicTrans2 Tokenizer
        ├── languageCodes.ts
        ├── IndicProcessor.ts
        ├── SentencePieceBPE.ts
        ├── IndicTokenizer.ts
        └── index.ts
```

---

## 2. End-to-End Execution Flow

```
Input Text ("मुझे आज डॉक्टर के पास जाना है।")
   │
   ▼
[1] languageMapping.normalizeLanguageCode()
   - Source: 'hi' -> 'hin_Deva'
   - Target: 'en' -> 'eng_Latn'
   - Direction: 'indic-en'
   │
   ▼
[2] TranslationService Task Queue Lock (Serializes concurrent calls)
   │
   ▼
[3] ModelSession.load() (Lazy loaded, cached in memory)
   - Vocab: dict.SRC.json, dict.TGT.json, spm_src_vocab.json
   - ONNX: encoder.onnx, decoder.onnx, lm_head.onnx
   │
   ▼
[4] IndicTokenizer.encode() (~1 ms)
   - Punctuation & digit normalization
   - Indic script transliteration to Devanagari (if Indic)
   - BPE subword segmentation
   - Prefix tags: "hin_Deva eng_Latn <tokens...>"
   - Input IDs: [8, 4, 462, 772, 2573, 12, 518, 1184, 11, 7, 2]
   │
   ▼
[5] GenerationEngine.generate()
   │
   ├── Step 5.1: Encoder Run (~11-45 ms)
   │   - input_ids: [1, seq_len]
   │   - attention_mask: [1, seq_len]
   │   - Output: encoder_hidden_states [1, seq_len, 512]
   │
   └── Step 5.2: Autoregressive Decoder Loop (~35-45 ms per token)
       - Initial tokens: [decoder_start_token_id = 2]
       - Loop for step = 1 .. maxLength:
           a) decoder.run({
                decoder_input_ids: [1, gen_len],
                attention_mask: [1, gen_len],
                encoder_hidden_states: [1, seq_len, 512],   <-- Retained every step!
                encoder_attention_mask: [1, seq_len]        <-- Retained every step!
              }) -> last_hidden_state [1, gen_len, 512]
           b) Slice last hidden state: [1, 1, 512]
           c) lm_head.run({ hidden_states: [1, 1, 512] }) -> logits [1, 1, vocab_size]
           d) next_token = argmax(logits[0, 0, :])
           e) Append next_token to generated tokens
           f) If next_token === eos_token_id (2), break!
   │
   ▼
[6] IndicTokenizer.decode() (<1 ms)
   - Target IDs: [2, 18, 28, 8, 181, 8, 5, 744, 351, 4, 2]
   - Invert dict.TGT.json -> " I have to go to the doctor today ."
   - Restore placeholders
   - Postprocess punctuation / script detokenization
   │
   ▼
Output Text: "I have to go to the doctor today."
```

---

## 3. Critical Generation Specifications

### Special Tokens & Dimension Constants
| Parameter | Value | Verification |
| :--- | :--- | :--- |
| `decoder_start_token_id` | `2` (`</s>`) | Verified against `config.json` & PyTorch `generate()` |
| `eos_token_id` | `2` (`</s>`) | Verified against `generation_config.json` |
| `pad_token_id` | `1` (`<pad>`) | Verified against `config.json` |
| `bos_token_id` | `0` (`<s>`) | Verified against `config.json` |
| `hidden_dim` | `512` | Derived dynamically from encoder `last_hidden_state.dims[2]` |

### Cross-Attention Retention Guarantee
In Seq2Seq Transformer translation architectures, the decoder cross-attention layers attend to the entire source sequence representations output by the encoder.
- **Rule**: `encoder_hidden_states` and `encoder_attention_mask` are computed once by the encoder and passed to **every single decoder forward pass**.
- **Fix Validated**: `encoder_hidden_states` is never re-assigned to null or omitted during subsequent autoregressive token generations.

---

## 4. Supported Language Mappings

The `TranslationService` natively maps MitraCare's standard language codes to IndicTrans2 FLORES-200 tags:

| MitraCare Code | Language Name | Script Code | FLORES-200 Tag |
| :---: | :---: | :---: | :---: |
| `en` | English | Latin | `eng_Latn` |
| `hi` | Hindi | Devanagari | `hin_Deva` |
| `te` | Telugu | Telugu | `tel_Telu` |
| `ta` | Tamil | Tamil | `tam_Taml` |
| `kn` | Kannada | Kannada | `kan_Knda` |
| `bn` | Bengali | Bengali | `ben_Beng` |
| `gu` | Gujarati | Gujarati | `guj_Gujr` |
| `mr` | Marathi | Devanagari | `mar_Deva` |
| `ml` | Malayalam | Malayalam | `mal_Mlym` |
| `pa` | Punjabi | Gurmukhi | `pan_Guru` |
| `or` | Odia | Odia | `ory_Orya` |
| `as` | Assamese | Bengali | `asm_Beng` |
| `ur` | Urdu | Perso-Arabic | `urd_Arab` |
| `sd` | Sindhi | Devanagari / Arabic | `snd_Deva` |
| `ks` | Kashmiri | Perso-Arabic / Devanagari | `kas_Arab` |
| `kok` | Konkani | Devanagari | `gom_Deva` |
| `mai` | Maithili | Devanagari | `mai_Deva` |
| `ne` | Nepali | Devanagari | `npi_Deva` |
| `doi` | Dogri | Devanagari | `doi_Deva` |
| `brx` | Bodo | Devanagari | `brx_Deva` |
| `mni` | Manipuri | Meitei / Bengali | `mni_Mtei` |
| `sat` | Santali | Ol Chiki | `sat_Olck` |
| `sa` | Sanskrit | Devanagari | `san_Deva` |

---

## 5. Concurrency & Memory Management

1. **Serial Task Queue Lock**:
   All translation requests are chained through a sequential promise queue (`translationQueue`). If multiple UI components request translations simultaneously, each request waits for previous decoder passes to finish, preventing corrupted tensor memory or race conditions in the decoder.
2. **Lazy Initialization**:
   No models are loaded at app launch. Models are only initialized when `translate()` is first called for a direction.
3. **Single Direction Memory Caching**:
   `keepOnlyOneDirectionInMemory: true` ensures that when switching from Indic $\rightarrow$ English to English $\rightarrow$ Indic, the previous ~470 MB session is disposed before allocating the new direction, staying safely within mobile RAM limits.

---

## 6. Offline Guarantee

- **Zero Network Dependencies**: Contains no `fetch()`, `axios`, `XMLHttpRequest`, WebSocket, or cloud translation API endpoints.
- **Local Model Storage**: All model weights (`.onnx`) and vocabulary dictionaries (`.json`) are stored on the local filesystem or inside app assets.
- **Airplane Mode Ready**: Operates with 100% functionality without cellular or Wi-Fi connectivity.

---

## 7. Performance Benchmarks

Measured on standard CPU execution:

| Direction | Input Sentence | Tokens Generated | Encoder Latency | Decoder Latency | Total Translation Time (Warm) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Hindi $\rightarrow$ English** | `मुझे आज डॉक्टर के पास जाना है।` | 11 | 47 ms | 377 ms (37.7 ms/tok) | **425 ms** | **PASS** |
| **Telugu $\rightarrow$ English** | `నేను ఈరోజు డాక్టర్ వద్దకు వెళ్ళాలి.` | 11 | 11 ms | 463 ms (46.3 ms/tok) | **474 ms** | **PASS** |
| **English $\rightarrow$ Hindi** | `I have to go to the doctor today.` | 10 | 20 ms | 718 ms (79.8 ms/tok) | **739 ms** | **PASS** |
| **English $\rightarrow$ Telugu** | `I have to go to the doctor today.` | 11 | 14 ms | 382 ms (38.2 ms/tok) | **396 ms** | **PASS** |

---

## 8. Known Limitations & Notes

1. **Indic $\rightarrow$ Indic Pivot**:
   IndicTrans2 models are directional (Indic $\leftrightarrow$ English). Translating directly between two Indic languages (e.g. Hindi $\rightarrow$ Telugu) requires a pivot through English:
   $$\text{Hindi} \xrightarrow{\text{indic-en}} \text{English} \xrightarrow{\text{en-indic}} \text{Telugu}$$
2. **Batch Generation**:
   The current mobile runtime optimizes for single-sentence interactive patient-doctor dialogue (batch size = 1).
