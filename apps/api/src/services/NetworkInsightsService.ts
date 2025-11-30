import crypto from 'node:crypto';
import { CloudflareWorkerClient } from '../clients/CloudflareWorkerClient';

export interface TracerouteHop {
  hop: number;
  ip: string;
  location: string;
  rtt: number;
}

export interface LanHost {
  ip: string;
  device: string;
  status: 'open' | 'filtered' | 'closed';
  service: string;
}

export interface NetworkInsightsPayload {
  traceroute: TracerouteHop[];
  ja3: {
    hash: string;
    userAgent: string;
    ciphers: string[];
  };
  lanHosts: LanHost[];
  dnsBeacon?: Record<string, unknown> | null;
}

export class NetworkInsightsService {
  private workerClient = new CloudflareWorkerClient();

  async getInsights(): Promise<NetworkInsightsPayload> {
    const traceroute = this.buildTraceroute();
    const lanHosts = this.buildLanHosts();
    const ja3 = await this.workerClient.fetchJA3();
    const beacon = await this.workerClient.beaconDNS(traceroute[traceroute.length - 1]?.ip || crypto.randomUUID());

    return {
      traceroute,
      lanHosts,
      dnsBeacon: beacon,
      ja3: {
        hash: ja3.ja3_hash,
        userAgent: ja3.user_agent,
        ciphers: (ja3.ciphers || '').split('-').filter(Boolean),
      },
    };
  }

  private buildTraceroute(): TracerouteHop[] {
    const backbone = [
      { hop: 1, ip: '192.168.0.1', location: 'LAN Gateway' },
      { hop: 2, ip: '10.12.0.1', location: 'ISP Edge' },
      { hop: 3, ip: '89.23.14.1', location: 'Regional POP' },
      { hop: 4, ip: '104.16.132.229', location: 'Cloudflare PoP' },
      { hop: 5, ip: '172.67.0.22', location: 'BrowserLeaks Edge' },
    ];

    return backbone.map((hop) => ({
      ...hop,
      rtt: Number((Math.random() * 40 + hop.hop * 3).toFixed(2)),
    }));
  }

  private buildLanHosts(): LanHost[] {
    return [
      { ip: '192.168.0.1', device: 'Gateway', status: 'open', service: 'HTTPS (TLS)' },
      { ip: '192.168.0.12', device: 'Workstation', status: 'filtered', service: 'RDP' },
      { ip: '192.168.0.24', device: 'IoT Camera', status: 'open', service: 'RTSP' },
      { ip: '192.168.0.35', device: 'NAS', status: 'closed', service: 'SMB' },
    ];
  }
}
