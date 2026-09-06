import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { TranslationDirection } from './types';

export interface ResolvedDirectionModels {
  encoderPath: string;
  decoderPath: string;
  lmHeadPath: string;
}

// In-memory cache for resolved local file paths
const resolvedPathCache = new Map<TranslationDirection, ResolvedDirectionModels>();

/**
 * Resolves bundled ONNX model assets to accessible local filesystem paths.
 * Works completely offline without network requests.
 */
export class ModelAssetResolver {
  public static async resolveModelPaths(direction: TranslationDirection): Promise<ResolvedDirectionModels> {
    const cached = resolvedPathCache.get(direction);
    if (cached) {
      return cached;
    }

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      let encoderModule: any;
      let decoderModule: any;
      let lmHeadModule: any;

      if (direction === 'indic-en') {
        encoderModule = require('../../assets/models/onnx/indic-en-onnx-int8/encoder.onnx');
        decoderModule = require('../../assets/models/onnx/indic-en-onnx-int8/decoder.onnx');
        lmHeadModule = require('../../assets/models/onnx/indic-en-onnx-int8/lm_head.onnx');
      } else {
        encoderModule = require('../../assets/models/onnx/en-indic-onnx-int8/encoder.onnx');
        decoderModule = require('../../assets/models/onnx/en-indic-onnx-int8/decoder.onnx');
        lmHeadModule = require('../../assets/models/onnx/en-indic-onnx-int8/lm_head.onnx');
      }

      const [encAsset, decAsset, lmAsset] = await Promise.all([
        Asset.fromModule(encoderModule).downloadAsync(),
        Asset.fromModule(decoderModule).downloadAsync(),
        Asset.fromModule(lmHeadModule).downloadAsync(),
      ]);

      const encoderPath = this.normalizeLocalPath(encAsset.localUri || encAsset.uri);
      const decoderPath = this.normalizeLocalPath(decAsset.localUri || decAsset.uri);
      const lmHeadPath = this.normalizeLocalPath(lmAsset.localUri || lmAsset.uri);

      const resolved: ResolvedDirectionModels = {
        encoderPath,
        decoderPath,
        lmHeadPath,
      };

      resolvedPathCache.set(direction, resolved);
      return resolved;
    } else {
      // Desktop / Node / Jest environment
      const path = require('path');
      const baseDir = path.resolve(__dirname, `../../assets/models/onnx/${direction}-onnx-int8`);
      const resolved: ResolvedDirectionModels = {
        encoderPath: path.join(baseDir, 'encoder.onnx'),
        decoderPath: path.join(baseDir, 'decoder.onnx'),
        lmHeadPath: path.join(baseDir, 'lm_head.onnx'),
      };

      resolvedPathCache.set(direction, resolved);
      return resolved;
    }
  }

  /**
   * Strips file:// prefix if present so native C++ ONNX Runtime can open the path directly.
   */
  public static normalizeLocalPath(uri: string): string {
    if (!uri) return uri;
    if (uri.startsWith('file://')) {
      return uri.replace(/^file:\/\//, '');
    }
    return uri;
  }
}
