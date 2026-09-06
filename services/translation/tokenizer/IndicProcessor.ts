import {
  FLORES_TO_ISO,
  SCRIPT_RANGES,
  COORDINATED_RANGE_START_INCLUSIVE,
  COORDINATED_RANGE_END_INCLUSIVE,
  NON_TRANSLITERATE_SCRIPTS,
} from './languageCodes';

/**
 * Digit translation map from all Indic scripts to ASCII 0-9.
 */
const INDIC_DIGITS_MAP: Record<string, string> = {
  '\u09e6': '0', '\u0ae6': '0', '\u0ce6': '0', '\u0966': '0',
  '\u0660': '0', '\uabf0': '0', '\u0b66': '0', '\u0a66': '0',
  '\u1c50': '0', '\u06f0': '0',

  '\u09e7': '1', '\u0ae7': '1', '\u0967': '1', '\u0ce7': '1',
  '\u06f1': '1', '\uabf1': '1', '\u0b67': '1', '\u0a67': '1',
  '\u1c51': '1', '\u0c67': '1',

  '\u09e8': '2', '\u0ae8': '2', '\u0968': '2', '\u0ce8': '2',
  '\u06f2': '2', '\uabf2': '2', '\u0b68': '2', '\u0a68': '2',
  '\u1c52': '2', '\u0c68': '2',

  '\u09e9': '3', '\u0ae9': '3', '\u0969': '3', '\u0ce9': '3',
  '\u06f3': '3', '\uabf3': '3', '\u0b69': '3', '\u0a69': '3',
  '\u1c53': '3', '\u0c69': '3',

  '\u09ea': '4', '\u0aea': '4', '\u096a': '4', '\u0cea': '4',
  '\u06f4': '4', '\uabf4': '4', '\u0b6a': '4', '\u0a6a': '4',
  '\u1c54': '4', '\u0c6a': '4',

  '\u09eb': '5', '\u0aeb': '5', '\u096b': '5', '\u0ceb': '5',
  '\u06f5': '5', '\uabf5': '5', '\u0b6b': '5', '\u0a6b': '5',
  '\u1c55': '5', '\u0c6b': '5',

  '\u09ec': '6', '\u0aec': '6', '\u096c': '6', '\u0cec': '6',
  '\u06f6': '6', '\uabf6': '6', '\u0b6c': '6', '\u0a6c': '6',
  '\u1c56': '6', '\u0c6c': '6',

  '\u09ed': '7', '\u0aed': '7', '\u096d': '7', '\u0ced': '7',
  '\u06f7': '7', '\uabf7': '7', '\u0b6d': '7', '\u0a6d': '7',
  '\u1c57': '7', '\u0c6d': '7',

  '\u09ee': '8', '\u0aee': '8', '\u096e': '8', '\u0cee': '8',
  '\u06f8': '8', '\uabf8': '8', '\u0b6e': '8', '\u0a6e': '8',
  '\u1c58': '8', '\u0c6e': '8',

  '\u09ef': '9', '\u0aef': '9', '\u096f': '9', '\u0cef': '9',
  '\u06f9': '9', '\uabf9': '9', '\u0b6f': '9', '\u0a6f': '9',
  '\u1c59': '9', '\u0c6f': '9',
};

const INDIC_FAILURE_CASES = [
  'आइडि', 'आईडी', 'आई . डी . ', 'आई . डी .', 'आई. डी. ', 'आई. डी.',
  'आय. डी. ', 'आय. डी.', 'आय . डी . ', 'आय . डी .', 'आइ . डी . ',
  'आइ . डी .', 'आइ. डी. ', 'आइ. डी.', 'ऐटि', 'आयडी', 'ऐडि', 'آی ڈی ', 'آئی ڈی '
];

export class UnicodeIndicTransliterator {
  private static correctTamilMapping(offset: number): number {
    if (
      offset >= 0x15 &&
      offset <= 0x28 &&
      offset !== 0x1c &&
      !((offset - 0x15) % 5 === 0 || (offset - 0x15) % 5 === 4)
    ) {
      const substChar = Math.floor((offset - 0x15) / 5);
      offset = 0x15 + 5 * substChar;
    }
    if (offset === 0x2b || offset === 0x2c || offset === 0x2d) {
      offset = 0x2a;
    }
    if (offset === 0x36) {
      offset = 0x37;
    }
    return offset;
  }

  public static transliterate(
    text: string,
    lang1Code: string,
    lang2Code: string
  ): string {
    if (!(lang1Code in SCRIPT_RANGES) || !(lang2Code in SCRIPT_RANGES)) {
      return text;
    }

    const range1 = SCRIPT_RANGES[lang1Code][0];
    const range2 = SCRIPT_RANGES[lang2Code][0];
    const out: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const code = c.charCodeAt(0);
      let offset = code - range1;

      if (
        offset >= COORDINATED_RANGE_START_INCLUSIVE &&
        offset <= COORDINATED_RANGE_END_INCLUSIVE &&
        c !== '\u0964' &&
        c !== '\u0965'
      ) {
        if (lang2Code === 'ta') {
          offset = UnicodeIndicTransliterator.correctTamilMapping(offset);
        }
        out.push(String.fromCharCode(range2 + offset));
      } else {
        out.push(c);
      }
    }

    return out.join('');
  }
}

export class IndicProcessor {
  private inference: boolean;
  private placeholderQueue: Record<string, string>[] = [];

  constructor(inference: boolean = true) {
    this.inference = inference;
  }

  /**
   * Punctuation Normalization
   */
  public puncNorm(text: string): string {
    let s = text.replace(/\r/g, '');
    s = s.replace(/\(\s*/g, '(');
    s = s.replace(/\s*\)/g, ')');
    s = s.replace(/\s:\s?/g, ':');
    s = s.replace(/\s;\s?/g, ';');
    s = s.replace(/[`´‘‚’]/g, "'");
    s = s.replace(/[„“”«»]/g, '"');
    s = s.replace(/[–—]/g, '-');
    s = s.replace(/\.\.\./g, '...');
    s = s.replace(/\u00a0%/g, '%');
    s = s.replace(/nº\u00a0/g, 'nº ');
    s = s.replace(/\u00a0ºC/g, ' ºC');
    s = s.replace(/\u00a0([?!;])/g, '$1');
    s = s.replace(/,\u00a0/g, ', ');

    s = s.replace(/[ ]{2,}/g, ' ');
    s = s.replace(/\) ([\.!:?;,])/g, ')$1');
    s = s.replace(/(\d) %/g, '$1%');
    s = s.replace(/"([,\.]+)/g, '$1"');
    s = s.replace(/(\d)\u00a0(\d)/g, '$1.$2');

    return s.trim();
  }

  /**
   * Translate Indic digits to ASCII 0-9
   */
  public translateDigits(text: string): string {
    const chars = text.split('');
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (INDIC_DIGITS_MAP[c]) {
        chars[i] = INDIC_DIGITS_MAP[c];
      }
    }
    return chars.join('');
  }

  /**
   * Wrap URLs, emails, numerals with placeholder tokens
   */
  public wrapWithPlaceholders(text: string): { text: string; placeholderMap: Record<string, string> } {
    let serialNo = 1;
    const placeholderMap: Record<string, string> = {};

    const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
    const urlPattern = /\b(?:https?:\/\/|ftp:\/\/)?(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}(?:\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;%=]*)?\b/g;
    const numeralPattern = /(?:~?\d+\.?\d*\s?%?\s?-?\s?~?\d+\.?\d*\s?%|~?\d+%|\d+[-\/.,:']\d+[-\/.,:'+]\d+(?:\.\d+)?|\d+[-\/.:'+]\d+(?:\.\d+)?)/g;
    const otherPattern = /[A-Za-z0-9]*[#|@]\w+/g;

    const patterns = [emailPattern, urlPattern, numeralPattern, otherPattern];

    for (const pat of patterns) {
      const matches = Array.from(new Set(text.match(pat) || []));
      for (const match of matches) {
        if (pat === urlPattern && match.replace(/\./g, '').length < 4) continue;
        if (pat === numeralPattern && match.replace(/[\s.:]/g, '').length < 4) continue;

        const basePlaceholder = `<ID${serialNo}>`;
        placeholderMap[`<ID${serialNo}>`] = match;
        placeholderMap[`< ID${serialNo} >`] = match;
        placeholderMap[`[ID${serialNo}]`] = match;
        placeholderMap[`[ ID${serialNo} ]`] = match;
        placeholderMap[`[ID ${serialNo}]`] = match;
        placeholderMap[`<ID${serialNo}]`] = match;
        placeholderMap[`< ID${serialNo}]`] = match;
        placeholderMap[`<ID${serialNo} ]`] = match;
        placeholderMap[`<id${serialNo}>`] = match;
        placeholderMap[`< id${serialNo} >`] = match;
        placeholderMap[`[id${serialNo}]`] = match;
        placeholderMap[`[ id${serialNo} ]`] = match;

        for (const failureCase of INDIC_FAILURE_CASES) {
          placeholderMap[`<${failureCase}${serialNo}>`] = match;
          placeholderMap[`< ${failureCase}${serialNo} >`] = match;
          placeholderMap[`< ${failureCase} ${serialNo} >`] = match;
          placeholderMap[`[${failureCase}${serialNo}]`] = match;
          placeholderMap[`[${failureCase} ${serialNo}]`] = match;
        }

        text = text.split(match).join(basePlaceholder);
        serialNo++;
      }
    }

    text = text.replace(/\s+/g, ' ').replace(/>\//g, '>').replace(/\]\//g, ']');
    return { text, placeholderMap };
  }

  /**
   * Indic trivial tokenization
   */
  public trivialTokenizeIndic(text: string): string[] {
    const puncPattern = /([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~\u0964\u0965\uAAF1\uAAF0\uABEB\uABEC\uABED\uABEE\uABEF\u1C7E\u1C7F])/g;
    let tokStr = text.replace(/\t/g, ' ').replace(puncPattern, ' $1 ');
    tokStr = tokStr.replace(/[ ]+/g, ' ').trim();

    // Preserve numbers and dates
    const numSeqPattern = /([0-9]+ [,.:/] )+[0-9]+/g;
    const parts: string[] = [];
    let prev = 0;
    let match: RegExpExecArray | null;

    while ((match = numSeqPattern.exec(tokStr)) !== null) {
      const start = match.index;
      const end = numSeqPattern.lastIndex;
      if (start > prev) {
        parts.push(tokStr.slice(prev, start));
      }
      parts.push(match[0].replace(/ /g, ''));
      prev = end;
    }
    parts.push(tokStr.slice(prev));

    return parts.join('').split(' ').filter(Boolean);
  }

  /**
   * Indic trivial detokenization
   */
  public trivialDetokenizeIndic(text: string): string {
    let s = text;
    // Number sequences
    const numSeqPattern = /([0-9]+ [,.:/] )+[0-9]+/g;
    const parts: string[] = [];
    let prev = 0;
    let match: RegExpExecArray | null;

    while ((match = numSeqPattern.exec(s)) !== null) {
      const start = match.index;
      const end = numSeqPattern.lastIndex;
      if (start > prev) {
        parts.push(s.slice(prev, start));
      }
      parts.push(match[0].replace(/ /g, ''));
      prev = end;
    }
    parts.push(s.slice(prev));
    s = parts.join('');

    // Left attach
    s = s.replace(/[ ]([!%)\]},.:;>?\u0964\u0965])/g, '$1');
    // Right attach
    s = s.replace(/([#$(\[{<@])[ ]/g, '$1');
    // Left-right attach
    s = s.replace(/[ ]([-\/\\])[ ]/g, '$1');

    // Quote alternating
    const quotes = ["'", '"', '`'];
    for (const punc of quotes) {
      let cnt = 0;
      const out: string[] = [];
      for (let i = 0; i < s.length; i++) {
        if (s[i] === punc) {
          out.push(cnt % 2 === 0 ? '@RA' : '@LA');
          cnt++;
        } else {
          out.push(s[i]);
        }
      }
      s = out.join('')
        .replace(/@RA /g, punc)
        .replace(/ @LA/g, punc)
        .replace(/@RA/g, punc)
        .replace(/@LA/g, punc);
    }

    return s.trim();
  }

  /**
   * English tokenization (Moses style)
   */
  public tokenizeEnglish(text: string): string[] {
    let s = text.trim();
    s = s.replace(/[`´‘’]/g, "'").replace(/[“”„«»]/g, '"').replace(/[–—]/g, '-');
    s = s.replace(/([,\.\?!:;\(\)\[\]\{\}"'<>%$\/\\=+\*&^#@~])/g, ' $1 ');
    s = s.replace(/' (s|re|ve|d|m|ll|t) /gi, " '$1 ");
    s = s.replace(/n ' t /gi, " n't ");
    return s.replace(/[ ]+/g, ' ').trim().split(' ').filter(Boolean);
  }

  /**
   * English detokenization (Moses style)
   */
  public detokenizeEnglish(text: string): string {
    let s = text;
    s = s.replace(/[ ]([!%),.:;>?])/g, '$1');
    s = s.replace(/([#$([{<@])[ ]/g, '$1');
    s = s.replace(/[ ]('s|'ve|'re|'m|'ll|'d|n't)/gi, '$1');
    s = s.replace(/[ ](')(?=[a-zA-Z])/g, '$1');

    let quoteCount = 0;
    s = s.replace(/"/g, () => {
      quoteCount++;
      return quoteCount % 2 === 1 ? '" ' : ' "';
    });
    s = s.replace(/" /g, '"').replace(/ "/g, '"');

    return s.replace(/[ ]+/g, ' ').trim();
  }

  /**
   * Preprocess a single sentence for translation.
   */
  public preprocess(
    sent: string,
    srcLang: string,
    tgtLang: string,
    isTarget: boolean = false
  ): { preprocessed: string; placeholderMap: Record<string, string> } {
    const isoLang = FLORES_TO_ISO[srcLang] || 'hi';
    const scriptPart = srcLang.split('_')[1] || 'Deva';
    const doTransliterate = !NON_TRANSLITERATE_SCRIPTS.has(scriptPart);

    // 1) Punctuation normalization
    let text = this.puncNorm(sent);

    // 2) Digit normalization
    text = this.translateDigits(text);

    // 3) Wrap placeholders
    let placeholderMap: Record<string, string> = {};
    if (this.inference) {
      const res = this.wrapWithPlaceholders(text);
      text = res.text;
      placeholderMap = res.placeholderMap;
      this.placeholderQueue.push(placeholderMap);
    }

    // 4) Tokenization & Transliteration
    let processedSent: string;
    if (isoLang === 'en') {
      const tokens = this.tokenizeEnglish(text);
      processedSent = tokens.join(' ');
    } else {
      const tokens = this.trivialTokenizeIndic(text);
      let joined = tokens.join(' ');
      if (doTransliterate) {
        joined = UnicodeIndicTransliterator.transliterate(joined, isoLang, 'hi');
        joined = joined.replace(/ ् /g, '्');
      }
      processedSent = joined;
    }

    processedSent = processedSent.trim();
    if (!isTarget) {
      return {
        preprocessed: `${srcLang} ${tgtLang} ${processedSent}`,
        placeholderMap,
      };
    } else {
      return {
        preprocessed: processedSent,
        placeholderMap,
      };
    }
  }

  /**
   * Postprocess translated string to restore placeholders and detokenize.
   */
  public postprocess(
    sent: string,
    lang: string,
    placeholderMap?: Record<string, string>
  ): string {
    const [langCode, scriptCode] = lang.split('_');
    const isoLang = FLORES_TO_ISO[lang] || 'hi';

    const map = placeholderMap || (this.placeholderQueue.length > 0 ? this.placeholderQueue.shift()! : {});

    let s = sent;

    // Fix Perso-Arabic scripts
    if (scriptCode === 'Arab' || scriptCode === 'Aran') {
      s = s.replace(/ ؟/g, '؟')
           .replace(/ ۔/g, '۔')
           .replace(/ ،/g, '،')
           .replace(/ٮ۪/g, 'ؠ');
    }

    // Oriya fix
    if (langCode === 'ory') {
      s = s.replace(/ଯ଼/g, 'ୟ');
    }

    // Restore placeholders
    for (const [k, v] of Object.entries(map)) {
      s = s.split(k).join(v);
    }

    // Detokenize
    if (lang === 'eng_Latn') {
      return this.detokenizeEnglish(s);
    } else {
      const xlated = UnicodeIndicTransliterator.transliterate(s, 'hi', isoLang);
      return this.trivialDetokenizeIndic(xlated);
    }
  }
}
