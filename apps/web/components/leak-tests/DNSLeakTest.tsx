'use client';

import { useEffect, useState } from 'react';
import { useDNSDetect } from '@/hooks/useDNSDetect';
import { useIPDetect } from '@/hooks/useIPDetect';

export function DNSLeakTest() {
  const { data: dnsData, loading: dnsLoading, error: dnsError, detect: detectDNS } = useDNSDetect();
  const { data: ipData, detect: detectIP } = useIPDetect();
  const [hasStarted, setHasStarted] = useState(false);

  const handleTest = async () => {
    setHasStarted(true);

    // First get user's IP and country
    await detectIP();
  };

  // Auto-run DNS test after IP is detected
  useEffect(() => {
    if (ipData && hasStarted) {
      detectDNS(ipData.ip, ipData.geo.countryCode);
    }
  }, [ipData, hasStarted, detectDNS]);

  const getLeakStatusColor = () => {
    if (!dnsData) return 'text-gray-600';
    if (dnsData.leakType === 'none') return 'text-green-600';
    if (dnsData.leakType === 'partial') return 'text-orange-600';
    return 'text-red-600';
  };

  const getLeakStatusBg = () => {
    if (!dnsData) return 'bg-gray-100';
    if (dnsData.leakType === 'none') return 'bg-green-100';
    if (dnsData.leakType === 'partial') return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getLeakStatusText = () => {
    if (!dnsData) return 'Loading...';
    if (dnsData.leakType === 'none') return 'No Leak Detected';
    if (dnsData.leakType === 'partial') return 'Partial Leak';
    return 'Full Leak Detected';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">DNS Leak Test</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Detect if your DNS queries are leaking your real location
        </p>
        <button
          onClick={handleTest}
          disabled={dnsLoading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {dnsLoading ? 'Loading...' : hasStarted ? 'Retry' : 'Start Scan'}
        </button>
      </div>

      {/* Loading State */}
      {dnsLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Testing DNS servers...
          </p>
        </div>
      )}

      {/* Error State */}
      {dnsError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{dnsError}</p>
        </div>
      )}

      {/* Results */}
      {dnsData && !dnsLoading && (
        <div className="space-y-6">
          {/* Leak Status */}
          <div className={`rounded-lg shadow-lg p-6 ${getLeakStatusBg()}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  DNS Leak Status
                </h3>
                <p className={`text-3xl font-bold ${getLeakStatusColor()}`}>
                  {getLeakStatusText()}
                </p>
              </div>
              <div className="text-6xl">
                {dnsData.isLeak ? '⚠️' : '✅'}
              </div>
            </div>
          </div>

          {/* DNS Servers Detected */}
          {dnsData.servers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">
                DNS Servers Detected ({dnsData.servers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dnsData.servers.map((server, index) => (
                  <div
                    key={`${server.ip}-${index}`}
                    className="border-2 rounded-lg p-4"
                    style={{
                      borderColor: server.countryCode === ipData?.geo.countryCode
                        ? '#10b981'
                        : '#ef4444',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          DNS Server #{index + 1}
                        </div>
                        <div className="font-mono font-bold text-lg">
                          {server.ip}
                        </div>
                      </div>
                      <div className="text-2xl">
                        {server.countryCode === ipData?.geo.countryCode ? '✓' : '✗'}
                      </div>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Country:
                        </span>
                        <span className="font-semibold">
                          {server.country} ({server.countryCode})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          ISP:
                        </span>
                        <span className="font-semibold truncate" title={server.isp}>
                          {server.isp}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DNS Features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              Security Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DNSFeature
                label="DNS-over-HTTPS (DoH)"
                enabled={dnsData.dohEnabled}
              />
              <DNSFeature
                label="DNS-over-TLS (DoT)"
                enabled={dnsData.dotEnabled}
              />
            </div>
          </div>

          {/* Risks */}
          {dnsData.risks.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">
                ⚠️ Vulnerabilities
              </h3>
              <div className="space-y-3">
                {dnsData.risks.map((risk, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4">
                    <div className="font-semibold text-red-900 dark:text-red-100">
                      {risk.title}
                    </div>
                    <div className="text-sm text-red-800 dark:text-red-200 mt-1">
                      {risk.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {dnsData.recommendations.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">
                💡 Recommendations
              </h3>
              <ul className="space-y-2">
                {dnsData.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-blue-900 dark:text-blue-100"
                  >
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Test Info */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Test ID: {dnsData.testId}
          </div>
        </div>
      )}

      {/* Educational Content */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          DNS Leaks: The Invisible Backdoor in Your Privacy
        </h2>

        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <p className="text-xl text-gray-800 dark:text-gray-200">
            You&apos;re connected to a VPN. Your IP shows you&apos;re in Switzerland. You feel safe.
            But there&apos;s a problem: every website you visit, your internet provider still knows
            about it. How? DNS leaks. Let me explain why this is one of the most overlooked
            privacy holes on the internet.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            What Is DNS? The Internet&apos;s Phone Book
          </h3>
          <p>
            DNS (Domain Name System) is shockingly simple. When you type &quot;google.com&quot; into
            your browser, your computer has no idea what that means. Computers only understand
            IP addresses - numbers like 142.250.80.46. So your computer asks a DNS server:
            &quot;Hey, what&apos;s the IP address for google.com?&quot;
          </p>
          <p>
            Here&apos;s the process in plain English:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>You type &quot;google.com&quot; in your browser</li>
            <li>Your computer sends a DNS query to a DNS server</li>
            <li>That query is in plain text - completely unencrypted</li>
            <li>The DNS server responds with google.com&apos;s IP address</li>
            <li>Now your browser connects to Google</li>
          </ol>
          <p>
            The problem? By default, your DNS queries go to your ISP&apos;s DNS servers. They see
            every single website you visit, even if you think you&apos;re using a VPN.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            What Is a DNS Leak? The VPN Killer
          </h3>
          <p>
            A DNS leak happens when your DNS queries bypass your VPN tunnel and go directly to
            your ISP. Here&apos;s the scary part: even though your actual web traffic is encrypted
            and routed through the VPN, your DNS queries reveal every website you visit.
          </p>
          <div className="my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Scenario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Your ISP Sees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk Level</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm">No VPN</td>
                  <td className="px-6 py-4 text-sm">Everything</td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">High</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm">VPN without DNS protection</td>
                  <td className="px-6 py-4 text-sm">All DNS queries (every site visited)</td>
                  <td className="px-6 py-4 text-sm font-semibold text-orange-600">Medium-High</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm">VPN with DNS leak</td>
                  <td className="px-6 py-4 text-sm">Some DNS queries</td>
                  <td className="px-6 py-4 text-sm font-semibold text-yellow-600">Medium</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm">VPN with proper DNS routing</td>
                  <td className="px-6 py-4 text-sm">Nothing (encrypted tunnel)</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">Low</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            How DNS Leaks Happen (Technical Breakdown)
          </h3>
          <p>
            DNS leaks occur due to several technical issues:
          </p>
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-3">Windows Smart Multi-Homed Resolution</h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                Windows 10/11 sends DNS queries to ALL available DNS servers simultaneously for
                speed. This means even with a VPN, queries still go to your ISP&apos;s DNS.
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-3">IPv6 DNS Leaks</h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                Many VPNs only route IPv4 traffic. If your computer makes IPv6 DNS requests,
                they bypass the VPN tunnel entirely.
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-3">Transparent DNS Proxies</h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                Some ISPs intercept DNS traffic on port 53 and redirect it to their own servers,
                regardless of your configured DNS settings.
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-3">Browser DoH Bypass</h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                Chrome and Firefox use their own DNS-over-HTTPS settings, which can bypass
                system DNS configuration and VPN DNS routing.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            The Real-World Privacy Impact
          </h3>
          <p>
            DNS leaks are devastating for privacy because:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-gray-900 dark:text-white">Your ISP logs everything:</strong> US ISPs are legally allowed to sell your browsing data. In 2017, Congress repealed rules preventing this.</li>
            <li><strong className="text-gray-900 dark:text-white">Government surveillance:</strong> Law enforcement can request DNS logs from your ISP with a simple subpoena - no warrant required.</li>
            <li><strong className="text-gray-900 dark:text-white">Network administrators see all:</strong> At work, school, or public WiFi, admins can monitor all DNS queries.</li>
            <li><strong className="text-gray-900 dark:text-white">Data retention:</strong> ISPs typically retain DNS logs for 6 months to 2 years, creating a historical record of your browsing.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            DNS Privacy Statistics You Need to Know
          </h3>
          <p>
            According to research from Cloudflare and the Internet Society:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-gray-900 dark:text-white">94%</strong> of DNS queries are still unencrypted globally</li>
            <li><strong className="text-gray-900 dark:text-white">70%</strong> of internet users still use their ISP&apos;s default DNS servers</li>
            <li><strong className="text-gray-900 dark:text-white">83%</strong> of VPN users have experienced a DNS leak at some point</li>
            <li><strong className="text-gray-900 dark:text-white">41%</strong> of free VPNs have DNS leak vulnerabilities</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            DoH vs DoT: Encrypted DNS Explained
          </h3>
          <p>
            There are two main solutions for encrypting DNS queries:
          </p>
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3">DNS-over-HTTPS (DoH)</h4>
              <ul className="text-sm space-y-2 text-blue-700 dark:text-blue-400">
                <li>• Uses port 443 (same as HTTPS websites)</li>
                <li>• Hard for ISPs to block or detect</li>
                <li>• Supported by Chrome, Firefox, Edge</li>
                <li>• Providers: Cloudflare (1.1.1.1), Google (8.8.8.8)</li>
              </ul>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-bold text-green-800 dark:text-green-300 mb-3">DNS-over-TLS (DoT)</h4>
              <ul className="text-sm space-y-2 text-green-700 dark:text-green-400">
                <li>• Uses port 853 (dedicated DNS port)</li>
                <li>• Can be blocked by firewalls</li>
                <li>• System-level support on Android/iOS</li>
                <li>• Slightly faster than DoH</li>
              </ul>
            </div>
          </div>
          <p>
            The recommendation? Use DoH if you need to bypass network restrictions, DoT if
            you&apos;re on a trusted network and want maximum performance.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            How to Fix DNS Leaks
          </h3>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong className="text-gray-900 dark:text-white">Use a VPN with DNS leak protection:</strong> Quality VPNs
              (like Mullvad, ProtonVPN, Windscribe) route all DNS through their servers and block
              external DNS requests.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Enable DoH in your browser:</strong> Go to settings → Privacy
              → Enable DNS-over-HTTPS. Use Cloudflare or NextDNS as your provider.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Disable IPv6:</strong> If your VPN doesn&apos;t support IPv6,
              disable it at the OS level to prevent IPv6 DNS leaks.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Use a firewall:</strong> Configure your firewall to only
              allow DNS traffic through your VPN&apos;s DNS servers.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Disable Smart Multi-Homed Resolution (Windows):</strong> Run
              PowerShell as admin: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Set-NetDnsClient -InterfaceAlias &quot;*&quot; -RegisterThisConnectionsAddress $False</code>
            </li>
          </ol>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            Best DNS Providers for Privacy
          </h3>
          <div className="overflow-x-auto my-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IPv4 Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DoH/DoT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logging Policy</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Cloudflare</td>
                  <td className="px-6 py-4 text-sm font-mono">1.1.1.1</td>
                  <td className="px-6 py-4 text-sm">Both</td>
                  <td className="px-6 py-4 text-sm">No logging (audited)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Quad9</td>
                  <td className="px-6 py-4 text-sm font-mono">9.9.9.9</td>
                  <td className="px-6 py-4 text-sm">Both</td>
                  <td className="px-6 py-4 text-sm">No personal data logging</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">NextDNS</td>
                  <td className="px-6 py-4 text-sm font-mono">45.90.28.0</td>
                  <td className="px-6 py-4 text-sm">Both</td>
                  <td className="px-6 py-4 text-sm">Configurable</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Mullvad DNS</td>
                  <td className="px-6 py-4 text-sm font-mono">194.242.2.2</td>
                  <td className="px-6 py-4 text-sm">Both</td>
                  <td className="px-6 py-4 text-sm">No logging</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            The Bottom Line
          </h3>
          <p>
            DNS leaks are the silent killer of online privacy. You can have the best VPN in
            the world, but if your DNS queries are going to your ISP, they still know every
            website you visit. Testing for DNS leaks should be the first thing you do after
            connecting to any VPN.
          </p>
          <p>
            The good news? Fixing DNS leaks is straightforward. Use a VPN with built-in DNS
            protection, enable DoH in your browser, and regularly test for leaks. Your privacy
            is worth the extra 5 minutes of setup.
          </p>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3">DNS Privacy Facts</h4>
            <ul className="text-sm space-y-2 text-blue-700 dark:text-blue-400">
              <li>• 94% of DNS queries are still unencrypted globally</li>
              <li>• Your ISP can legally sell your DNS browsing history in the US</li>
              <li>• 83% of VPN users have experienced DNS leaks</li>
              <li>• DNS leaks reveal every website you visit, even with a VPN</li>
              <li>• Encrypted DNS (DoH/DoT) is the solution - enable it today</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function DNSFeature({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div
      className={`
      flex items-center justify-between p-4 rounded-lg border-2
      ${enabled
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-300 bg-gray-50 dark:bg-gray-700'
        }
    `}
    >
      <span className="font-medium">{label}</span>
      <span className={`text-2xl ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
        {enabled ? '✓' : '✗'}
      </span>
    </div>
  );
}
