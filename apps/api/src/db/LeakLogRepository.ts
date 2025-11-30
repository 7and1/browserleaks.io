import fs from 'node:fs/promises';
import path from 'node:path';
import type { LeakLogEntry } from '@browserleaks/types';
import { config } from '../config';

const DEFAULT_D1_ENDPOINT = 'https://api.cloudflare.com';

export class LeakLogRepository {
  private filePath = path.resolve(process.cwd(), 'data/leak-logs.json');

  async save(entry: LeakLogEntry) {
    if (this.hasCloudflareConfig()) {
      await this.persistToD1(entry);
      return;
    }

    await this.persistToFile(entry);
  }

  async getRecent(limit = 20): Promise<LeakLogEntry[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed: LeakLogEntry[] = JSON.parse(raw);
      return parsed.slice(0, limit);
    } catch (error) {
      return [];
    }
  }

  private hasCloudflareConfig() {
    return Boolean(
      config.CLOUDFLARE_ACCOUNT_ID &&
        config.CLOUDFLARE_D1_DATABASE_ID &&
        config.CLOUDFLARE_API_TOKEN
    );
  }

  private async persistToFile(entry: LeakLogEntry) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    let existing: LeakLogEntry[] = [];
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      existing = JSON.parse(raw);
    } catch (error) {
      existing = [];
    }

    existing.unshift(entry);
    if (existing.length > 200) {
      existing = existing.slice(0, 200);
    }

    await fs.writeFile(this.filePath, JSON.stringify(existing, null, 2), 'utf-8');
  }

  private async persistToD1(entry: LeakLogEntry) {
    const endpoint = `${config.CF_D1_ENDPOINT || DEFAULT_D1_ENDPOINT}/client/v4/accounts/${config.CLOUDFLARE_ACCOUNT_ID}/d1/database/${config.CLOUDFLARE_D1_DATABASE_ID}/raw`;

    const payload = {
      sql: `INSERT INTO leak_logs (id, created_at, privacy_score, entropy_score, leaks_webrtc, leaks_dns, leaks_battery, leaks_motion, api_surface, full_report_blob)
            VALUES (?1, datetime(?2 / 1000, 'unixepoch'), ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10);`,
      params: [
        entry.id,
        entry.createdAt,
        entry.privacyScore,
        entry.entropyScore,
        entry.leaks.webrtc ? 1 : 0,
        entry.leaks.dns,
        entry.leaks.battery ? 1 : 0,
        entry.leaks.motion ? 1 : 0,
        JSON.stringify(entry.apiSurface),
        JSON.stringify(entry.report),
      ],
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn('D1 persistence failed, falling back to file:', text);
      await this.persistToFile(entry);
    }
  }
}
