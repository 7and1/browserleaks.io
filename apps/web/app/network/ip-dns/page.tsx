'use client';

import { useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';
import { useIPDetect } from '@/hooks/useIPDetect';
import { useDNSDetect } from '@/hooks/useDNSDetect';

export default function IPDNSLeakPage() {
  const { data: ipData, loading: ipLoading, error: ipError, detect: detectIP } = useIPDetect();
  const { data: dnsData, loading: dnsLoading, error: dnsError, detect: detectDNS } = useDNSDetect();

  useEffect(() => {
    detectIP();
  }, [detectIP]);

  useEffect(() => {
    if (ipData?.ip && ipData?.geo?.countryCode) {
      detectDNS(ipData.ip, ipData.geo.countryCode);
    }
  }, [ipData, detectDNS]);

  const runAllTests = async () => {
    await detectIP();
  };

  const loading = ipLoading || dnsLoading;

  const statusReadings = useMemo(() => [
    {
      label: 'IP',
      value: ipData?.ip || (ipLoading ? 'SCANNING' : 'UNKNOWN'),
      tone: ipData?.ip ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'DNS',
      value: dnsData?.leakType?.toUpperCase() || (dnsLoading ? 'TESTING' : 'PENDING'),
      tone: dnsData?.leakType === 'none' ? 'active' as const : dnsData?.leakType ? 'alert' as const : 'neutral' as const,
    },
    {
      label: 'Risk',
      value: dnsData?.leakType === 'full' ? 'HIGH' : dnsData?.leakType === 'partial' ? 'MEDIUM' : ipData ? 'LOW' : '---',
      tone: dnsData?.leakType === 'full' ? 'alert' as const : 'active' as const,
    },
  ], [ipData, ipLoading, dnsData, dnsLoading]);

  const getLeakStatusColor = (type: string) => {
    switch (type) {
      case 'full': return 'text-red-400';
      case 'partial': return 'text-orange-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={runAllTests}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Protocol Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">IP & DNS Leak Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect if your real IP address or DNS queries are exposed when using VPN or proxy services.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* IP Results */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              IP Detection
            </p>

            {ipLoading ? (
              <div className="h-32 flex items-center justify-center text-slate-500">
                Detecting IP address...
              </div>
            ) : ipData ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-3xl font-mono text-cyan-300">{ipData.ip}</p>
                  <p className="text-sm text-slate-400 mt-2">
                    {ipData.geo?.city}, {ipData.geo?.region}, {ipData.geo?.countryCode}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <ResultRow label="ISP" value={ipData.network?.isp || '---'} />
                  <ResultRow label="ASN" value={ipData.network?.asn?.toString() || '---'} />
                  <ResultRow label="Type" value={ipData.privacy?.isVPN ? 'VPN' : ipData.privacy?.isProxy ? 'Proxy' : 'Residential'} />
                  <ResultRow label="Reputation" value={`${ipData.reputation?.score || 0}/100`} />
                </div>

                {(ipData.privacy?.isVPN || ipData.privacy?.isProxy) && (
                  <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded">
                    <p className="text-sm text-cyan-300">
                      VPN/Proxy detected. Your real IP may be hidden.
                    </p>
                  </div>
                )}
              </div>
            ) : ipError ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-sm text-red-300">{ipError}</p>
              </div>
            ) : null}
          </div>

          {/* DNS Results */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              DNS Leak Detection
            </p>

            {dnsLoading ? (
              <div className="h-32 flex items-center justify-center text-slate-500">
                Testing DNS servers...
              </div>
            ) : dnsData ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className={`text-2xl font-semibold ${getLeakStatusColor(dnsData.leakType)}`}>
                    {dnsData.leakType === 'none' ? 'No DNS Leak Detected' :
                     dnsData.leakType === 'partial' ? 'Partial DNS Leak' : 'Full DNS Leak Detected'}
                  </p>
                  <p className="text-sm text-slate-400 mt-2">
                    {dnsData.servers?.length || 0} DNS server(s) detected
                  </p>
                </div>

                {dnsData.servers && dnsData.servers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Detected Servers</p>
                    {dnsData.servers.slice(0, 5).map((server, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/60">
                        <span className="text-sm text-slate-400">{server.ip}</span>
                        <span className="text-xs text-slate-500">{server.isp} ({server.country})</span>
                      </div>
                    ))}
                  </div>
                )}

                {dnsData.leakType !== 'none' && (
                  <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                    <p className="text-sm text-orange-300">
                      Your DNS queries may expose your real location or ISP.
                    </p>
                  </div>
                )}
              </div>
            ) : dnsError ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-sm text-red-300">{dnsError}</p>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                Waiting for IP detection...
              </div>
            )}
          </div>
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            IP and DNS Leaks: When Your VPN Fails to Protect You
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              You paid for a VPN. You turned it on. You think you&apos;re anonymous. But here&apos;s the uncomfortable
              truth: your VPN might be leaking your real identity right now. Let me explain exactly how IP
              and DNS leaks work and why they matter.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What is an IP Leak?</h3>
            <p>
              Your IP address is like your home address on the internet. When you use a VPN, websites should
              see the VPN server&apos;s IP, not yours. An IP leak happens when your real IP slips through despite
              the VPN being active.
            </p>
            <p>
              This can happen through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">WebRTC leaks</strong> - Browser APIs that bypass VPN tunnels</li>
              <li><strong className="text-slate-300">VPN disconnections</strong> - Brief moments when protection drops</li>
              <li><strong className="text-slate-300">IPv6 leaks</strong> - When only IPv4 is tunneled through VPN</li>
              <li><strong className="text-slate-300">Split tunneling misconfiguration</strong> - Some traffic going outside VPN</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">What is a DNS Leak?</h3>
            <p>
              DNS (Domain Name System) translates website names to IP addresses. When you type &quot;google.com&quot;,
              a DNS server looks up the IP. Normally, this query goes to your ISP&apos;s DNS servers - and they
              see every website you visit.
            </p>
            <p>
              A good VPN routes DNS queries through its own servers. A DNS leak means your queries still
              go to your ISP&apos;s servers, even with VPN active. Your ISP (and potentially others) can see
              your browsing history.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Types of DNS Leaks</h3>
            <div className="grid md:grid-cols-3 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">No Leak</h4>
                <p className="text-sm">
                  All DNS queries go through VPN servers. ISP cannot see your browsing.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Partial Leak</h4>
                <p className="text-sm">
                  Some queries go through VPN, others leak to ISP. Inconsistent protection.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-red-300 font-medium mb-2">Full Leak</h4>
                <p className="text-sm">
                  All DNS queries visible to ISP. VPN is essentially useless for privacy.
                </p>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Why This Matters</h3>
            <p>
              Even with a VPN, DNS leaks can expose:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Every website you visit (even encrypted HTTPS sites)</li>
              <li>Your approximate location (ISP servers are regional)</li>
              <li>When you&apos;re online and browsing patterns</li>
              <li>Potential for ISP throttling based on your activity</li>
            </ul>
            <p>
              In countries with internet censorship, DNS leaks can have serious consequences. Journalists,
              activists, and privacy-conscious users rely on VPNs working correctly.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Common Causes of Leaks</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Cause</th>
                  <th className="text-left py-2 text-slate-300">Description</th>
                  <th className="text-left py-2 text-slate-300">Solution</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Windows DNS</td>
                  <td className="py-2">Windows uses multiple DNS sources simultaneously</td>
                  <td className="py-2">Disable Smart Multi-Homed Name Resolution</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">IPv6 not tunneled</td>
                  <td className="py-2">VPN only handles IPv4, IPv6 bypasses it</td>
                  <td className="py-2">Disable IPv6 or use VPN with IPv6 support</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Transparent proxies</td>
                  <td className="py-2">ISP intercepts DNS on port 53</td>
                  <td className="py-2">Use DNS over HTTPS (DoH)</td>
                </tr>
                <tr>
                  <td className="py-2">Router DNS</td>
                  <td className="py-2">Router hardcoded to use ISP DNS</td>
                  <td className="py-2">Configure router to use VPN DNS</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">How to Protect Yourself</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use a reputable VPN</strong> - Not all VPNs are equal.
                Choose one with built-in DNS leak protection and a kill switch.
              </li>
              <li>
                <strong className="text-slate-300">Enable kill switch</strong> - Blocks internet if VPN
                disconnects, preventing IP leaks during brief outages.
              </li>
              <li>
                <strong className="text-slate-300">Disable WebRTC</strong> - In browser settings or via
                extension. WebRTC can leak local and public IPs.
              </li>
              <li>
                <strong className="text-slate-300">Use DNS over HTTPS</strong> - Encrypts DNS queries,
                preventing ISP from intercepting them.
              </li>
              <li>
                <strong className="text-slate-300">Test regularly</strong> - Use this tool to verify your
                VPN is working correctly before sensitive activities.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">DNS Leak Test Methodology</h3>
            <p>
              Our test works by making DNS queries to special servers we control. When your browser
              requests these domains, the DNS resolver handling the query reveals itself. We then
              compare this resolver to your IP address location to detect leaks.
            </p>
            <p>
              A well-configured VPN should show DNS servers in the same country/region as your VPN
              exit node, not your physical location.
            </p>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Quick Reference: Leak Prevention</h4>
              <ul className="text-sm space-y-2">
                <li>Always test your VPN after connecting</li>
                <li>Check for WebRTC leaks separately (see our WebRTC test)</li>
                <li>Consider using Tor for maximum anonymity</li>
                <li>DNS over HTTPS adds an extra layer of protection</li>
                <li>Some countries block known VPN DNS servers</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-none">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-mono text-sm text-cyan-200 truncate max-w-[150px]" title={value}>{value}</span>
    </div>
  );
}
