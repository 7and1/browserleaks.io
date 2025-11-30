/**
 * Font Detection Fingerprinting
 */

export interface FontFingerprintResult {
  availableFonts: string[];
  fontCount: number;
  isSupported: boolean;
  hash: string;
}

// Common fonts to test
const FONTS_TO_TEST = [
  // Windows fonts
  'Arial', 'Arial Black', 'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas',
  'Courier New', 'Georgia', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
  'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 'Tahoma', 'Times New Roman',
  'Trebuchet MS', 'Verdana',

  // macOS fonts
  'American Typewriter', 'Andale Mono', 'Apple Chancery', 'Apple Color Emoji',
  'Avenir', 'Baskerville', 'Big Caslon', 'Brush Script MT', 'Copperplate',
  'Didot', 'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Helvetica Neue',
  'Herculanum', 'Hoefler Text', 'Lucida Grande', 'Luminari', 'Marker Felt',
  'Monaco', 'Optima', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET',
  'SignPainter', 'Skia', 'Snell Roundhand', 'Trattatello',

  // Linux fonts
  'DejaVu Sans', 'DejaVu Serif', 'FreeSans', 'FreeSerif', 'Liberation Sans',
  'Liberation Serif', 'Nimbus Sans L', 'Nimbus Roman No9 L', 'Ubuntu',

  // Asian fonts
  'Hiragino Sans', 'Hiragino Kaku Gothic Pro', 'Microsoft YaHei', 'SimSun',
  'MS Gothic', 'Yu Gothic',

  // Web safe fonts
  'Courier', 'Times', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
];

export class FontFingerprint {
  private baseFonts = ['monospace', 'sans-serif', 'serif'];
  private testString = 'mmmmmmmmmmlli';
  private testSize = '72px';
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  async detect(): Promise<FontFingerprintResult> {
    if (!this.canvas || !this.ctx) {
      return this.getUnsupportedResult();
    }

    try {
      const baseFontWidths = this.getBaseFontWidths();
      const availableFonts: string[] = [];

      for (const font of FONTS_TO_TEST) {
        if (this.isFontAvailable(font, baseFontWidths)) {
          availableFonts.push(font);
        }
      }

      const hash = await this.hashData(availableFonts.join(','));

      return {
        availableFonts,
        fontCount: availableFonts.length,
        isSupported: true,
        hash,
      };
    } catch (error) {
      console.error('Font fingerprint error:', error);
      return this.getUnsupportedResult();
    }
  }

  private getBaseFontWidths(): Map<string, number> {
    const widths = new Map<string, number>();
    for (const baseFont of this.baseFonts) {
      widths.set(baseFont, this.measureFont(`${this.testSize} ${baseFont}`));
    }
    return widths;
  }

  private measureFont(font: string): number {
    if (!this.ctx) return 0;
    this.ctx.font = font;
    return this.ctx.measureText(this.testString).width;
  }

  private isFontAvailable(font: string, baseFontWidths: Map<string, number>): boolean {
    for (const baseFont of this.baseFonts) {
      const baseWidth = baseFontWidths.get(baseFont) || 0;
      const testWidth = this.measureFont(`${this.testSize} "${font}", ${baseFont}`);

      if (testWidth !== baseWidth) {
        return true;
      }
    }
    return false;
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

  private getUnsupportedResult(): FontFingerprintResult {
    return {
      availableFonts: [],
      fontCount: 0,
      isSupported: false,
      hash: 'unsupported',
    };
  }

  cleanup() {
    this.canvas = null;
    this.ctx = null;
  }
}
