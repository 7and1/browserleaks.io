/**
 * Canvas Fingerprinting Detector
 * Based on techniques from CreepJS and BrowserLeaks.com
 */

export interface CanvasFingerprintResult {
  hash: string;
  dataURL: string;
  width: number;
  height: number;
  isSupported: boolean;
  features: {
    textRendering: string;
    emojiRendering: string;
    gradientRendering: string;
  };
}

export class CanvasFingerprint {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 200;
      this.canvas.height = 50;
      this.ctx = this.canvas.getContext('2d');
    }
  }

  async detect(): Promise<CanvasFingerprintResult> {
    if (!this.canvas || !this.ctx) {
      return this.getUnsupportedResult();
    }

    try {
      // Text rendering test
      this.ctx.textBaseline = 'top';
      this.ctx.font = '14px "Arial"';
      this.ctx.textBaseline = 'alphabetic';
      this.ctx.fillStyle = '#f60';
      this.ctx.fillRect(125, 1, 62, 20);
      this.ctx.fillStyle = '#069';
      this.ctx.fillText('BrowserLeaks.io 🔒', 2, 15);
      this.ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      this.ctx.fillText('Canvas Fingerprint', 4, 17);

      // Emoji rendering test
      this.ctx.fillStyle = '#f00';
      this.ctx.fillText('😀🌍🔐', 2, 35);

      // Gradient rendering test
      const gradient = this.ctx.createLinearGradient(0, 0, 200, 0);
      gradient.addColorStop(0, 'red');
      gradient.addColorStop(0.5, 'green');
      gradient.addColorStop(1, 'blue');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 40, 200, 10);

      const dataURL = this.canvas.toDataURL();
      const hash = await this.hashData(dataURL);

      const textRendering = this.ctx.measureText('BrowserLeaks.io').width.toString();
      const emojiRendering = this.ctx.measureText('😀').width.toString();

      return {
        hash,
        dataURL,
        width: this.canvas.width,
        height: this.canvas.height,
        isSupported: true,
        features: {
          textRendering,
          emojiRendering,
          gradientRendering: 'supported',
        },
      };
    } catch (error) {
      console.error('Canvas fingerprint error:', error);
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

    // Fallback simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private getUnsupportedResult(): CanvasFingerprintResult {
    return {
      hash: 'unsupported',
      dataURL: '',
      width: 0,
      height: 0,
      isSupported: false,
      features: {
        textRendering: 'unsupported',
        emojiRendering: 'unsupported',
        gradientRendering: 'unsupported',
      },
    };
  }

  cleanup() {
    this.canvas = null;
    this.ctx = null;
  }
}
