import type { PrivacyScore, IPLeakResult, DNSLeakResult, WebRTCLeakResult } from '@browserleaks/types';

export class PrivacyScoreService {
  /**
   * Calculate comprehensive privacy score
   */
  async calculate(data: {
    ipLeak?: IPLeakResult;
    dnsLeak?: DNSLeakResult;
    webrtcLeak?: WebRTCLeakResult;
    fingerprintResult?: any;
  }): Promise<PrivacyScore> {
    const breakdown = {
      ipPrivacy: this.calculateIPPrivacy(data.ipLeak),
      dnsPrivacy: this.calculateDNSPrivacy(data.dnsLeak),
      webrtcPrivacy: this.calculateWebRTCPrivacy(data.webrtcLeak),
      fingerprintResistance: this.calculateFingerprintResistance(data.fingerprintResult),
      browserConfig: this.calculateBrowserConfig(), // Basic implementation
    };

    const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
    const riskLevel = this.determineRiskLevel(totalScore);

    const vulnerabilities = this.collectVulnerabilities(data);

    return {
      totalScore,
      riskLevel,
      breakdown,
      vulnerabilities,
      timeline: [
        {
          timestamp: Date.now(),
          score: totalScore,
        },
      ],
    };
  }

  /**
   * Calculate IP privacy score (0-20)
   */
  private calculateIPPrivacy(ipLeak?: IPLeakResult): number {
    if (!ipLeak) return 0;

    let score = 20;

    // Deduct points for privacy issues
    const hasPrivacyProtection = ipLeak.privacy.isVPN || ipLeak.privacy.isTor || ipLeak.privacy.isProxy;

    if (!hasPrivacyProtection) {
      score -= 10; // No privacy protection at all (VPN/Tor/Proxy)
    } else {
      // Has some protection, give bonus for stronger options
      if (ipLeak.privacy.isTor) {
        // Tor is best for privacy, no deduction
      } else if (ipLeak.privacy.isVPN) {
        score -= 2; // VPN is good, slight deduction vs Tor
      } else if (ipLeak.privacy.isProxy) {
        score -= 5; // Proxy is weakest protection
      }
    }

    if (ipLeak.privacy.isDatacenter) score -= 3; // Datacenter IPs are less trustworthy

    // Reputation score affects privacy
    if (ipLeak.reputation.score < 50) {
      score -= 5;
    } else if (ipLeak.reputation.score < 70) {
      score -= 3;
    }

    if (ipLeak.reputation.isBlacklisted) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate DNS privacy score (0-15)
   */
  private calculateDNSPrivacy(dnsLeak?: DNSLeakResult): number {
    if (!dnsLeak) return 0;

    let score = 15;

    if (dnsLeak.isLeak) {
      if (dnsLeak.leakType === 'full') {
        score = 0; // Critical: Full DNS leak
      } else if (dnsLeak.leakType === 'partial') {
        score = 7; // Partial leak
      }
    }

    // Bonus for secure DNS
    if (dnsLeak.dohEnabled) score += 2;
    if (dnsLeak.dotEnabled) score += 2;

    return Math.min(15, Math.max(0, score));
  }

  /**
   * Calculate WebRTC privacy score (0-15)
   */
  private calculateWebRTCPrivacy(webrtcLeak?: WebRTCLeakResult): number {
    if (!webrtcLeak) return 0;

    let score = 15;

    if (webrtcLeak.isLeak) {
      // Deduct points based on leak severity
      if (webrtcLeak.localIPs.length > 0) {
        score -= 5; // Local IP leak
      }
      if (webrtcLeak.publicIPs.length > 0) {
        score -= 10; // Public IP leak (more severe)
      }
      if (webrtcLeak.mdnsLeak) {
        score -= 3; // mDNS leak
      }
      if (webrtcLeak.ipv6Leak) {
        score -= 3; // IPv6 leak
      }
    }

    // NAT type affects score
    if (webrtcLeak.natType === 'relay') {
      score += 3; // Relay is most secure
    }

    return Math.min(15, Math.max(0, score)); // Cap at 15 points
  }

  /**
   * Calculate Fingerprint Resistance score (0-30)
   */
  private calculateFingerprintResistance(fingerprintResult?: any): number {
    if (!fingerprintResult) return 0;

    let score = 30;

    // Lower uniqueness is better for privacy
    const uniqueness = fingerprintResult.uniquenessScore || 0;

    if (uniqueness >= 80) {
      score = 5; // Highly unique = bad for privacy
    } else if (uniqueness >= 60) {
      score = 15;
    } else if (uniqueness >= 40) {
      score = 22;
    } else {
      score = 30; // Low uniqueness = good for privacy
    }

    return score;
  }

  /**
   * Calculate Browser Config score (0-20)
   */
  private calculateBrowserConfig(): number {
    // Basic implementation - can be enhanced with more checks
    let score = 20;

    // Check for common privacy-friendly browser features
    if (typeof navigator !== 'undefined') {
      // DNT (Do Not Track) header
      if (!(navigator as any).doNotTrack || (navigator as any).doNotTrack !== '1') {
        score -= 5;
      }

      // Check if cookies are enabled (less privacy)
      if (navigator.cookieEnabled) {
        score -= 3;
      }
    }

    return Math.max(0, score);
  }

  /**
   * Determine overall risk level
   */
  private determineRiskLevel(totalScore: number): PrivacyScore['riskLevel'] {
    if (totalScore >= 80) return 'low';
    if (totalScore >= 60) return 'medium';
    if (totalScore >= 40) return 'high';
    return 'critical';
  }

  /**
   * Collect all vulnerabilities from different leak tests
   */
  private collectVulnerabilities(data: {
    ipLeak?: IPLeakResult;
    dnsLeak?: DNSLeakResult;
    webrtcLeak?: WebRTCLeakResult;
  }): PrivacyScore['vulnerabilities'] {
    const vulnerabilities: PrivacyScore['vulnerabilities'] = [];

    // IP Leak vulnerabilities
    if (data.ipLeak) {
      if (!data.ipLeak.privacy.isVPN && !data.ipLeak.privacy.isProxy) {
        vulnerabilities.push({
          category: 'IP Privacy',
          severity: 'medium',
          title: 'No VPN/Proxy Detected',
          description: 'Your real IP address is exposed without VPN or proxy protection.',
          recommendation: 'Use a trusted VPN service to hide your real IP address.',
        });
      }

      if (data.ipLeak.reputation.isBlacklisted) {
        vulnerabilities.push({
          category: 'IP Reputation',
          severity: 'critical',
          title: 'IP Blacklisted',
          description: 'Your IP address appears on blacklists.',
          recommendation: 'Contact your ISP or use a different IP address.',
        });
      }
    }

    // DNS Leak vulnerabilities
    if (data.dnsLeak?.isLeak) {
      vulnerabilities.push({
        category: 'DNS Privacy',
        severity: data.dnsLeak.leakType === 'full' ? 'critical' : 'high',
        title: 'DNS Leak Detected',
        description: `Your DNS queries are leaking (${data.dnsLeak.leakType} leak).`,
        recommendation: 'Use VPN with DNS leak protection or configure custom DNS servers.',
      });
    }

    // WebRTC Leak vulnerabilities
    if (data.webrtcLeak?.isLeak) {
      if (data.webrtcLeak.publicIPs.length > 0) {
        vulnerabilities.push({
          category: 'WebRTC Privacy',
          severity: 'critical',
          title: 'WebRTC IP Leak',
          description: 'WebRTC is leaking your public IP address.',
          recommendation: 'Disable WebRTC in browser settings or use WebRTC leak protection.',
        });
      }

      if (data.webrtcLeak.localIPs.length > 0) {
        vulnerabilities.push({
          category: 'WebRTC Privacy',
          severity: 'medium',
          title: 'Local IP Exposure',
          description: 'WebRTC is exposing your local network IP addresses.',
          recommendation: 'Use browser extensions to block WebRTC local IP leaks.',
        });
      }
    }

    return vulnerabilities;
  }
}
