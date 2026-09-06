import { IndicProcessor } from './IndicProcessor';
import { SentencePieceBPE } from './SentencePieceBPE';
import { FLORES_TO_ISO } from './languageCodes';

export interface TokenizerOutput {
  input_ids: number[];
  attention_mask: number[];
  pieces: string[];
  preprocessedText: string;
  placeholderMap: Record<string, string>;
}

export class IndicTokenizer {
  private processor: IndicProcessor;
  private bpe: SentencePieceBPE;

  constructor(
    spmPieces: string[],
    srcDict: Record<string, number>,
    tgtDict: Record<string, number>,
    inference: boolean = true
  ) {
    this.processor = new IndicProcessor(inference);
    this.bpe = new SentencePieceBPE(spmPieces, srcDict, tgtDict);
  }

  /**
   * Complete encoding pipeline:
   * raw text -> IndicProcessor preprocessing -> SentencePiece BPE -> token IDs
   */
  public encode(
    text: string,
    srcLang: string,
    tgtLang: string
  ): TokenizerOutput {
    const { preprocessed, placeholderMap } = this.processor.preprocess(
      text,
      srcLang,
      tgtLang
    );

    const { input_ids, attention_mask, pieces } = this.bpe.encode(preprocessed);

    return {
      input_ids,
      attention_mask,
      pieces,
      preprocessedText: preprocessed,
      placeholderMap,
    };
  }

  /**
   * Complete decoding pipeline:
   * token IDs -> SentencePiece piece joining -> IndicProcessor postprocessing
   */
  public decode(
    tokenIds: number[],
    tgtLang: string,
    placeholderMap?: Record<string, string>
  ): string {
    const rawDecoded = this.bpe.decode(tokenIds, true);
    return this.processor.postprocess(rawDecoded, tgtLang, placeholderMap);
  }

  /**
   * Access underlying BPE engine.
   */
  public getBPE(): SentencePieceBPE {
    return this.bpe;
  }

  /**
   * Access underlying IndicProcessor.
   */
  public getProcessor(): IndicProcessor {
    return this.processor;
  }
}
