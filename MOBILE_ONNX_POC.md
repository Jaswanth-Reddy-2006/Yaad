# Phase 1: Mobile ONNX Runtime Proof-of-Concept & Integration Report

## 1. Overview & Goal

The objective of Phase 1 is to prepare the **MitraCare (Yaad)** Expo SDK 57 / React Native application (`C:\Users\rafey\Desktop\YAAD\Yaad`) for on-device **ONNX Runtime** execution using an **Expo Development Build**, verifying that native inference can run 100% offline without modifying existing UI or language stores.

---

## 2. Packages & Dependencies Added

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `onnxruntime-react-native` | `^1.24.3` | Microsoft ONNX Runtime C++/JNI native bridge for React Native |
| `expo-asset` | `~57.0.4` | Bundling and resolving local binary model assets (`.onnx`) |
| `expo-file-system` | `~57.0.4` | On-device file system access and path resolution |

---

## 3. Configuration Changes Made

### 1. `metro.config.js`
Added support for `.onnx` and `.ort` file extensions so that Metro bundler packages binary model assets:
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('onnx')) {
  config.resolver.assetExts.push('onnx');
}
if (!config.resolver.assetExts.includes('ort')) {
  config.resolver.assetExts.push('ort');
}

module.exports = config;
```

### 2. `app.json`
Included the `expo-asset` config plugin:
```json
"plugins": [
  "expo-router",
  "expo-sqlite",
  "expo-secure-store",
  "expo-asset"
]
```

---

## 4. Isolated Proof-of-Concept Module

Created [`services/onnx/OnnxTest.ts`](file:///C:/Users/rafey/Desktop/YAAD/Yaad/services/onnx/OnnxTest.ts) and bundled a lightweight test model [`assets/models/tiny_test.onnx`](file:///C:/Users/rafey/Desktop/YAAD/Yaad/assets/models/tiny_test.onnx) (306 bytes).

### How the Proof of Concept Works:
1. **Model**: A deterministic linear transformation $y = 2x + [1, 2, 3]$.
2. **Input Tensor**: Float32 tensor with shape `[1, 3]` and values `[1.0, 2.0, 3.0]`.
3. **Execution**: Evaluated locally via ONNX Runtime CPU Execution Provider.
4. **Expected Output**: `[3.0, 6.0, 9.0]`.
5. **Validation**: Checks output against mathematical expectation within $\epsilon = 10^{-4}$ and measures execution latency in milliseconds.
6. **Zero Network Calls**: Pure offline computation.

---

## 5. Expo Go vs. Development Build

- **Can Expo Go run `onnxruntime-react-native`?**: **NO.**
  - `onnxruntime-react-native` requires native C++ binary libraries (`libonnxruntime.so` on Android, `onnxruntime.xcframework` on iOS).
  - Expo Go only supports its built-in set of native modules.
- **Required Build Approach**:
  - **Expo Development Build**: Generates native wrappers while maintaining Expo managed workflow benefits.

### Exact Commands for Development Build:

```powershell
# 1. Prebuild native projects (generates android/ and ios/ directories):
npx expo prebuild

# 2. Run on Android device / emulator (compiles native C++ ONNX binaries):
npx expo run:android

# 3. Start development server with dev client:
npx expo start --dev-client
```

---

## 6. Native Requirements & Compatibility

- **React Native Version**: `0.86.3`
- **React Version**: `19.2.3`
- **Android Architecture**: Supports `arm64-v8a`, `armeabi-v7a`, `x86_64`
- **Android Min SDK**: 24 (Android 7.0+)
- **iOS Min Target**: iOS 14.0+

---

## 7. What Was NOT Changed (Integrity Guarantees)

- `app/(patient)/help.tsx`: **Untouched**
- `constants/translations.ts` & `constants/testTranslations.ts`: **Untouched**
- `store/useAccessibilityStore.ts`: **Untouched**
- 22-language switching architecture: **Preserved 100%**
- Expo/Metro process: **Not restarted**
- Large IndicTrans2 models: **Not bundled into app yet** (kept in `models/` staging area)

---

## 8. Next Steps for Loading IndicTrans2

1. **Model Quantization**: Quantize `models/indic-en-onnx` and `models/en-indic-onnx` to INT8 (~317 MB per direction).
2. **TypeScript Tokenizer Implementation**: Implement `IndicProcessor` and BPE dictionary lookup in pure TypeScript under `services/translation/tokenizer/`.
3. **Translation Service**: Wire the autoregressive greedy decoding loop with preserved cross-attention into `services/TranslationService.ts`.
4. **Build & Test**: Build the development APK and benchmark translation latency on Android device.
