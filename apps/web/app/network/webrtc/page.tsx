'use client';

import { useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';
import { useWebRTCDetect } from '@/hooks/useWebRTCDetect';

export default function WebRTCLeakPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, loading, error, progress, detect } = useWebRTCDetect();

  useEffect(() => {
    detect();
  }, [detect]);

  const statusReadings = useMemo(() => [
    {
      label: 'Status',
      value: loading ? `${progress}%` : data?.isLeak ? 'LEAK' : data ? 'SECURE' : 'IDLE',
      tone: data?.isLeak ? 'alert' as const : data ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'NAT Type',
      value: data?.natType?.toUpperCase() || '---',
      tone: data?.natType ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Risk',
      value: data?.riskLevel?.toUpperCase() || 'UNKNOWN',
      tone: data?.riskLevel === 'high' || data?.riskLevel === 'critical' ? 'alert' as const : 'active' as const,
    },
  ], [data, loading, progress]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={detect}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Protocol Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">WebRTC Leak Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect WebRTC IP leaks that can expose your real IP address even when using a VPN.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Local IPs */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Local IP Addresses
            </p>

            {loading ? (
              <div className="h-32 flex flex-col items-center justify-center text-slate-500">
                <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span>Probing STUN servers... {progress}%</span>
              </div>
            ) : data?.localIPs && data.localIPs.length > 0 ? (
              <div className="space-y-3">
                {data.localIPs.map((ip, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-800/40 rounded">
                    <span className="font-mono text-sm text-orange-300">{ip}</span>
                    <span className="text-xs text-orange-400">LOCAL LEAK</span>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    Your local network IP is exposed. This can reveal your network configuration.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <span className="text-cyan-400">No local IP leak detected</span>
              </div>
            )}
          </div>

          {/* Public IPs */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Public IP Addresses
            </p>

            {loading ? (
              <div className="h-32 flex items-center justify-center text-slate-500">
                Checking public IP exposure...
              </div>
            ) : data?.publicIPs && data.publicIPs.length > 0 ? (
              <div className="space-y-3">
                {data.publicIPs.map((ip, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-800/40 rounded">
                    <span className="font-mono text-sm text-red-300">{ip}</span>
                    <span className="text-xs text-red-400">PUBLIC LEAK</span>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-sm text-red-300">
                    Your public IP is exposed via WebRTC! VPN protection bypassed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <span className="text-cyan-400">No public IP leak detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Detection Details */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              NAT Type
            </p>
            <p className="text-2xl font-light text-cyan-300">{data?.natType?.toUpperCase() || '---'}</p>
            <p className="text-xs text-slate-500 mt-2">
              {data?.natType === 'host' && 'Direct connection (no NAT)'}
              {data?.natType === 'srflx' && 'Server reflexive (standard NAT)'}
              {data?.natType === 'prflx' && 'Peer reflexive (symmetric NAT)'}
              {data?.natType === 'relay' && 'TURN relay (strict firewall)'}
              {data?.natType === 'unknown' && 'Unable to determine'}
            </p>
          </div>

          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              mDNS Protection
            </p>
            <p className={`text-2xl font-light ${data?.mdnsLeak ? 'text-orange-400' : 'text-cyan-300'}`}>
              {data?.mdnsLeak ? 'DISABLED' : 'ENABLED'}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {data?.mdnsLeak
                ? 'mDNS not protecting your local IP'
                : 'Local IPs hidden behind mDNS'}
            </p>
          </div>

          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              IPv6 Status
            </p>
            <p className={`text-2xl font-light ${data?.ipv6Leak ? 'text-orange-400' : 'text-cyan-300'}`}>
              {data?.ipv6Leak ? 'LEAKING' : 'SECURE'}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {data?.ipv6Leak
                ? 'IPv6 address exposed via WebRTC'
                : 'No IPv6 address detected'}
            </p>
          </div>
        </div>

        {/* STUN Server Results */}
        {data?.stunResults && data.stunResults.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              STUN Server Results
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="py-2 text-slate-400 font-medium">Server</th>
                    <th className="py-2 text-slate-400 font-medium">IP Discovered</th>
                    <th className="py-2 text-slate-400 font-medium">Country</th>
                    <th className="py-2 text-slate-400 font-medium">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stunResults.map((result, i) => (
                    <tr key={i} className="border-b border-slate-800/60">
                      <td className="py-2 text-slate-300 font-mono text-xs">{result.server}</td>
                      <td className="py-2 text-cyan-300 font-mono">{result.ip}</td>
                      <td className="py-2 text-slate-400">{result.country}</td>
                      <td className="py-2 text-slate-400">{result.latency}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Risks */}
        {data?.risks && data.risks.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Detected Risks
            </p>
            <div className="space-y-3">
              {data.risks.map((risk, i) => (
                <div key={i} className={`p-4 rounded border ${
                  risk.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  risk.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                  risk.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-slate-800/50 border-slate-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs uppercase font-medium ${getRiskColor(risk.severity)}`}>
                      {risk.severity}
                    </span>
                    <span className="text-sm text-slate-200">{risk.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{risk.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data?.recommendations && data.recommendations.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Recommendations
            </p>
            <ul className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="text-cyan-400 mt-1">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            WebRTC Leaks: The VPN Killer You Never Knew About
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              WebRTC might be the biggest threat to your online privacy that you&apos;ve never heard of. This
              browser technology can expose your real IP address even when you&apos;re behind a VPN, Tor, or
              proxy. Here&apos;s what&apos;s really happening under the hood.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What is WebRTC?</h3>
            <p>
              WebRTC (Web Real-Time Communication) is a browser API that enables peer-to-peer audio, video,
              and data sharing directly between browsers. It powers Google Meet, Discord, and countless
              other real-time communication apps.
            </p>
            <p>
              The problem? To establish peer-to-peer connections, WebRTC needs to know your IP addresses -
              all of them. This includes your local network IP and your public IP. And it doesn&apos;t ask
              permission to use this information.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">How WebRTC Leaks Work</h3>
            <p>
              When you connect to a website, WebRTC makes requests to STUN (Session Traversal Utilities for NAT)
              servers to discover your IP addresses. These requests happen outside your VPN tunnel because
              they use UDP, which many VPNs don&apos;t route properly.
            </p>
            <p>
              The result? A website can run simple JavaScript to get your real IP address in seconds, completely
              bypassing your VPN protection. No special permissions needed. No warning to the user.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Gets Exposed</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Local IP Addresses</h4>
                <ul className="text-sm space-y-1">
                  <li>Your private network IP (192.168.x.x, 10.x.x.x)</li>
                  <li>Network interface details</li>
                  <li>IPv6 local addresses</li>
                  <li>VPN interface IPs (if using)</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Public IP Addresses</h4>
                <ul className="text-sm space-y-1">
                  <li>Your real public IPv4</li>
                  <li>Your real public IPv6 (if available)</li>
                  <li>ISP and geolocation data</li>
                  <li>NAT type information</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">NAT Types Explained</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Type</th>
                  <th className="text-left py-2 text-slate-300">Name</th>
                  <th className="text-left py-2 text-slate-300">Privacy Risk</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">host</td>
                  <td className="py-2">Direct Connection</td>
                  <td className="py-2 text-red-400">Highest - Real IP directly exposed</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">srflx</td>
                  <td className="py-2">Server Reflexive</td>
                  <td className="py-2 text-orange-400">High - Public IP via STUN</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">prflx</td>
                  <td className="py-2">Peer Reflexive</td>
                  <td className="py-2 text-yellow-400">Medium - IP discovered during connection</td>
                </tr>
                <tr>
                  <td className="py-2">relay</td>
                  <td className="py-2">TURN Relay</td>
                  <td className="py-2 text-cyan-400">Lower - Connection through relay server</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">mDNS: The Partial Solution</h3>
            <p>
              Modern browsers have started implementing mDNS (Multicast DNS) to hide local IP addresses.
              Instead of exposing &quot;192.168.1.5&quot;, the browser generates a random identifier like
              &quot;a1b2c3d4-e5f6-7890.local&quot;.
            </p>
            <p>
              This helps, but it&apos;s not perfect:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only hides local IPs, not public IPs</li>
              <li>Can be disabled in some browser configurations</li>
              <li>Doesn&apos;t work in all scenarios (e.g., Chrome on Android)</li>
              <li>The mDNS address itself can still be used for tracking</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Protection Methods</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Disable WebRTC entirely</strong> - Firefox:
                <code className="bg-slate-800 px-1 rounded">media.peerconnection.enabled = false</code>
                in about:config. Breaks video calling sites.
              </li>
              <li>
                <strong className="text-slate-300">Use browser extensions</strong> - WebRTC Leak Shield,
                uBlock Origin (with WebRTC blocking), or WebRTC Control.
              </li>
              <li>
                <strong className="text-slate-300">Use Tor Browser</strong> - WebRTC is disabled by default.
              </li>
              <li>
                <strong className="text-slate-300">VPN with WebRTC leak protection</strong> - Some VPNs
                include browser extensions that block WebRTC.
              </li>
              <li>
                <strong className="text-slate-300">Use Brave Browser</strong> - Has built-in fingerprinting
                protection that limits WebRTC exposure.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">Real-World Impact</h3>
            <p>
              WebRTC leaks have been documented since 2015, yet millions of VPN users remain vulnerable.
              A 2019 study found that 19% of VPN apps had WebRTC leaks, and the situation hasn&apos;t
              dramatically improved.
            </p>
            <p>
              The consequences can be serious:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Journalists protecting sources have their locations revealed</li>
              <li>Users bypassing geo-restrictions get blocked</li>
              <li>Privacy-conscious users are tracked despite precautions</li>
              <li>Corporate VPN users leak internal network details</li>
            </ul>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>WebRTC can bypass VPN protection entirely</li>
                <li>Both local and public IPs can be exposed</li>
                <li>mDNS only partially addresses the problem</li>
                <li>Always test for WebRTC leaks after enabling VPN</li>
                <li>Consider disabling WebRTC if you don&apos;t need video calling</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}
