/**
 * Utility functions for fingerprint collection
 * Adapted from FingerprintJS/creepjs
 */

// Count truthy values in an array
export function countTruthy(values: unknown[]): number {
  return values.filter(Boolean).length;
}

// Check if a function is native (not overridden)
export function isFunctionNative(fn: unknown): boolean {
  if (typeof fn !== 'function') return false;
  return /\[native code\]/.test(fn.toString());
}

// Simple hash function (MurmurHash3 inspired)
export function hash(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

// Hash an object
export function hashObject(obj: unknown): string {
  return hash(JSON.stringify(obj));
}

// Wrap async operation with timeout
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback?: T): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (fallback !== undefined) {
        resolve(fallback);
      } else {
        reject(new Error('Timeout'));
      }
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// Run code in an isolated iframe
export async function withIframe<T>(
  callback: (iframe: HTMLIFrameElement, contentWindow: Window) => T | Promise<T>,
  timeout = 5000
): Promise<T> {
  const iframe = document.createElement('iframe');

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      iframe.remove();
      reject(new Error('Iframe timeout'));
    }, timeout);

    iframe.style.cssText = 'position:absolute;left:-9999px;visibility:hidden;width:0;height:0';

    iframe.onload = async () => {
      try {
        const contentWindow = iframe.contentWindow;
        if (!contentWindow) {
          throw new Error('No content window');
        }
        const result = await callback(iframe, contentWindow);
        clearTimeout(timer);
        resolve(result);
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      } finally {
        iframe.remove();
      }
    };

    document.body.appendChild(iframe);
  });
}

// Browser detection utilities
export function isChromium(): boolean {
  const w = window;
  const n = navigator;

  return (
    countTruthy([
      'webkitPersistentStorage' in n,
      'webkitTemporaryStorage' in n,
      (n.vendor || '').indexOf('Google') === 0,
      'webkitResolveLocalFileSystemURL' in w,
      'BatteryManager' in w,
      'webkitMediaStream' in w,
      'webkitSpeechGrammar' in w,
    ]) >= 5
  );
}

export function isGecko(): boolean {
  const w = window;

  return (
    countTruthy([
      'buildID' in navigator,
      'MozAppearance' in (document.documentElement?.style ?? {}),
      'onmozfullscreenchange' in w,
      'mozInnerScreenX' in w,
      'CSSMozDocumentRule' in w,
      'CanvasCaptureMediaStream' in w,
    ]) >= 4
  );
}

export function isWebKit(): boolean {
  const w = window;
  const n = navigator;

  return (
    countTruthy([
      'ApplePayError' in w,
      'CSSPrimitiveValue' in w,
      'Counter' in w,
      n.vendor.indexOf('Apple') === 0,
      'RGBColor' in w,
      'WebKitMediaKeys' in w,
    ]) >= 4
  );
}

export function isTrident(): boolean {
  const w = window;
  const n = navigator;

  return (
    countTruthy([
      'MSCSSMatrix' in w,
      'msSetImmediate' in w,
      'msIndexedDB' in w,
      'msMaxTouchPoints' in n,
      'msPointerEnabled' in n,
    ]) >= 4
  );
}

export function isEdgeHTML(): boolean {
  const w = window;
  const n = navigator;

  return (
    countTruthy(['msWriteProfilerMark' in w, 'MSStream' in w, 'msLaunchUri' in n, 'msSaveBlob' in n]) >= 3 &&
    !isTrident()
  );
}

export function isSafariWebKit(): boolean {
  const w = window;

  return (
    isFunctionNative(w.print) &&
    String((w as unknown as Record<string, unknown>).browser) === '[object WebPageNamespace]'
  );
}

export function isDesktopWebKit(): boolean {
  const w = window;
  const { HTMLElement, Document } = w;

  return (
    countTruthy([
      'safari' in w,
      !('ongestureend' in w),
      !('TouchEvent' in w),
      !('orientation' in w),
      HTMLElement && !('autocapitalize' in HTMLElement.prototype),
      Document && 'pointerLockElement' in Document.prototype,
    ]) >= 4
  );
}

export function isWebKit616OrNewer(): boolean {
  const w = window;
  const n = navigator;
  const { CSS, HTMLButtonElement } = w;

  return (
    countTruthy([
      !('getStorageUpdates' in n),
      HTMLButtonElement && 'popover' in HTMLButtonElement.prototype,
      'CSSCounterStyleRule' in w,
      CSS?.supports?.('font-size-adjust: ex-height 0.5'),
      CSS?.supports?.('text-transform: full-width'),
    ]) >= 4
  );
}

export function isAndroid(): boolean {
  const isItChromium = isChromium();
  const isItGecko = isGecko();
  const w = window;
  const n = navigator;
  const c = 'connection';

  if (isItChromium) {
    return (
      countTruthy([
        !('SharedWorker' in w),
        (n as Record<string, unknown>)[c] && 'ontypechange' in ((n as Record<string, unknown>)[c] as object),
        !('sinkId' in new Audio()),
      ]) >= 2
    );
  } else if (isItGecko) {
    return countTruthy(['onorientationchange' in w, 'orientation' in w, /android/i.test(n.appVersion)]) >= 2;
  }
  return false;
}

// Collect timing for a collector function
export async function collectWithTiming<T>(
  collector: () => T | Promise<T>
): Promise<{ value: T; duration: number }> {
  const start = performance.now();
  const value = await collector();
  const duration = Math.round(performance.now() - start);
  return { value, duration };
}
