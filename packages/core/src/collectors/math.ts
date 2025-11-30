/**
 * Math Fingerprint Collector
 * Hardware-dependent mathematical operations
 */

import type { MathFingerprint, CollectorResult } from './types';
import { hash, collectWithTiming } from './utils';

function getMathFingerprintInternal(): MathFingerprint {
  const M = Math;

  // Collect results from various math operations
  // These can vary slightly between different hardware/implementations
  const acos = M.acos(0.123456789123456789);
  const acosh = M.acosh(Math.PI);
  const asin = M.asin(0.123456789123456789);
  const asinh = M.asinh(Math.PI);
  const atan = M.atan(0.123456789123456789);
  const atanh = M.atanh(0.5);
  const atan2 = M.atan2(Math.PI, Math.E);
  const cbrt = M.cbrt(Math.PI);
  const cos = M.cos(21 * Math.LN2);
  const cosh = M.cosh(Math.PI);
  const exp = M.exp(Math.PI);
  const expm1 = M.expm1(Math.PI);
  const log = M.log(Math.PI);
  const log1p = M.log1p(Math.PI);
  const log10 = M.log10(Math.PI);
  const log2 = M.log2(Math.PI);
  const sin = M.sin(21 * Math.LN2);
  const sinh = M.sinh(Math.PI);
  const sqrt = M.sqrt(Math.PI);
  const tan = M.tan(21 * Math.LN2);
  const tanh = M.tanh(Math.PI);

  // Create hash from all values
  const values = [
    acos, acosh, asin, asinh, atan, atanh, atan2, cbrt, cos, cosh,
    exp, expm1, log, log1p, log10, log2, sin, sinh, sqrt, tan, tanh,
  ];

  const mathHash = hash(values.map((v) => v.toString()).join(','));

  return {
    acos,
    acosh,
    asin,
    asinh,
    atan,
    atanh,
    atan2,
    cbrt,
    cos,
    cosh,
    exp,
    expm1,
    log,
    log1p,
    log10,
    log2,
    sin,
    sinh,
    sqrt,
    tan,
    tanh,
    hash: mathHash,
  };
}

/**
 * Collect math fingerprint
 */
export async function collectMathFingerprint(): Promise<CollectorResult<MathFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getMathFingerprintInternal();
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

export default collectMathFingerprint;
