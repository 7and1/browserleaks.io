/**
 * WebGL Fingerprinting Detector
 */

export interface WebGLFingerprintResult {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  extensions: string[];
  parameters: Record<string, number | number[] | null>;
  isSupported: boolean;
  hash: string;
}

export class WebGLFingerprint {
  async detect(): Promise<WebGLFingerprintResult> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return this.getUnsupportedResult();
    }

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

      if (!gl) {
        return this.getUnsupportedResult();
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR);
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);

      const version = gl.getParameter(gl.VERSION);
      const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
      const extensions = gl.getSupportedExtensions() || [];

      const parameters: Record<string, number | number[] | null> = {
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
      };

      const fingerprint = `${vendor}|${renderer}|${version}|${extensions.join(',')}`;
      const hash = await this.hashData(fingerprint);

      return {
        vendor,
        renderer,
        version,
        shadingLanguageVersion,
        extensions,
        parameters,
        isSupported: true,
        hash,
      };
    } catch (error) {
      console.error('WebGL fingerprint error:', error);
      return this.getUnsupportedResult();
    }
  }

  private async hashData(data: string): Promise<string> {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    return 'fallback-hash';
  }

  private getUnsupportedResult(): WebGLFingerprintResult {
    return {
      vendor: 'unsupported',
      renderer: 'unsupported',
      version: 'unsupported',
      shadingLanguageVersion: 'unsupported',
      extensions: [],
      parameters: {},
      isSupported: false,
      hash: 'unsupported',
    };
  }
}
