/**
 * OnnxTest.ts
 * Isolated Proof of Concept for ONNX Runtime React Native
 * 
 * Verifies:
 * 1. Native ONNX Runtime initialization
 * 2. Model session creation (CPU Execution Provider)
 * 3. Tensor allocation and data passing
 * 4. Zero-network, offline mathematical inference
 */

import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import { Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export interface OnnxTestResult {
  success: boolean;
  modelLoaded: boolean;
  input: number[];
  output: number[];
  expected: number[];
  latencyMs: number;
  message: string;
  isNativeSupported: boolean;
}

export class OnnxProofOfConcept {
  private static session: InferenceSession | null = null;

  /**
   * Resolves the local path for the bundled tiny_test.onnx model
   */
  public static async getModelUri(): Promise<string> {
    try {
      const asset = Asset.fromModule(require('../../assets/models/tiny_test.onnx'));
      await asset.downloadAsync();
      return asset.localUri || asset.uri;
    } catch (e) {
      // Fallback path if Asset.fromModule is not yet downloaded
      return `${Paths.document.uri}/models/tiny_test.onnx`;
    }
  }

  /**
   * Executes a single test inference using onnxruntime-react-native
   */
  public static async runTest(): Promise<OnnxTestResult> {
    const startTime = Date.now();
    const inputData = Float32Array.from([1.0, 2.0, 3.0]);
    const expectedOutput = [3.0, 6.0, 9.0]; // Formula: y = 2*x + [1, 2, 3]

    try {
      const modelPath = await this.getModelUri();

      // Create ONNX inference session
      if (!this.session) {
        this.session = await InferenceSession.create(modelPath, {
          executionProviders: ['cpu'],
          graphOptimizationLevel: 'all',
        });
      }

      // Prepare input tensor: shape [1, 3]
      const inputTensor = new Tensor('float32', inputData, [1, 3]);

      // Run inference
      const feeds = { input: inputTensor };
      const results = await this.session.run(feeds);

      const outputTensor = results.output;
      if (!outputTensor) {
        throw new Error('No output tensor returned from ONNX session');
      }

      const outputValues = Array.from(outputTensor.data as Float32Array);
      const latencyMs = Date.now() - startTime;

      // Verify numerical correctness within epsilon
      const isCorrect = outputValues.every(
        (val, i) => Math.abs(val - expectedOutput[i]) < 1e-4
      );

      return {
        success: isCorrect,
        modelLoaded: true,
        input: Array.from(inputData),
        output: outputValues,
        expected: expectedOutput,
        latencyMs,
        message: isCorrect
          ? 'ONNX Runtime native inference executed successfully!'
          : `Output mismatch: got ${JSON.stringify(outputValues)}, expected ${JSON.stringify(expectedOutput)}`,
        isNativeSupported: Platform.OS === 'android' || Platform.OS === 'ios',
      };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        modelLoaded: false,
        input: Array.from(inputData),
        output: [],
        expected: expectedOutput,
        latencyMs,
        message: error?.message || String(error),
        isNativeSupported: Platform.OS === 'android' || Platform.OS === 'ios',
      };
    }
  }
}

export const runOnnxProofOfConcept = () => OnnxProofOfConcept.runTest();
