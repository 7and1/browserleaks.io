import type { WebRTCLeakResult } from '@browserleaks/types';

export class WebRTCLeakService {
  /**
   * Analyze WebRTC leak test results
   */
  async analyze(
    publicIp: string,
    localIPs: string[],
    candidates: Array<{
      ip: string;
      type: string;
      server: string;
      country?: string;
      countryCode?: string;
    }>
  ): Promise<WebRTCLeakResult> {
    const isLeak = localIPs.length > 0 || candidates.some((c) => c.type === 'srflx');
    const publicIPs = candidates.filter((c) => c.type === 'srflx').map((c) => c.ip);

    // Detect IPv6 leak
    const ipv6Leak = [...localIPs, ...publicIPs].some((ip) => ip.includes(':'));

    // Detect mDNS leak (.local domains)
    const mdnsLeak = [...localIPs, ...publicIPs].some((ip) => ip.includes('.local'));

    // Determine NAT type from candidates
    const natType = this.determineNATType(candidates);

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(isLeak, ipv6Leak, mdnsLeak);

    // Generate risks
    const risks: WebRTCLeakResult['risks'] = [];
    const recommendations: string[] = [];

    if (isLeak) {
      if (localIPs.length > 0) {
        risks.push({
          severity: 'high',
          title: 'Local IP Addresses Exposed',
          description: `Your local IP addresses (${localIPs.join(', ')}) are visible through WebRTC. This can reveal information about your local network.`,
        });
        recommendations.push('Disable WebRTC in your browser or use a WebRTC leak protection extension');
      }

      if (publicIPs.length > 0) {
        risks.push({
          severity: 'critical',
          title: 'Public IP Exposed via WebRTC',
          description: `WebRTC is leaking your public IP address (${publicIPs.join(', ')}), which may bypass VPN protection.`,
        });
        recommendations.push('Use a VPN with built-in WebRTC leak protection');
      }

      if (ipv6Leak) {
        risks.push({
          severity: 'medium',
          title: 'IPv6 Leak Detected',
          description: 'Your IPv6 address is being leaked through WebRTC, which may expose your location.',
        });
        recommendations.push('Disable IPv6 or use a VPN that supports IPv6');
      }

      if (mdnsLeak) {
        risks.push({
          severity: 'medium',
          title: 'mDNS Leak Detected',
          description: 'mDNS (.local) addresses are being exposed, which can reveal your device information.',
        });
        recommendations.push('Disable mDNS in your browser settings');
      }
    } else {
      recommendations.push('No WebRTC leak detected. Your connection appears secure.');
    }

    return {
      isLeak,
      localIPs,
      publicIPs,
      natType,
      mdnsLeak,
      ipv6Leak,
      stunResults: candidates.map((c) => ({
        server: c.server,
        ip: c.ip,
        country: c.country || 'Unknown',
        latency: 0, // TODO: Measure latency
      })),
      riskLevel,
      risks,
      recommendations,
    };
  }

  private determineNATType(
    candidates: Array<{ type: string }>
  ): WebRTCLeakResult['natType'] {
    if (candidates.some((c) => c.type === 'relay')) return 'relay';
    if (candidates.some((c) => c.type === 'srflx')) return 'srflx';
    if (candidates.some((c) => c.type === 'prflx')) return 'prflx';
    if (candidates.some((c) => c.type === 'host')) return 'host';
    return 'unknown';
  }

  private calculateRiskLevel(
    isLeak: boolean,
    ipv6Leak: boolean,
    mdnsLeak: boolean
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (!isLeak) return 'low';
    if (ipv6Leak && mdnsLeak) return 'critical';
    if (ipv6Leak || mdnsLeak) return 'high';
    return 'medium';
  }
}
