import { GenerationConfig, TranslationMetrics } from './types';

/**
 * Interface representing an ONNX Inference Session.
 * Compatible with onnxruntime-react-native and onnxruntime-node.
 */
export interface GenericInferenceSession {
  run(feeds: Record<string, any>): Promise<Record<string, any>>;
}

/**
 * Autoregressive greedy decoding engine.
 * Maintains encoder_hidden_states and encoder_attention_mask on EVERY step.
 */
export class GenerationEngine {
  private encoderSession: GenericInferenceSession;
  private decoderSession: GenericInferenceSession;
  private lmHeadSession: GenericInferenceSession;
  private config: GenerationConfig;
  private TensorConstructor: any;

  constructor(
    encoderSession: GenericInferenceSession,
    decoderSession: GenericInferenceSession,
    lmHeadSession: GenericInferenceSession,
    TensorConstructor: any,
    config?: Partial<GenerationConfig>
  ) {
    this.encoderSession = encoderSession;
    this.decoderSession = decoderSession;
    this.lmHeadSession = lmHeadSession;
    this.TensorConstructor = TensorConstructor;

    this.config = {
      decoderStartTokenId: 2,
      eosTokenId: 2,
      padTokenId: 1,
      bosTokenId: 0,
      maxLength: 256,
      hiddenDim: 512,
      ...config,
    };
  }

  /**
   * Helper to construct an int64 tensor.
   */
  private createInt64Tensor(data: number[], dims: number[]): any {
    const bigIntData = BigInt64Array.from(data.map((x) => BigInt(x)));
    return new this.TensorConstructor('int64', bigIntData, dims);
  }

  /**
   * Helper to construct a float32 tensor.
   */
  private createFloat32Tensor(data: Float32Array, dims: number[]): any {
    return new this.TensorConstructor('float32', data, dims);
  }

  /**
   * Runs the encoder and full greedy autoregressive decoder loop.
   */
  public async generate(
    inputIds: number[],
    attentionMask: number[],
    maxLength?: number
  ): Promise<{ tokens: number[]; metrics: Partial<TranslationMetrics> }> {
    const maxLen = maxLength || this.config.maxLength;

    const metrics: Partial<TranslationMetrics> = {};
    const stepTimesMs: number[] = [];

    // ==========================================
    // 1. Encoder Forward Pass
    // ==========================================
    const tEncStart = Date.now();

    const encInputTensor = this.createInt64Tensor(inputIds, [1, inputIds.length]);
    const encMaskTensor = this.createInt64Tensor(attentionMask, [1, attentionMask.length]);

    const encFeeds = {
      input_ids: encInputTensor,
      attention_mask: encMaskTensor,
    };

    const encResults = await this.encoderSession.run(encFeeds);
    const lastHiddenState = encResults.last_hidden_state || Object.values(encResults)[0];

    if (!lastHiddenState || !lastHiddenState.data) {
      throw new Error('Encoder did not return last_hidden_state tensor');
    }

    // Determine hidden dimension dynamically (e.g. 512 or 1024)
    const hiddenDim = (lastHiddenState.dims && lastHiddenState.dims[2])
      ? lastHiddenState.dims[2]
      : this.config.hiddenDim;

    metrics.encoderMs = Date.now() - tEncStart;

    // Retain encoder_hidden_states for ALL autoregressive decoder steps
    const encoderHiddenStatesTensor = lastHiddenState;
    const encoderAttentionMaskTensor = encMaskTensor;

    // ==========================================
    // 2. Autoregressive Greedy Decoder Loop
    // ==========================================
    const tDecStart = Date.now();
    const generatedTokens: number[] = [this.config.decoderStartTokenId];

    for (let step = 1; step < maxLen; step++) {
      const tStepStart = Date.now();

      // Decoder input tokens: [1, seq_len]
      const decInputTensor = this.createInt64Tensor(generatedTokens, [1, generatedTokens.length]);
      const decMask = new Array(generatedTokens.length).fill(1);
      const decMaskTensor = this.createInt64Tensor(decMask, [1, decMask.length]);

      // CRITICAL: encoder_hidden_states & encoder_attention_mask preserved on EVERY step
      const decFeeds = {
        decoder_input_ids: decInputTensor,
        attention_mask: decMaskTensor,
        encoder_hidden_states: encoderHiddenStatesTensor,
        encoder_attention_mask: encoderAttentionMaskTensor,
      };

      const decResults = await this.decoderSession.run(decFeeds);
      const decOutput = decResults.last_hidden_state || Object.values(decResults)[0];

      if (!decOutput || !decOutput.data) {
        throw new Error(`Decoder step ${step} did not return valid output tensor`);
      }

      // Slice the last hidden state: shape [1, 1, hiddenDim]
      const totalLen = generatedTokens.length;
      const startOffset = (totalLen - 1) * hiddenDim;
      const lastHiddenData = new Float32Array(hiddenDim);
      for (let d = 0; d < hiddenDim; d++) {
        lastHiddenData[d] = decOutput.data[startOffset + d];
      }
      const lastHiddenTensor = this.createFloat32Tensor(lastHiddenData, [1, 1, hiddenDim]);

      // LM Head projection
      const lmFeeds = {
        hidden_states: lastHiddenTensor,
      };

      const lmResults = await this.lmHeadSession.run(lmFeeds);
      const logitsTensor = lmResults.logits || Object.values(lmResults)[0];

      if (!logitsTensor || !logitsTensor.data) {
        throw new Error(`LM Head at step ${step} did not return logits tensor`);
      }

      // Argmax over logits (vocabulary)
      const logitsData = logitsTensor.data as Float32Array;
      let maxVal = -Infinity;
      let nextToken = this.config.eosTokenId;

      for (let i = 0; i < logitsData.length; i++) {
        if (logitsData[i] > maxVal) {
          maxVal = logitsData[i];
          nextToken = i;
        }
      }

      generatedTokens.push(nextToken);
      stepTimesMs.push(Date.now() - tStepStart);

      // Stop condition: EOS token encountered
      if (nextToken === this.config.eosTokenId) {
        break;
      }
    }

    metrics.decoderMs = Date.now() - tDecStart;
    metrics.stepTimesMs = stepTimesMs;
    metrics.tokensGenerated = generatedTokens.length;

    return {
      tokens: generatedTokens,
      metrics,
    };
  }
}
