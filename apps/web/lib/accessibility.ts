import { useEffect, useCallback, useRef } from 'react';

/**
 * Skip to main content link hook
 */
export function useSkipToMain() {
  const handleSkip = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const main = document.querySelector('main');
    if (main) {
      main.tabIndex = -1;
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return handleSkip;
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element on open
    firstElement?.focus();

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return containerRef;
}

/**
 * Announce to screen readers
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return announce;
}

/**
 * Reduced motion preference hook
 */
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High contrast preference hook
 */
export function useHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Color contrast utilities
 */
export const colorContrast = {
  // WCAG AA minimum contrast ratios
  minRatioNormalText: 4.5,
  minRatioLargeText: 3,
  minRatioUIComponents: 3,

  // Calculate relative luminance
  getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio(l1: number, l2: number): number {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if contrast passes WCAG AA
  passesAA(foreground: string, background: string, isLargeText = false): boolean {
    const fg = this.hexToRgb(foreground);
    const bg = this.hexToRgb(background);
    if (!fg || !bg) return false;

    const l1 = this.getLuminance(fg.r, fg.g, fg.b);
    const l2 = this.getLuminance(bg.r, bg.g, bg.b);
    const ratio = this.getContrastRatio(l1, l2);

    return ratio >= (isLargeText ? this.minRatioLargeText : this.minRatioNormalText);
  },

  // Hex to RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNav = {
  // Common key codes
  keys: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
  },

  // Check if key is activating key
  isActivationKey(key: string): boolean {
    return key === this.keys.ENTER || key === this.keys.SPACE;
  },

  // Check if key is navigation key
  isNavigationKey(key: string): boolean {
    return [
      this.keys.ARROW_UP,
      this.keys.ARROW_DOWN,
      this.keys.ARROW_LEFT,
      this.keys.ARROW_RIGHT,
    ].includes(key);
  },
};

/**
 * ARIA live region component props
 */
export interface LiveRegionProps {
  message: string;
  role?: 'status' | 'alert' | 'log';
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
}

/**
 * Screen reader only text
 */
export const srOnlyStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: 0,
};

/**
 * Focus visible styles
 */
export const focusVisibleStyles = {
  outline: '2px solid #3b82f6',
  outlineOffset: '2px',
};

/**
 * Generate aria-describedby ID
 */
export function generateDescribedById(prefix: string): string {
  return `${prefix}-description-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Accessibility landmarks
 */
export const landmarks = {
  banner: 'banner',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  search: 'search',
  form: 'form',
  region: 'region',
};
