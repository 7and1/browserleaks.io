/**
 * Navigator Fingerprint Collector
 */

import type { NavigatorFingerprint, PluginsFingerprint, PluginInfo, CollectorResult } from './types';
import { collectWithTiming } from './utils';

function getNavigatorFingerprintInternal(): NavigatorFingerprint {
  const nav = navigator;

  return {
    userAgent: nav.userAgent || '',
    language: nav.language || '',
    languages: Array.from(nav.languages || []),
    platform: nav.platform || '',
    vendor: nav.vendor || '',
    cookieEnabled: nav.cookieEnabled ?? false,
    doNotTrack: nav.doNotTrack || null,
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: (nav as Navigator & { deviceMemory?: number }).deviceMemory,
    maxTouchPoints: nav.maxTouchPoints || 0,
    pdfViewerEnabled: (nav as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled ?? false,
  };
}

function getPluginsFingerprintInternal(): PluginsFingerprint {
  const plugins: PluginInfo[] = [];

  if (navigator.plugins) {
    for (let i = 0; i < navigator.plugins.length; i++) {
      const plugin = navigator.plugins[i];
      const mimeTypes: string[] = [];

      for (let j = 0; j < plugin.length; j++) {
        const mimeType = plugin[j];
        if (mimeType) {
          mimeTypes.push(mimeType.type);
        }
      }

      plugins.push({
        name: plugin.name || '',
        description: plugin.description || '',
        filename: plugin.filename || '',
        mimeTypes,
      });
    }
  }

  return {
    plugins,
    count: plugins.length,
  };
}

/**
 * Collect navigator fingerprint
 */
export async function collectNavigatorFingerprint(): Promise<CollectorResult<NavigatorFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getNavigatorFingerprintInternal();
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
 * Collect plugins fingerprint
 */
export async function collectPluginsFingerprint(): Promise<CollectorResult<PluginsFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getPluginsFingerprintInternal();
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

export default collectNavigatorFingerprint;
