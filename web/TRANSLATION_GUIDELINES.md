# MitraCare Website Translation & Internationalization Guidelines

Welcome to the **MitraCare** multilingual architecture documentation. The MitraCare website supports **English (`en`) + all 22 Official 8th Schedule Indian Languages**:

> **Assamese (`as`)**, **Bengali (`bn`)**, **Bodo (`brx`)**, **Dogri (`doi`)**, **Gujarati (`gu`)**, **Hindi (`hi`)**, **Kannada (`kn`)**, **Kashmiri (`ks`)**, **Konkani (`kok`)**, **Maithili (`mai`)**, **Malayalam (`ml`)**, **Manipuri (`mni`)**, **Marathi (`mr`)**, **Nepali (`ne`)**, **Odia (`or`)**, **Punjabi (`pa`)**, **Sanskrit (`sa`)**, **Santali (`sat`)**, **Sindhi (`sd`)**, **Tamil (`ta`)**, **Telugu (`te`)**, and **Urdu (`ur`)**.

---

## 1. The Core Rule

> **CRITICAL RULE**: NEVER write raw, hardcoded user-facing English strings directly in JSX/TSX.
> 
> ❌ **INCORRECT**:
> ```tsx
> <h2>New Healthcare Features</h2>
> <p>Advanced cognitive tracking for clinicians</p>
> <button>Explore Features →</button>
> ```
> 
> ✅ **CORRECT**:
> ```tsx
> <h2>{t('healthcare.newFeatures.title')}</h2>
> <p>{t('healthcare.newFeatures.description')}</p>
> <button>
>   <span>{t('healthcare.newFeatures.exploreButton')}</span>
>   <ArrowRight className={isRTL ? 'rtl-flip' : ''} />
> </button>
> ```

---

## 2. Architecture Overview

| Component | Path | Purpose |
| :--- | :--- | :--- |
| **Language Registry** | `web/app/i18n/languages.ts` | Language metadata, native script names, RTL flags. |
| **Translation Dictionaries** | `web/app/i18n/translations.ts` | Complete semantic dictionary for all 23 languages + `getTranslation()`. |
| **Language Context** | `web/app/context/LanguageContext.tsx` | Reactive state, `localStorage` persistence, `t()`, `translateDynamic()`, `isRTL`. |
| **Language Selector** | `web/app/components/LanguageSelector.tsx` | Accessible dropdown UI with real-time search. |
| **Font & RTL Styles** | `web/app/globals.css` | Indic Unicode fallback font stack and RTL styles. |
| **Verification Script** | `web/scripts/check-translations.js` | Automated CI/dev tool to prevent missing translations. |

---

## 3. How to Add a New Translated Feature (Step-by-Step)

### Step 1: Update the Type Definition in `translations.ts`
Add the new keys under the relevant section in `TranslationDictionary`:

```typescript
// web/app/i18n/translations.ts
export type TranslationDictionary = {
  // ... existing sections ...
  healthcare: {
    // ... existing keys ...
    newFeatures: {
      title: string;
      description: string;
      exploreButton: string;
    };
  };
};
```

### Step 2: Add Translations for All 23 Languages in `TRANSLATIONS`
Add the translated text to each of the 23 language dictionaries inside `TRANSLATIONS`:

```typescript
// web/app/i18n/translations.ts
export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    healthcare: {
      newFeatures: {
        title: "New Healthcare Features",
        description: "Advanced cognitive tracking for clinicians.",
        exploreButton: "Explore Features →"
      }
    }
  },
  hi: {
    healthcare: {
      newFeatures: {
        title: "नई स्वास्थ्य सुविधाएं",
        description: "चिकित्सकों के लिए उन्नत संज्ञानात्मक ट्रैकिंग।",
        exploreButton: "सुविधाएं देखें →"
      }
    }
  },
  te: {
    healthcare: {
      newFeatures: {
        title: "కొత్త ఆరోగ్య సంరక్షణ ఫీచర్లు",
        description: "వైద్యుల కోసం అధునాతన జ్ఞాన ట్రాకింగ్.",
        exploreButton: "ఫీచర్లను అన్వేషించండి →"
      }
    }
  },
  ur: {
    healthcare: {
      newFeatures: {
        title: "صحت کی نئی خصوصیات",
        description: "طبی ماہرین کے لیے جدید ادراکی ٹریکنگ۔",
        exploreButton: "خصوصیات دیکھیں →"
      }
    }
  },
  // ... continue for all 23 languages
};
```

### Step 3: Use `useLanguage()` in Your Component
Import `useLanguage` from the context and call `t('section.key')`:

```tsx
'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight } from 'lucide-react';

export function HealthcareFeaturesCard() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="card">
      <h3>{t('healthcare.newFeatures.title')}</h3>
      <p>{t('healthcare.newFeatures.description')}</p>
      <button>
        <span>{t('healthcare.newFeatures.exploreButton')}</span>
        <ArrowRight className={isRTL ? 'rtl-flip' : ''} style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
}
```

---

## 4. Static vs Dynamic Content

| Content Type | Mechanism | Example |
| :--- | :--- | :--- |
| **Static UI Strings** (Headings, buttons, labels, cards, error messages, badges) | **`t('path.key')`** | `t('nav.signIn')` |
| **Dynamic Runtime Text** (Patient notes, custom caregiver instructions from DB/API) | **`translateDynamic(text, src, tgt)`** | `await translateDynamic(noteText, 'en', currentLanguage)` |

### Using `translateDynamic()`
Dynamic translations automatically utilize client-side caching (`mitracare-translation:${src}:${tgt}:${text}`) in `localStorage` to minimize API latency:

```tsx
const { translateDynamic, currentLanguage } = useLanguage();
const [translatedNote, setTranslatedNote] = useState('');

useEffect(() => {
  async function fetchNote() {
    const result = await translateDynamic(rawApiNote, 'en', currentLanguage);
    setTranslatedNote(result);
  }
  fetchNote();
}, [rawApiNote, currentLanguage]);
```

---

## 5. Right-to-Left (RTL) Support

The following languages are configured as RTL:
- **Urdu (`ur`)**
- **Sindhi (`sd`)**
- **Kashmiri (`ks`)**

When an RTL language is selected:
1. `LanguageContext` automatically sets `document.documentElement.dir = 'rtl'` and `document.documentElement.lang = currentLanguage`.
2. Directional icons (arrows, chevrons, back buttons) should include the `.rtl-flip` class or conditional transform:
   ```tsx
   <ArrowRight className={isRTL ? 'rtl-flip' : ''} />
   ```
3. Use directional CSS classes or conditional flex positioning for custom layouts.

---

## 6. Automated Development & CI Verification

Before submitting any code changes, run the automated translation verification script:

```bash
npm run check:i18n
```

This script will:
- Validate that **every single key** exists and is non-empty across all 23 language dictionaries.
- Scan all `.tsx` application files to ensure every `t('key')` call points to a valid dictionary entry.
- Prevent regressions and missing translations.

Finally, verify the build:
```bash
npm run build
```

---

## 7. Supported Language Codes Reference

| Code | Language | Native Name | Script | Direction |
| :--- | :--- | :--- | :--- | :--- |
| `en` | English | English | Latin | LTR |
| `as` | Assamese | অসমীয়া | Bengali-Assamese | LTR |
| `bn` | Bengali | বাংলা | Bengali | LTR |
| `brx`| Bodo | बड़ो | Devanagari | LTR |
| `doi`| Dogri | डोगरी | Devanagari | LTR |
| `gu` | Gujarati | ગુજરાતી | Gujarati | LTR |
| `hi` | Hindi | हिन्दी | Devanagari | LTR |
| `kn` | Kannada | ಕನ್ನಡ | Kannada | LTR |
| `ks` | Kashmiri | کٲشُر | Perso-Arabic / Nastaliq | RTL |
| `kok`| Konkani | कोंकणी | Devanagari | LTR |
| `mai`| Maithili | मैथिली | Devanagari | LTR |
| `ml` | Malayalam | മലയാളം | Malayalam | LTR |
| `mni`| Manipuri | মৈতৈলোন্ | Meetei Mayek / Bengali | LTR |
| `mr` | Marathi | मराठी | Devanagari | LTR |
| `ne` | Nepali | नेपाली | Devanagari | LTR |
| `or` | Odia | ଓଡ଼ିଆ | Odia | LTR |
| `pa` | Punjabi | ਪੰਜਾਬੀ | Gurmukhi | LTR |
| `sa` | Sanskrit | संस्कृतम् | Devanagari | LTR |
| `sat`| Santali | ᱥᱟᱱᱛᱟᱲᱤ | Ol Chiki | LTR |
| `sd` | Sindhi | سنڌي | Perso-Arabic / Sindhi | RTL |
| `ta` | Tamil | தமிழ் | Tamil | LTR |
| `te` | Telugu | తెలుగు | Telugu | LTR |
| `ur` | Urdu | اردو | Perso-Arabic / Nastaliq | RTL |
