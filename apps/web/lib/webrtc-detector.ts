/**
 * WebRTC Leak Detector
 * Detects local and public IPs through WebRTC STUN servers
 */

export interface STUNServer {
  id: string;
  name: string;
  url: string;
}

export interface WebRTCCandidate {
  ip: string;
  type: 'host' | 'srflx' | 'prflx' | 'relay' | 'unknown';
  server: string;
  rawCandidate: string;
}

export const STUN_SERVERS: STUNServer[] = [
  { id: 'google', name: 'Google', url: 'stun:stun.l.google.com:19302' },
  { id: 'cloudflare', name: 'Cloudflare', url: 'stun:stun.cloudflare.com' },
  { id: 'twilio', name: 'Twilio', url: 'stun:global.stun.twilio.com' },
  { id: 'mozilla', name: 'Mozilla', url: 'stun:stun.services.mozilla.com' },
];

export class WebRTCDetector {
  private candidates: WebRTCCandidate[] = [];
  private localIPs: Set<string> = new Set();
  private publicIPs: Set<string> = new Set();

  /**
   * Test a single STUN server
   */
  async testSTUNServer(server: STUNServer, timeout: number = 5000): Promise<WebRTCCandidate[]> {
    return new Promise((resolve) => {
      const results: WebRTCCandidate[] = [];
      let candidateReceived = false;

      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: server.url }],
        });

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            candidateReceived = true;
            const candidate = this.parseCandidate(event.candidate.candidate, server.name);
            if (candidate) {
              results.push(candidate);

              // Track local and public IPs
              if (candidate.type === 'host') {
                this.localIPs.add(candidate.ip);
              } else if (candidate.type === 'srflx') {
                this.publicIPs.add(candidate.ip);
              }
            }
          } else if (event.candidate === null) {
            // All candidates gathered
            pc.close();
            resolve(results);
          }
        };

        // Create a data channel and offer
        pc.createDataChannel('');
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(() => {
            pc.close();
            resolve(results);
          });

        // Timeout
        setTimeout(() => {
          if (!candidateReceived) {
            pc.close();
            resolve(results);
          }
        }, timeout);
      } catch (error) {
        console.error(`STUN server ${server.name} test error:`, error);
        resolve(results);
      }
    });
  }

  /**
   * Parse ICE candidate to extract IP and type
   */
  private parseCandidate(candidateString: string, serverName: string): WebRTCCandidate | null {
    // Extract IP address (IPv4 or IPv6)
    const ipv4Match = candidateString.match(/(\d{1,3}\.){3}\d{1,3}/);
    const ipv6Match = candidateString.match(/([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|::1|fe80::[0-9a-f]{0,4}/i);

    const ip = ipv4Match ? ipv4Match[0] : (ipv6Match ? ipv6Match[0] : null);
    if (!ip) return null;

    // Skip invalid IPs
    if (ip === '0.0.0.0' || ip.startsWith('0.')) return null;

    // Extract candidate type
    const parts = candidateString.split(' ');
    const typeIndex = parts.findIndex((p) => p === 'typ') + 1;
    const typeStr = typeIndex > 0 ? parts[typeIndex] : 'unknown';

    const type = this.normalizeType(typeStr);

    return {
      ip,
      type,
      server: serverName,
      rawCandidate: candidateString,
    };
  }

  /**
   * Normalize candidate type
   */
  private normalizeType(type: string): WebRTCCandidate['type'] {
    switch (type) {
      case 'host':
        return 'host';
      case 'srflx':
        return 'srflx';
      case 'prflx':
        return 'prflx';
      case 'relay':
        return 'relay';
      default:
        return 'unknown';
    }
  }

  /**
   * Test all STUN servers
   */
  async detectAll(): Promise<{
    candidates: WebRTCCandidate[];
    localIPs: string[];
    publicIPs: string[];
  }> {
    this.candidates = [];
    this.localIPs.clear();
    this.publicIPs.clear();

    // Test all servers in parallel
    const results = await Promise.all(
      STUN_SERVERS.map((server) => this.testSTUNServer(server))
    );

    // Flatten results
    this.candidates = results.flat();

    return {
      candidates: this.candidates,
      localIPs: Array.from(this.localIPs),
      publicIPs: Array.from(this.publicIPs),
    };
  }

  /**
   * Get unique IPs
   */
  getUniqueIPs(): string[] {
    return Array.from(new Set(this.candidates.map((c) => c.ip)));
  }

  /**
   * Check if there's a leak
   */
  hasLeak(): boolean {
    return this.localIPs.size > 0 || this.publicIPs.size > 0;
  }
}
