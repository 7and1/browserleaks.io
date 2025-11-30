/**
 * Client Rects Fingerprinting Detector
 * DOM element measurements vary across browsers and systems
 */

export interface ClientRectsFingerprintResult {
  hash: string;
  isSupported: boolean;
  measurements: {
    elementType: string;
    width: number;
    height: number;
    top: number;
    left: number;
    x: number;
    y: number;
  }[];
  uniquenessScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class ClientRectsFingerprint {
  private container: HTMLDivElement | null = null;

  async detect(): Promise<ClientRectsFingerprintResult> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return this.getUnsupportedResult();
    }

    try {
      // Create test container
      this.container = document.createElement('div');
      this.container.style.cssText = 'position:absolute;top:-9999px;left:-9999px;visibility:hidden;';
      document.body.appendChild(this.container);

      const measurements = await this.collectMeasurements();
      const fingerprint = JSON.stringify(measurements);
      const hash = await this.hashData(fingerprint);

      // Calculate uniqueness based on variation in measurements
      const uniquenessScore = this.calculateUniqueness(measurements);
      const riskLevel = uniquenessScore > 70 ? 'high' : uniquenessScore > 40 ? 'medium' : 'low';

      this.cleanup();

      return {
        hash,
        isSupported: true,
        measurements,
        uniquenessScore,
        riskLevel,
      };
    } catch (error) {
      console.error('Client rects fingerprint error:', error);
      this.cleanup();
      return this.getUnsupportedResult();
    }
  }

  private async collectMeasurements(): Promise<ClientRectsFingerprintResult['measurements']> {
    if (!this.container) return [];

    const measurements: ClientRectsFingerprintResult['measurements'] = [];

    // Test different element types with specific content
    const testCases = [
      { tag: 'div', content: 'BrowserLeaks.io', style: 'font-family:Arial;font-size:16px;' },
      { tag: 'span', content: 'Testing123', style: 'font-family:Times New Roman;font-size:14px;' },
      { tag: 'p', content: 'Fingerprint test paragraph', style: 'font-family:Georgia;font-size:12px;' },
      { tag: 'h1', content: 'Heading Test', style: 'font-family:Helvetica;' },
      { tag: 'textarea', content: '', style: 'width:100px;height:50px;', attrs: { rows: '3', cols: '20' } },
      { tag: 'input', content: '', style: 'width:150px;', attrs: { type: 'text', value: 'Test input' } },
      { tag: 'button', content: 'Click Me', style: 'padding:10px 20px;' },
      { tag: 'select', content: '', style: '', children: ['Option 1', 'Option 2', 'Option 3'] },
      { tag: 'div', content: 'Box model test', style: 'padding:10px;margin:5px;border:2px solid black;' },
      { tag: 'span', content: '\u4e2d\u6587', style: 'font-family:sans-serif;font-size:16px;' }, // Chinese characters
      { tag: 'span', content: '\ud83d\ude00\ud83c\udf0d\ud83d\udd10', style: 'font-size:20px;' }, // Emojis
    ];

    for (const testCase of testCases) {
      const element = document.createElement(testCase.tag);
      element.style.cssText = testCase.style;

      if (testCase.content) {
        element.textContent = testCase.content;
      }

      if (testCase.attrs) {
        Object.entries(testCase.attrs).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }

      if (testCase.children) {
        testCase.children.forEach(optText => {
          const option = document.createElement('option');
          option.textContent = optText;
          element.appendChild(option);
        });
      }

      this.container!.appendChild(element);
      const rect = element.getBoundingClientRect();

      measurements.push({
        elementType: testCase.tag,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        x: rect.x,
        y: rect.y,
      });
    }

    // Also collect getClientRects for inline elements
    const inlineSpan = document.createElement('span');
    inlineSpan.innerHTML = 'This is a<br>multi-line<br>inline element';
    this.container.appendChild(inlineSpan);

    const rects = inlineSpan.getClientRects();
    for (let i = 0; i < Math.min(rects.length, 3); i++) {
      const rect = rects[i];
      measurements.push({
        elementType: `inline-rect-${i}`,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        x: rect.x,
        y: rect.y,
      });
    }

    return measurements;
  }

  private calculateUniqueness(measurements: ClientRectsFingerprintResult['measurements']): number {
    // Calculate variance in measurements
    const widths = measurements.map(m => m.width).filter(w => w > 0);
    const heights = measurements.map(m => m.height).filter(h => h > 0);

    if (widths.length === 0 || heights.length === 0) return 0;

    const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
    const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;

    const widthVariance = widths.reduce((acc, w) => acc + Math.pow(w - avgWidth, 2), 0) / widths.length;
    const heightVariance = heights.reduce((acc, h) => acc + Math.pow(h - avgHeight, 2), 0) / heights.length;

    // Higher variance = more unique fingerprint
    const combinedVariance = Math.sqrt(widthVariance) + Math.sqrt(heightVariance);

    // Normalize to 0-100 scale
    return Math.min(100, combinedVariance * 2);
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

  private getUnsupportedResult(): ClientRectsFingerprintResult {
    return {
      hash: 'unsupported',
      isSupported: false,
      measurements: [],
      uniquenessScore: 0,
      riskLevel: 'low',
    };
  }

  cleanup() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}
