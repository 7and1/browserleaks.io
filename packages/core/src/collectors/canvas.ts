/**
 * Canvas Fingerprint Collector
 * Adapted from FingerprintJS
 * @see https://www.browserleaks.com/canvas
 */

import type { CanvasFingerprint, CollectorResult } from './types';
import { hash, isWebKit, isWebKit616OrNewer, isSafariWebKit, collectWithTiming } from './utils';

enum ImageStatus {
  Unsupported = 'unsupported',
  Skipped = 'skipped',
  Unstable = 'unstable',
}

function makeCanvasContext(): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return [canvas, canvas.getContext('2d')];
}

function isSupported(
  canvas: HTMLCanvasElement,
  context?: CanvasRenderingContext2D | null
): context is CanvasRenderingContext2D {
  return !!(context && canvas.toDataURL);
}

function doesSupportWinding(context: CanvasRenderingContext2D): boolean {
  context.rect(0, 0, 10, 10);
  context.rect(2, 2, 6, 6);
  return !context.isPointInPath(5, 5, 'evenodd');
}

function renderTextImage(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
  canvas.width = 240;
  canvas.height = 60;

  context.textBaseline = 'alphabetic';
  context.fillStyle = '#f60';
  context.fillRect(100, 1, 62, 20);

  context.fillStyle = '#069';
  context.font = '11pt "Times New Roman"';
  const printedText = `Cwm fjordbank gly ${String.fromCharCode(55357, 56835)}`;
  context.fillText(printedText, 2, 15);
  context.fillStyle = 'rgba(102, 204, 0, 0.2)';
  context.font = '18pt Arial';
  context.fillText(printedText, 4, 45);
}

function renderGeometryImage(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
  canvas.width = 122;
  canvas.height = 110;

  context.globalCompositeOperation = 'multiply';
  for (const [color, x, y] of [
    ['#f2f', 40, 40],
    ['#2ff', 80, 40],
    ['#ff2', 60, 80],
  ] as const) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, 40, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
  }

  context.fillStyle = '#f9c';
  context.arc(60, 60, 60, 0, Math.PI * 2, true);
  context.arc(60, 60, 20, 0, Math.PI * 2, true);
  context.fill('evenodd');
}

function canvasToString(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL();
}

function renderImages(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
): [geometry: string, text: string] {
  renderTextImage(canvas, context);
  const textImage1 = canvasToString(canvas);
  const textImage2 = canvasToString(canvas);

  if (textImage1 !== textImage2) {
    return [ImageStatus.Unstable, ImageStatus.Unstable];
  }

  renderGeometryImage(canvas, context);
  const geometryImage = canvasToString(canvas);
  return [geometryImage, textImage1];
}

function doesBrowserPerformAntifingerprinting(): boolean {
  return isWebKit() && isWebKit616OrNewer() && isSafariWebKit();
}

function getCanvasFingerprintInternal(skipImages?: boolean): CanvasFingerprint {
  let winding = false;
  let geometry: string;
  let text: string;

  const [canvas, context] = makeCanvasContext();
  if (!isSupported(canvas, context)) {
    geometry = text = ImageStatus.Unsupported;
  } else {
    winding = doesSupportWinding(context);

    if (skipImages) {
      geometry = text = ImageStatus.Skipped;
    } else {
      [geometry, text] = renderImages(canvas, context);
    }
  }

  const fingerprintHash = hash(`${winding}${geometry}${text}`);

  return { winding, geometry, text, hash: fingerprintHash };
}

/**
 * Collect canvas fingerprint
 */
export async function collectCanvasFingerprint(): Promise<CollectorResult<CanvasFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      const skipImages = doesBrowserPerformAntifingerprinting();
      return getCanvasFingerprintInternal(skipImages);
    });

    return {
      status: 'success',
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
 * Get raw canvas data for advanced analysis
 */
export function getCanvasImageData(): ImageData | null {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 50;
  const context = canvas.getContext('2d');

  if (!context) return null;

  // Draw test pattern
  context.textBaseline = 'top';
  context.font = "14px 'Arial'";
  context.fillStyle = '#f60';
  context.fillRect(125, 1, 62, 20);
  context.fillStyle = '#069';
  context.fillText('BrowserLeaks.io', 2, 15);
  context.fillStyle = 'rgba(102, 204, 0, 0.7)';
  context.fillText('BrowserLeaks.io', 4, 17);

  return context.getImageData(0, 0, canvas.width, canvas.height);
}

export default collectCanvasFingerprint;
