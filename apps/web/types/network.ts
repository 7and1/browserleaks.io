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
  lanHosts: LanHost[];
  dnsBeacon?: Record<string, unknown> | null;
  ja3: {
    hash: string;
    userAgent: string;
    ciphers: string[];
  };
}
