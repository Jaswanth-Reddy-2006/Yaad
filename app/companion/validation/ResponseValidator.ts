export interface ValidationResult {
  isValid: boolean;
  sanitizedResponse: string;
  reason?: string;
}

export class ResponseValidator {
  private static readonly MAX_CHAR_LENGTH = 300;
  private static readonly DISALLOWED_PATTERNS = [
    /\b(as an ai|as a language model|i am an ai|i am a large language model)\b/i,
    /\b(kill yourself|commit suicide|take all your pills|harm yourself)\b/i,
  ];

  /**
   * Cleans up and formats raw LLM output into speech-friendly, dementia-appropriate text.
   */
  public static sanitize(text: string): string {
    if (!text) return '';

    let cleaned = text.trim();

    // Remove markdown formatting like bold, italics, headers, code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
    cleaned = cleaned.replace(/#{1,6}\s+/g, '');
    cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
    cleaned = cleaned.replace(/^[\*\-\+]\s+/gm, '');
    cleaned = cleaned.replace(/^\d+\.\s+/gm, '');

    // Strip assistant prefixes
    cleaned = cleaned.replace(/^(Assistant|AI|Mitra|Companion):\s*/i, '');

    // Replace multiple spaces or newlines with a single space
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Cap at reasonable sentence boundary if too long
    if (cleaned.length > this.MAX_CHAR_LENGTH) {
      const truncated = cleaned.slice(0, this.MAX_CHAR_LENGTH);
      const lastPunctuation = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?')
      );
      if (lastPunctuation > 40) {
        cleaned = truncated.slice(0, lastPunctuation + 1);
      } else {
        cleaned = truncated + '...';
      }
    }

    return cleaned;
  }

  /**
   * Validates whether a response from Groq/LLM is safe and suitable for a dementia patient.
   */
  public static validate(rawResponse: string): ValidationResult {
    if (!rawResponse || typeof rawResponse !== 'string') {
      return { isValid: false, sanitizedResponse: '', reason: 'Empty response' };
    }

    const sanitized = this.sanitize(rawResponse);

    if (sanitized.length < 3) {
      return { isValid: false, sanitizedResponse: '', reason: 'Response too short' };
    }

    for (const pattern of this.DISALLOWED_PATTERNS) {
      if (pattern.test(sanitized)) {
        return {
          isValid: false,
          sanitizedResponse: '',
          reason: `Violated safety filter: ${pattern.source}`,
        };
      }
    }

    return {
      isValid: true,
      sanitizedResponse: sanitized,
    };
  }
}
