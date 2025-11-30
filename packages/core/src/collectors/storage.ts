/**
 * Storage Support Collector
 */

import type { StorageFingerprint, CollectorResult } from './types';
import { collectWithTiming } from './utils';

function testLocalStorage(): boolean {
  try {
    const key = '__bl_test__';
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function testSessionStorage(): boolean {
  try {
    const key = '__bl_test__';
    sessionStorage.setItem(key, key);
    sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function testIndexedDB(): boolean {
  try {
    return !!window.indexedDB;
  } catch {
    return false;
  }
}

function testOpenDatabase(): boolean {
  try {
    return !!(window as Window & { openDatabase?: unknown }).openDatabase;
  } catch {
    return false;
  }
}

function testCookies(): boolean {
  try {
    // Try to set a cookie
    document.cookie = '__bl_test__=1; SameSite=Strict';
    const hasCookie = document.cookie.indexOf('__bl_test__=') !== -1;
    // Clean up
    document.cookie = '__bl_test__=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    return hasCookie;
  } catch {
    return navigator.cookieEnabled;
  }
}

function getStorageFingerprintInternal(): StorageFingerprint {
  return {
    localStorage: testLocalStorage(),
    sessionStorage: testSessionStorage(),
    indexedDB: testIndexedDB(),
    openDatabase: testOpenDatabase(),
    cookiesEnabled: testCookies(),
  };
}

/**
 * Collect storage fingerprint
 */
export async function collectStorageFingerprint(): Promise<CollectorResult<StorageFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getStorageFingerprintInternal();
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
 * Get storage quota info (if available)
 */
export async function getStorageQuota(): Promise<{
  usage: number;
  quota: number;
  usagePercentage: number;
} | null> {
  try {
    if (!navigator.storage?.estimate) return null;

    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;

    return {
      usage,
      quota,
      usagePercentage: quota > 0 ? (usage / quota) * 100 : 0,
    };
  } catch {
    return null;
  }
}

export default collectStorageFingerprint;
