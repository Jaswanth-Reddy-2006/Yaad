import { Platform } from 'react-native';
import { IndicTokenizer } from './tokenizer/IndicTokenizer';
import { GenerationEngine, GenericInferenceSession } from './GenerationEngine';
import { TranslationDirection } from './types';
import { ModelAssetResolver } from './ModelAssetResolver';

export interface ModelSessionConfig {
  modelDir: string;
  vocabDir?: string;
  direction: TranslationDirection;
  TensorConstructor?: any;
  InferenceSessionCreator?: (modelPath: string, options?: any) => Promise<GenericInferenceSession>;
}

/**
 * Manages ONNX sessions, tokenizer, and generation engine for a translation direction.
 * Universal support for React Native (Hermes on Android/iOS) and Node.js.
 */
export class DirectionalModelSession {
  public readonly direction: TranslationDirection;
  private modelDir: string;
  private vocabDir?: string;

  private tokenizer: IndicTokenizer | null = null;
  private encoderSession: GenericInferenceSession | null = null;
  private decoderSession: GenericInferenceSession | null = null;
  private lmHeadSession: GenericInferenceSession | null = null;
  private generationEngine: GenerationEngine | null = null;

  private TensorConstructor: any = null;
  private InferenceSessionCreator: ((modelPath: string, options?: any) => Promise<GenericInferenceSession>) | null = null;

  private isLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  constructor(config: ModelSessionConfig) {
    this.direction = config.direction;
    this.modelDir = config.modelDir;
    this.vocabDir = config.vocabDir;
    this.TensorConstructor = config.TensorConstructor;
    this.InferenceSessionCreator = config.InferenceSessionCreator || null;
  }

  public getTokenizer(): IndicTokenizer {
    if (!this.tokenizer) {
      throw new Error(`Tokenizer for ${this.direction} is not loaded yet.`);
    }
    return this.tokenizer;
  }

  public getGenerationEngine(): GenerationEngine {
    if (!this.generationEngine) {
      throw new Error(`GenerationEngine for ${this.direction} is not loaded yet.`);
    }
    return this.generationEngine;
  }

  public getIsLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Loads vocabulary and ONNX sessions.
   */
  public async load(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      // 1. Resolve ORT dependencies if not injected
      if (!this.TensorConstructor || !this.InferenceSessionCreator) {
        try {
          const ortRN = require('onnxruntime-react-native');
          this.TensorConstructor = this.TensorConstructor || ortRN.Tensor;
          this.InferenceSessionCreator = this.InferenceSessionCreator || (async (mPath: string, opts?: any) => {
            return await ortRN.InferenceSession.create(mPath, {
              executionProviders: ['cpu'],
              graphOptimizationLevel: 'basic',
              intraOpNumThreads: 2,
              ...opts,
            });
          });
        } catch (e) {
          throw new Error(
            'onnxruntime-react-native could not be loaded: ' + String(e)
          );
        }
      }

      // 2. Load Tokenizer & Vocabularies
      let spmPieces: string[];
      let srcDict: Record<string, number>;
      let tgtDict: Record<string, number>;

      if (this.direction === 'indic-en') {
        spmPieces = require('../../assets/models/vocab/indic-en/spm_src_vocab.json');
        srcDict = require('../../assets/models/vocab/indic-en/dict.SRC.json');
        tgtDict = require('../../assets/models/vocab/indic-en/dict.TGT.json');
      } else {
        spmPieces = require('../../assets/models/vocab/en-indic/spm_src_vocab.json');
        srcDict = require('../../assets/models/vocab/en-indic/dict.SRC.json');
        tgtDict = require('../../assets/models/vocab/en-indic/dict.TGT.json');
      }

      this.tokenizer = new IndicTokenizer(spmPieces, srcDict, tgtDict, true);

      // 3. Resolve Model Paths
      let encoderPath: string;
      let decoderPath: string;
      let lmHeadPath: string;

      if (this.modelDir && this.modelDir.trim() !== '' && this.modelDir !== 'bundled') {
        const modelPathPrefix = this.modelDir.replace(/\\/g, '/').replace(/\/$/, '');
        encoderPath = `${modelPathPrefix}/encoder.onnx`;
        decoderPath = `${modelPathPrefix}/decoder.onnx`;
        lmHeadPath = `${modelPathPrefix}/lm_head.onnx`;
      } else {
        const resolved = await ModelAssetResolver.resolveModelPaths(this.direction);
        encoderPath = resolved.encoderPath;
        decoderPath = resolved.decoderPath;
        lmHeadPath = resolved.lmHeadPath;
      }

      // 4. Load ONNX Sessions
      const [encSession, decSession, lmSession] = await Promise.all([
        this.InferenceSessionCreator!(encoderPath),
        this.InferenceSessionCreator!(decoderPath),
        this.InferenceSessionCreator!(lmHeadPath),
      ]);

      this.encoderSession = encSession;
      this.decoderSession = decSession;
      this.lmHeadSession = lmSession;

      // 5. Instantiate Generation Engine
      this.generationEngine = new GenerationEngine(
        this.encoderSession,
        this.decoderSession,
        this.lmHeadSession,
        this.TensorConstructor
      );

      this.isLoaded = true;
    })();

    await this.loadPromise;
    this.loadPromise = null;
  }

  /**
   * Releases ONNX sessions and frees memory.
   */
  public async unload(): Promise<void> {
    this.isLoaded = false;
    this.generationEngine = null;
    this.tokenizer = null;

    if (this.encoderSession && typeof (this.encoderSession as any).dispose === 'function') {
      try { (this.encoderSession as any).dispose(); } catch {}
    }
    if (this.decoderSession && typeof (this.decoderSession as any).dispose === 'function') {
      try { (this.decoderSession as any).dispose(); } catch {}
    }
    if (this.lmHeadSession && typeof (this.lmHeadSession as any).dispose === 'function') {
      try { (this.lmHeadSession as any).dispose(); } catch {}
    }

    this.encoderSession = null;
    this.decoderSession = null;
    this.lmHeadSession = null;
  }
}
