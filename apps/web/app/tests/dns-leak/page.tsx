import { DNSLeakTest } from '@/components/leak-tests/DNSLeakTest';
import Link from 'next/link';
import {
  Server,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
  Globe,
  Activity,
  Database,
} from 'lucide-react';

export async function generateMetadata() {
  return {
    title: 'Free DNS Leak Test - Check If Your VPN Is Exposing Your DNS Queries',
    description: 'Test your VPN for DNS leaks instantly. 21% of VPNs leak DNS requests to your ISP. Our free DNS leak test reveals which DNS servers handle your queries and if your browsing history is exposed.',
    keywords: ['DNS leak test', 'VPN DNS leak', 'DNS privacy', 'DNS query test', 'VPN test', 'DNS resolver check', 'privacy test', 'DNS security'],
    openGraph: {
      title: 'Free DNS Leak Test - Is Your ISP Seeing Your Browsing History?',
      description: 'Instant DNS leak detection. 21% of VPNs fail DNS leak tests. Check which DNS servers handle your requests.',
      type: 'website',
      images: ['/og-dns-leak.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'DNS Leak Test - Check Your VPN Privacy',
      description: 'Free instant test to see if your DNS queries are being leaked to your ISP.',
    },
    alternates: {
      canonical: 'https://browserleaks.io/tests/dns-leak',
    },
  };
}

export default function DNSLeakPage() {
  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'DNS Leak Test',
            description: 'Free tool to test if your VPN is leaking DNS queries to your ISP, exposing your browsing history.',
            url: 'https://browserleaks.io/tests/dns-leak',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 mb-4">
              <Server className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">DNS Privacy Check</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100">
              Free DNS Leak Test
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Find out if your ISP can see which websites you visit
            </p>
          </div>
        </div>
      </section>

      {/* Test Component */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <DNSLeakTest />
        </div>
      </section>

      {/* Educational Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/50">
        <div className="mx-auto max-w-4xl">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-8 text-center">
              DNS Leaks: The Silent Privacy Killer
            </h2>

            <div className="space-y-8 text-slate-300 leading-relaxed">
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  What is DNS and Why Does It Matter?
                </h3>
                <p>
                  Let me explain DNS in the simplest way possible. When you type "google.com" into your browser,
                  your computer has no idea what that means. It needs to ask someone "Hey, what's the actual
                  address for google.com?"
                </p>
                <p className="mt-4">
                  That "someone" is a DNS server. Think of it like calling directory assistance before smartphones
                  existed - you'd call, give them a name, and they'd give you the phone number.
                </p>
                <p className="mt-4">
                  Here's the problem: <strong className="text-white">whoever handles your DNS requests can see
                  every single website you visit</strong>. Every. Single. One. And they keep logs.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  The DNS Leak Problem
                </h3>
                <p>
                  When you use a VPN, all your traffic - including DNS requests - should go through the VPN tunnel.
                  But sometimes that doesn't happen. Your DNS requests can "leak" out and go directly to your
                  ISP's DNS servers.
                </p>
                <p className="mt-4">
                  The scary statistics? A comprehensive study testing 74 VPN services found that
                  <strong className="text-white"> 15 of them (21%) were leaking DNS data</strong>. That's more
                  than 1 in 5 VPNs failing at a fundamental privacy feature.
                </p>
                <p className="mt-4">
                  Even worse - <a href="https://www.expressvpn.com/blog/audit-report-research-paper-windows-dns-leaks/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">ExpressVPN's 2024 audit</a> discovered
                  what appears to be an industry-wide flaw in how DNS leaks are tested. Many VPN providers might
                  not even know they have a problem.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  What Your ISP Knows About You
                </h3>
                <p>
                  If your DNS is leaking, your Internet Service Provider has a complete record of:
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-slate-400">
                  <li><strong className="text-slate-200">Every website you visit</strong> - Including timestamps</li>
                  <li><strong className="text-slate-200">How often you visit them</strong> - Patterns reveal a lot</li>
                  <li><strong className="text-slate-200">Your interests</strong> - Health searches, shopping, news preferences</li>
                  <li><strong className="text-slate-200">Your work</strong> - If you work from home, they see your work sites too</li>
                </ul>
                <p className="mt-4">
                  This data is often packaged into profiles and <strong className="text-white">sold to advertisers,
                  data brokers, and yes - sometimes handed over to government agencies</strong>. In the worst cases,
                  this information can be fatal for journalists, activists, and dissidents.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Common Causes of DNS Leaks
                </h3>
                <div className="space-y-4 mt-4">
                  <div className="border-l-2 border-rose-500/50 pl-4">
                    <h4 className="font-semibold text-rose-400">Windows Smart Multi-Homed Name Resolution</h4>
                    <p className="mt-2 text-sm">
                      Windows 10 and 11 send DNS queries through all available network adapters simultaneously
                      to get the fastest response. This means your queries go outside the VPN tunnel.
                    </p>
                  </div>

                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <h4 className="font-semibold text-amber-400">IPv6 DNS Requests</h4>
                    <p className="mt-2 text-sm">
                      Many VPNs only handle IPv4 DNS. If your network supports IPv6, those DNS requests
                      can leak to your ISP's IPv6 DNS servers.
                    </p>
                  </div>

                  <div className="border-l-2 border-violet-500/50 pl-4">
                    <h4 className="font-semibold text-violet-400">Transparent DNS Proxies</h4>
                    <p className="mt-2 text-sm">
                      Some ISPs intercept all DNS traffic on port 53, regardless of which DNS server you
                      configured. Your requests to "8.8.8.8" might actually be answered by your ISP.
                    </p>
                  </div>

                  <div className="border-l-2 border-cyan-500/50 pl-4">
                    <h4 className="font-semibold text-cyan-400">VPN Disconnection</h4>
                    <p className="mt-2 text-sm">
                      If your VPN connection drops, even for a second, your DNS requests can leak to
                      your ISP before the connection is restored.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  How Our DNS Leak Test Works
                </h3>
                <p>
                  Our test sends specially crafted DNS requests through your connection:
                </p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">Unique Subdomain Requests</strong> - We generate random subdomains that only our servers know about</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">DNS Server Identification</strong> - We record which DNS servers actually resolve your requests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">Multiple Request Types</strong> - We test both IPv4 and IPv6 DNS resolution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">Geographic Analysis</strong> - We show you where your DNS servers are located</span>
                  </li>
                </ul>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  How to Fix DNS Leaks
                </h3>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Enable VPN DNS Protection</h4>
                    <p className="text-sm text-slate-400">
                      Most quality VPNs have a "DNS leak protection" or "Use VPN DNS" setting. Make sure it's enabled.
                      This forces all DNS queries through the VPN's own DNS servers.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Disable Smart Multi-Homed Name Resolution (Windows)</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>1. Open Group Policy Editor (gpedit.msc)</li>
                      <li>2. Navigate to Computer Configuration → Administrative Templates → Network → DNS Client</li>
                      <li>3. Enable "Turn off smart multi-homed name resolution"</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Use DNS over HTTPS (DoH)</h4>
                    <p className="text-sm text-slate-400">
                      DoH encrypts your DNS queries, preventing your ISP from seeing them even if they leak.
                      Enable DoH in your browser settings or use a DNS provider that supports it.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Configure Manual DNS</h4>
                    <p className="text-sm text-slate-400">
                      Set your DNS servers manually to privacy-focused providers like Cloudflare (1.1.1.1),
                      Quad9 (9.9.9.9), or your VPN's DNS servers. This provides a fallback if VPN DNS fails.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Understanding Your Results
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Result</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">What It Means</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4 text-emerald-400">VPN DNS Only</td>
                        <td className="py-3 px-4">All queries go through your VPN</td>
                        <td className="py-3 px-4">You're protected!</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4 text-amber-400">Mixed DNS</td>
                        <td className="py-3 px-4">Some queries leak to other servers</td>
                        <td className="py-3 px-4">Check VPN settings</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-rose-400">ISP DNS Detected</td>
                        <td className="py-3 px-4">Your ISP sees your browsing</td>
                        <td className="py-3 px-4">Fix immediately</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">
                  Complete Your Privacy Check
                </h3>
                <p>
                  DNS leaks are just one way your privacy can be compromised. Test these other vulnerabilities:
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Link href="/tests/ip-leak" className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors">
                    <Globe className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">IP Leak Test</div>
                      <div className="text-xs text-slate-500">Check for IP exposure</div>
                    </div>
                  </Link>
                  <Link href="/tests/webrtc-leak" className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors">
                    <Activity className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">WebRTC Leak Test</div>
                      <div className="text-xs text-slate-500">Test WebRTC vulnerabilities</div>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 pt-4">
                <p>
                  Questions about your results? Contact us at{' '}
                  <a href="mailto:privacy@browserleaks.io" className="text-cyan-400 hover:text-cyan-300">
                    privacy@browserleaks.io
                  </a>
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
