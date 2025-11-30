/**
 * WebGL Fingerprint Collector
 * Adapted from FingerprintJS
 */

import type { WebGLFingerprint, WebGLBasics, WebGLExtensions, CollectorResult } from './types';
import { hash, isGecko, isChromium, isWebKit, collectWithTiming } from './utils';

type CanvasContext = WebGLRenderingContext & { readonly canvas: HTMLCanvasElement };

const validContextParameters = new Set([
  10752, 2849, 2884, 2885, 2886, 2928, 2929, 2930, 2931, 2932, 2960, 2961, 2962, 2963, 2964, 2965,
  2966, 2967, 2968, 2978, 3024, 3042, 3088, 3089, 3106, 3107, 32773, 32777, 32823, 32824, 32936,
  32937, 32938, 32939, 32968, 32969, 32970, 32971, 3317, 33170, 3333, 3379, 3386, 33901, 33902,
  34016, 34024, 34076, 3408, 3410, 3411, 3412, 3413, 3414, 3415, 34467, 34816, 34817, 34818, 34819,
  34877, 34921, 34930, 35660, 35661, 35724, 35738, 35739, 36003, 36004, 36005, 36347, 36348, 36349,
  37440, 37441, 37443, 7936, 7937, 7938,
]);

const validExtensionParams = new Set([
  34047, 35723, 36063, 34852, 34853, 34854, 34229, 36392, 36795, 38449,
]);

const shaderTypes = ['FRAGMENT_SHADER', 'VERTEX_SHADER'] as const;
const precisionTypes = ['LOW_FLOAT', 'MEDIUM_FLOAT', 'HIGH_FLOAT', 'LOW_INT', 'MEDIUM_INT', 'HIGH_INT'] as const;
const rendererInfoExtensionName = 'WEBGL_debug_renderer_info';
const polygonModeExtensionName = 'WEBGL_polygon_mode';

function getWebGLContext(): CanvasContext | undefined {
  const canvas = document.createElement('canvas');
  let context: CanvasContext | undefined;

  canvas.addEventListener('webglCreateContextError', () => (context = undefined));

  for (const type of ['webgl', 'experimental-webgl']) {
    try {
      context = canvas.getContext(type) as CanvasContext;
    } catch {
      // Continue
    }
    if (context) break;
  }

  return context;
}

function shouldAvoidDebugRendererInfo(): boolean {
  return isGecko();
}

function shouldAvoidPolygonModeExtensions(): boolean {
  return isChromium() || isWebKit();
}

function isValidParameterGetter(gl: WebGLRenderingContext): boolean {
  return typeof gl.getParameter === 'function';
}

function getShaderPrecision(
  gl: WebGLRenderingContext,
  shaderType: typeof shaderTypes[number],
  precisionType: typeof precisionTypes[number]
): number[] {
  const shaderPrecision = gl.getShaderPrecisionFormat(
    gl[shaderType],
    gl[precisionType]
  );
  return shaderPrecision
    ? [shaderPrecision.rangeMin, shaderPrecision.rangeMax, shaderPrecision.precision]
    : [];
}

function getConstantsFromPrototype<K>(obj: K): Array<Extract<keyof K, string>> {
  const keys = Object.keys(Object.getPrototypeOf(obj) || {}) as Array<keyof K>;
  return keys.filter((key): key is Extract<typeof key, string> => {
    return typeof key === 'string' && !/[^A-Z0-9_x]/.test(key);
  });
}

function getWebGLBasics(gl: CanvasContext): WebGLBasics | null {
  if (!isValidParameterGetter(gl)) {
    return null;
  }

  const debugExtension = shouldAvoidDebugRendererInfo()
    ? null
    : gl.getExtension(rendererInfoExtensionName);

  return {
    version: gl.getParameter(gl.VERSION)?.toString() || '',
    vendor: gl.getParameter(gl.VENDOR)?.toString() || '',
    vendorUnmasked: debugExtension
      ? gl.getParameter(debugExtension.UNMASKED_VENDOR_WEBGL)?.toString()
      : '',
    renderer: gl.getParameter(gl.RENDERER)?.toString() || '',
    rendererUnmasked: debugExtension
      ? gl.getParameter(debugExtension.UNMASKED_RENDERER_WEBGL)?.toString()
      : '',
    shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)?.toString() || '',
  };
}

function getWebGLExtensionsData(gl: CanvasContext): WebGLExtensions | null {
  if (!isValidParameterGetter(gl)) {
    return null;
  }

  const extensions = gl.getSupportedExtensions();
  const contextAttributes = gl.getContextAttributes();
  const unsupportedExtensions: string[] = [];

  const attributes: string[] = [];
  const parameters: string[] = [];
  const extensionParameters: string[] = [];
  const shaderPrecisions: string[] = [];

  // Context attributes
  if (contextAttributes) {
    for (const attributeName of Object.keys(contextAttributes) as (keyof WebGLContextAttributes)[]) {
      attributes.push(`${attributeName}=${contextAttributes[attributeName]}`);
    }
  }

  // Context parameters
  const constants = getConstantsFromPrototype(gl);
  for (const constant of constants) {
    const code = gl[constant] as number;
    parameters.push(
      `${constant}=${code}${validContextParameters.has(code) ? `=${gl.getParameter(code)}` : ''}`
    );
  }

  // Extension parameters
  if (extensions) {
    for (const name of extensions) {
      if (
        (name === rendererInfoExtensionName && shouldAvoidDebugRendererInfo()) ||
        (name === polygonModeExtensionName && shouldAvoidPolygonModeExtensions())
      ) {
        continue;
      }

      const extension = gl.getExtension(name);
      if (!extension) {
        unsupportedExtensions.push(name);
        continue;
      }

      for (const constant of getConstantsFromPrototype(extension)) {
        const code = (extension as Record<string, number>)[constant];
        extensionParameters.push(
          `${constant}=${code}${validExtensionParams.has(code) ? `=${gl.getParameter(code)}` : ''}`
        );
      }
    }
  }

  // Shader precision
  for (const shaderType of shaderTypes) {
    for (const precisionType of precisionTypes) {
      const shaderPrecision = getShaderPrecision(gl, shaderType, precisionType);
      shaderPrecisions.push(`${shaderType}.${precisionType}=${shaderPrecision.join(',')}`);
    }
  }

  extensionParameters.sort();
  parameters.sort();

  return {
    contextAttributes: attributes,
    parameters,
    shaderPrecisions,
    extensions,
    extensionParameters,
    unsupportedExtensions,
  };
}

function getWebGLFingerprintInternal(): WebGLFingerprint {
  const gl = getWebGLContext();

  if (!gl) {
    return {
      basics: null,
      extensions: null,
      hash: 'unsupported',
    };
  }

  const basics = getWebGLBasics(gl);
  const extensions = getWebGLExtensionsData(gl);

  const fingerprintHash = hash(JSON.stringify({ basics, extensions }));

  return {
    basics,
    extensions,
    hash: fingerprintHash,
  };
}

/**
 * Collect WebGL fingerprint
 */
export async function collectWebGLFingerprint(): Promise<CollectorResult<WebGLFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getWebGLFingerprintInternal();
    });

    return {
      status: value.basics ? 'success' : 'unsupported',
      value,
      duration,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: 0,
    };
  }
}

/**
 * Get WebGL renderer info for display
 */
export function getWebGLRendererInfo(): { vendor: string; renderer: string } | null {
  const gl = getWebGLContext();
  if (!gl) return null;

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) {
    return {
      vendor: gl.getParameter(gl.VENDOR) || 'Unknown',
      renderer: gl.getParameter(gl.RENDERER) || 'Unknown',
    };
  }

  return {
    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gl.getParameter(gl.VENDOR) || 'Unknown',
    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gl.getParameter(gl.RENDERER) || 'Unknown',
  };
}

export default collectWebGLFingerprint;
