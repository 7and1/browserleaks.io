import { EventEmitter } from 'node:events';
import crypto from 'node:crypto';
import type { LeakLogEntry, LeakReportSnapshot, RiskLevel } from '@browserleaks/types';
import { LeakLogRepository } from '../db/LeakLogRepository';
import type { Request, Response } from 'express';

export interface TelemetryEvent {
  id: string;
  type: string;
  source: string;
  severity: RiskLevel;
  summary: string;
  timestamp: number;
  payload?: Record<string, unknown>;
}

interface CaptureOptions {
  type: string;
  source: string;
  severity: RiskLevel;
  summary: string;
  payload?: Record<string, unknown>;
  snapshot: Omit<LeakLogEntry, 'id' | 'createdAt'>;
}

export class TelemetryService {
  private emitter = new EventEmitter();
  private repository = new LeakLogRepository();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  async capture(options: CaptureOptions) {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    const event: TelemetryEvent = {
      id,
      type: options.type,
      source: options.source,
      severity: options.severity,
      summary: options.summary,
      timestamp,
      payload: options.payload,
    };

    const snapshot: LeakLogEntry = {
      id,
      createdAt: timestamp,
      privacyScore: options.snapshot.privacyScore,
      entropyScore: options.snapshot.entropyScore,
      leaks: options.snapshot.leaks,
      apiSurface: options.snapshot.apiSurface,
      report: options.snapshot.report,
    };

    await this.repository.save(snapshot);
    this.emitter.emit('telemetry', event);
    return event;
  }

  async seed(res: Response) {
    const recent = await this.repository.getRecent(15);
    recent.forEach((entry) => {
      res.write(`event: seed\ndata: ${JSON.stringify(entry)}\n\n`);
    });
  }

  stream(req: Request, res: Response) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    });

    const heartbeat = setInterval(() => {
      res.write('event: heartbeat\ndata: {}\n\n');
    }, 15000);

    const listener = (event: TelemetryEvent) => {
      res.write(`event: telemetry\ndata: ${JSON.stringify(event)}\n\n`);
    };

    this.emitter.on('telemetry', listener);

    req.on('close', () => {
      clearInterval(heartbeat);
      this.emitter.off('telemetry', listener);
    });
  }

  buildReportSnapshot(partial: Partial<LeakReportSnapshot>): LeakReportSnapshot {
    return {
      meta: partial.meta || { scanId: crypto.randomUUID(), time: Date.now() },
      privacyIndex: partial.privacyIndex || {
        score: 0,
        exposureLevel: 'low',
        leakedBits: 0,
      },
      hardwareLeaks: partial.hardwareLeaks || {},
      networkLeaks: partial.networkLeaks || {},
      apiSurface: partial.apiSurface || {},
    };
  }
}

export const telemetryService = new TelemetryService();
