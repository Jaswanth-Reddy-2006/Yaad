/**
 * Pure TypeScript SentencePiece BPE tokenizer.
 * Performs fast greedy pair merges using vocabulary piece ranks.
 */

export class SentencePieceBPE {
  private pieceRanks: Map<string, number>;
  private srcDict: Record<string, number>;
  private tgtDict: Record<string, number>;
  private tgtInvDict: Map<number, string>;

  public unkTokenId: number = 3;
  public padTokenId: number = 1;
  public eosTokenId: number = 2;
  public bosTokenId: number = 0;

  constructor(
    spmPieces: string[],
    srcDict: Record<string, number>,
    tgtDict: Record<string, number>
  ) {
    this.pieceRanks = new Map<string, number>();
    for (let i = 0; i < spmPieces.length; i++) {
      this.pieceRanks.set(spmPieces[i], i);
    }

    this.srcDict = srcDict;
    this.tgtDict = tgtDict;
    this.tgtInvDict = new Map<number, string>();
    for (const [token, id] of Object.entries(tgtDict)) {
      this.tgtInvDict.set(id, token);
    }

    if (srcDict['<unk>'] !== undefined) this.unkTokenId = srcDict['<unk>'];
    if (srcDict['<pad>'] !== undefined) this.padTokenId = srcDict['<pad>'];
    if (srcDict['</s>'] !== undefined) this.eosTokenId = srcDict['</s>'];
    if (srcDict['<s>'] !== undefined) this.bosTokenId = srcDict['<s>'];
  }

  /**
   * Tokenize a single word into BPE pieces.
   */
  public tokenizeWord(word: string): string[] {
    if (!word) return [];

    // Characters in word (SentencePiece dummy prefix \u2581 already added)
    let symbols = Array.from(word);

    while (symbols.length > 1) {
      let bestPairIdx = -1;
      let bestRank = Infinity;

      for (let i = 0; i < symbols.length - 1; i++) {
        const pair = symbols[i] + symbols[i + 1];
        const rank = this.pieceRanks.get(pair);
        if (rank !== undefined && rank < bestRank) {
          bestRank = rank;
          bestPairIdx = i;
        }
      }

      if (bestPairIdx === -1) {
        break;
      }

      const merged = symbols[bestPairIdx] + symbols[bestPairIdx + 1];
      symbols.splice(bestPairIdx, 2, merged);
    }

    return symbols;
  }

  /**
   * Tokenize a preprocessed sentence into SentencePiece pieces.
   * Input format: "<src_lang> <tgt_lang> <text>"
   */
  public tokenize(preprocessedText: string): string[] {
    const parts = preprocessedText.trim().split(' ');
    if (parts.length < 3) {
      return parts;
    }

    const srcLang = parts[0];
    const tgtLang = parts[1];
    const words = parts.slice(2);

    const pieces: string[] = [srcLang, tgtLang];

    for (const word of words) {
      if (!word) continue;
      const wordWithPrefix = '\u2581' + word;
      const wordPieces = this.tokenizeWord(wordWithPrefix);
      for (let i = 0; i < wordPieces.length; i++) {
        pieces.push(wordPieces[i]);
      }
    }

    return pieces;
  }

  /**
   * Convert pieces to model token IDs, appending EOS (</s> = 2).
   */
  public encode(preprocessedText: string): { input_ids: number[]; attention_mask: number[]; pieces: string[] } {
    const pieces = this.tokenize(preprocessedText);
    const input_ids: number[] = [];

    for (const piece of pieces) {
      const id = this.srcDict[piece] !== undefined ? this.srcDict[piece] : this.unkTokenId;
      input_ids.push(id);
    }

    // Append EOS token
    input_ids.push(this.eosTokenId);

    const attention_mask = new Array(input_ids.length).fill(1);

    return {
      input_ids,
      attention_mask,
      pieces,
    };
  }

  /**
   * Decode target token IDs into string.
   */
  public decode(tokenIds: number[], skipSpecialTokens: boolean = true): string {
    const pieces: string[] = [];

    for (const id of tokenIds) {
      if (skipSpecialTokens && (id === 0 || id === 1 || id === 2 || id === 3)) {
        continue;
      }
      const piece = this.tgtInvDict.get(id);
      if (piece) {
        pieces.push(piece);
      }
    }

    return pieces.join('').replace(/\u2581/g, ' ').trim();
  }
}
