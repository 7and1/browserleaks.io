/**
 * Audio Fingerprinting Detector
 */

export interface AudioFingerprintResult {
  hash: string;
  sampleRate: number;
  channelCount: number;
  isSupported: boolean;
  dynamicsCompressorFingerprint: string;
  audioContext: {
    baseLatency?: number;
    outputLatency?: number;
    state: string;
  };
}

export class AudioFingerprint {
  async detect(): Promise<AudioFingerprintResult> {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
      return this.getUnsupportedResult();
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        return this.getUnsupportedResult();
      }

      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
      const compressor = context.createDynamicsCompressor();

      gainNode.gain.setValueAtTime(0, context.currentTime);
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, context.currentTime);

      oscillator.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(0);

      const fingerprint = await new Promise<string>((resolve) => {
        scriptProcessor.onaudioprocess = (event) => {
          const output = event.outputBuffer.getChannelData(0);
          const hash = Array.from(output.slice(0, 30))
            .map((val) => Math.abs(val))
            .reduce((acc, val) => acc + val, 0)
            .toString();

          oscillator.stop();
          scriptProcessor.disconnect();
          oscillator.disconnect();
          compressor.disconnect();
          analyser.disconnect();
          gainNode.disconnect();
          context.close();

          resolve(hash);
        };
      });

      const compressorFingerprint = [
        compressor.threshold.value,
        compressor.knee.value,
        compressor.ratio.value,
        compressor.attack.value,
        compressor.release.value,
      ].join('|');

      const hash = await this.hashData(fingerprint + compressorFingerprint);

      // Get AudioContext properties before closing
      const contextInfo = {
        baseLatency: (context as unknown as { baseLatency?: number }).baseLatency,
        outputLatency: (context as unknown as { outputLatency?: number }).outputLatency,
        state: context.state,
      };

      return {
        hash,
        sampleRate: context.sampleRate,
        channelCount: context.destination.maxChannelCount,
        isSupported: true,
        dynamicsCompressorFingerprint: compressorFingerprint,
        audioContext: contextInfo,
      };
    } catch (error) {
      console.error('Audio fingerprint error:', error);
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
    return 'fallback-hash';
  }

  private getUnsupportedResult(): AudioFingerprintResult {
    return {
      hash: 'unsupported',
      sampleRate: 0,
      channelCount: 0,
      isSupported: false,
      dynamicsCompressorFingerprint: 'unsupported',
      audioContext: {
        state: 'unsupported',
      },
    };
  }
}
