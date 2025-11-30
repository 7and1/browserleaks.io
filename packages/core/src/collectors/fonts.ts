/**
 * Font Detection Collector
 * Adapted from FingerprintJS
 */

import type { FontFingerprint, CollectorResult } from './types';
import { hash, withIframe, collectWithTiming } from './utils';

const testString = 'mmMwWLliI0O&1';
const textSize = '48px';
const baseFonts = ['monospace', 'sans-serif', 'serif'] as const;

// Extended font list (200+ fonts for comprehensive detection)
const fontList = [
  // System fonts
  'sans-serif-thin',
  'ARNO PRO',
  'Agency FB',
  'Arabic Typesetting',
  'Arial Unicode MS',
  'AvantGarde Bk BT',
  'BankGothic Md BT',
  'Batang',
  'Bitstream Vera Sans Mono',
  'Calibri',
  'Century',
  'Century Gothic',
  'Clarendon',
  'EUROSTILE',
  'Franklin Gothic',
  'Futura Bk BT',
  'Futura Md BT',
  'GOTHAM',
  'Gill Sans',
  'HELV',
  'Haettenschweiler',
  'Helvetica Neue',
  'Humanst521 BT',
  'Leelawadee',
  'Letter Gothic',
  'Levenim MT',
  'Lucida Bright',
  'Lucida Sans',
  'Menlo',
  'MS Mincho',
  'MS Outlook',
  'MS Reference Specialty',
  'MS UI Gothic',
  'MT Extra',
  'MYRIAD PRO',
  'Marlett',
  'Meiryo UI',
  'Microsoft Uighur',
  'Minion Pro',
  'Monotype Corsiva',
  'PMingLiU',
  'Pristina',
  'SCRIPTINA',
  'Segoe UI Light',
  'Serifa',
  'SimHei',
  'Small Fonts',
  'Staccato222 BT',
  'TRAJAN PRO',
  'Univers CE 55 Medium',
  'Vrinda',
  'ZWAdobeF',
  // Additional common fonts
  'Arial',
  'Arial Black',
  'Comic Sans MS',
  'Courier New',
  'Georgia',
  'Impact',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Microsoft Sans Serif',
  'Palatino Linotype',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Webdings',
  'Wingdings',
  // macOS fonts
  'Apple Chancery',
  'Apple Color Emoji',
  'Apple SD Gothic Neo',
  'Avenir',
  'Avenir Next',
  'Baskerville',
  'Big Caslon',
  'Brush Script MT',
  'Chalkboard',
  'Chalkboard SE',
  'Charter',
  'Cochin',
  'Copperplate',
  'Corsiva Hebrew',
  'Damascus',
  'Didot',
  'Euphemia UCAS',
  'Futura',
  'Geneva',
  'Heiti SC',
  'Heiti TC',
  'Helvetica',
  'Herculanum',
  'Hoefler Text',
  'Iowan Old Style',
  'Kefa',
  'Lucida Grande',
  'Luminari',
  'Marker Felt',
  'Monaco',
  'Noteworthy',
  'Optima',
  'Osaka',
  'Papyrus',
  'Phosphate',
  'PT Mono',
  'PT Sans',
  'PT Serif',
  'Savoye LET',
  'SignPainter',
  'Skia',
  'Snell Roundhand',
  'STIXGeneral',
  'Superclarendon',
  'Symbol',
  'Thonburi',
  'Trattatello',
  'Zapfino',
  // Windows fonts
  'Cambria',
  'Candara',
  'Consolas',
  'Constantia',
  'Corbel',
  'Ebrima',
  'Franklin Gothic Medium',
  'Gabriola',
  'Gadugi',
  'Javanese Text',
  'Leelawadee UI',
  'Lucida Fax',
  'Malgun Gothic',
  'Meiryo',
  'Microsoft Himalaya',
  'Microsoft JhengHei',
  'Microsoft New Tai Lue',
  'Microsoft PhagsPa',
  'Microsoft Tai Le',
  'Microsoft YaHei',
  'Microsoft Yi Baiti',
  'Mongolian Baiti',
  'MV Boli',
  'Myanmar Text',
  'Nirmala UI',
  'Nyala',
  'Plantagenet Cherokee',
  'Segoe Print',
  'Segoe Script',
  'Segoe UI',
  'Segoe UI Symbol',
  'SimSun',
  'Sitka Text',
  'Sylfaen',
  'Yu Gothic',
  'Yu Mincho',
  // Linux fonts
  'Cantarell',
  'DejaVu Sans',
  'DejaVu Sans Mono',
  'DejaVu Serif',
  'Droid Sans',
  'Droid Sans Mono',
  'Droid Serif',
  'FreeMono',
  'FreeSans',
  'FreeSerif',
  'Liberation Mono',
  'Liberation Sans',
  'Liberation Serif',
  'Nimbus Mono L',
  'Nimbus Roman No9 L',
  'Nimbus Sans L',
  'Noto Mono',
  'Noto Sans',
  'Noto Serif',
  'Open Sans',
  'Roboto',
  'Ubuntu',
  'Ubuntu Mono',
] as const;

async function detectFontsInIframe(): Promise<string[]> {
  return withIframe(async (_iframe, contentWindow) => {
    const { document: doc } = contentWindow;
    const holder = doc.body;
    holder.style.fontSize = textSize;

    const spansContainer = doc.createElement('div');
    spansContainer.style.setProperty('visibility', 'hidden', 'important');

    const defaultWidth: Partial<Record<string, number>> = {};
    const defaultHeight: Partial<Record<string, number>> = {};

    const createSpan = (fontFamily: string): HTMLSpanElement => {
      const span = doc.createElement('span');
      const { style } = span;
      style.position = 'absolute';
      style.top = '0';
      style.left = '0';
      style.fontFamily = fontFamily;
      span.textContent = testString;
      spansContainer.appendChild(span);
      return span;
    };

    const createSpanWithFonts = (fontToDetect: string, baseFont: string): HTMLSpanElement => {
      return createSpan(`'${fontToDetect}',${baseFont}`);
    };

    const initializeBaseFontsSpans = (): HTMLSpanElement[] => {
      return baseFonts.map((font) => createSpan(font));
    };

    const initializeFontsSpans = (): Record<string, HTMLSpanElement[]> => {
      const spans: Record<string, HTMLSpanElement[]> = {};
      for (const font of fontList) {
        spans[font] = baseFonts.map((baseFont) => createSpanWithFonts(font, baseFont));
      }
      return spans;
    };

    const isFontAvailable = (fontSpans: HTMLElement[]): boolean => {
      return baseFonts.some(
        (baseFont, baseFontIndex) =>
          fontSpans[baseFontIndex].offsetWidth !== defaultWidth[baseFont] ||
          fontSpans[baseFontIndex].offsetHeight !== defaultHeight[baseFont]
      );
    };

    const baseFontsSpans = initializeBaseFontsSpans();
    const fontsSpans = initializeFontsSpans();

    holder.appendChild(spansContainer);

    // Get default dimensions
    for (let index = 0; index < baseFonts.length; index++) {
      defaultWidth[baseFonts[index]] = baseFontsSpans[index].offsetWidth;
      defaultHeight[baseFonts[index]] = baseFontsSpans[index].offsetHeight;
    }

    // Check available fonts
    return fontList.filter((font) => isFontAvailable(fontsSpans[font]));
  });
}

// Fallback method without iframe
function detectFontsFallback(): string[] {
  const detectedFonts: string[] = [];
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) return detectedFonts;

  const getTextWidth = (font: string): number => {
    context.font = `${textSize} ${font}`;
    return context.measureText(testString).width;
  };

  const baseWidths: Record<string, number> = {};
  for (const baseFont of baseFonts) {
    baseWidths[baseFont] = getTextWidth(baseFont);
  }

  for (const font of fontList) {
    for (const baseFont of baseFonts) {
      const width = getTextWidth(`'${font}', ${baseFont}`);
      if (width !== baseWidths[baseFont]) {
        detectedFonts.push(font);
        break;
      }
    }
  }

  return detectedFonts;
}

async function getFontFingerprintInternal(): Promise<FontFingerprint> {
  let fonts: string[];

  try {
    fonts = await detectFontsInIframe();
  } catch {
    fonts = detectFontsFallback();
  }

  return {
    fonts,
    count: fonts.length,
    hash: hash(fonts.join(',')),
  };
}

/**
 * Collect font fingerprint
 */
export async function collectFontFingerprint(): Promise<CollectorResult<FontFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(async () => {
      return getFontFingerprintInternal();
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
 * Get the list of fonts being tested
 */
export function getTestedFonts(): readonly string[] {
  return fontList;
}

export default collectFontFingerprint;
