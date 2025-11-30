import { IPLeakTest } from '@/components/leak-tests/IPLeakTest';
import Link from 'next/link';
import {
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Eye,
  Lock,
  Wifi,
  Server,
  MapPin,
} from 'lucide-react';

export async function generateMetadata() {
  return {
    title: 'Free IP Leak Test - Check If Your VPN Is Leaking Your Real IP Address',
    description: 'Test your VPN for IP leaks instantly. Our free IP leak test detects WebRTC leaks, DNS leaks, and IPv6 leaks that expose your real IP address. 23% of VPNs leak IP addresses - check yours now.',
    keywords: ['IP leak test', 'VPN leak test', 'check my IP', 'WebRTC leak', 'DNS leak', 'IPv6 leak', 'VPN test', 'IP address checker', 'privacy test'],
    openGraph: {
      title: 'Free IP Leak Test - Is Your VPN Exposing Your Real IP?',
      description: 'Instant IP leak detection for VPN users. Test for WebRTC, DNS, and IPv6 leaks. 23% of VPNs fail this test.',
      type: 'website',
      images: ['/og-ip-leak.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'IP Leak Test - Check Your VPN Security',
      description: 'Free instant test to see if your VPN is leaking your real IP address.',
    },
    alternates: {
      canonical: 'https://browserleaks.io/tests/ip-leak',
    },
  };
}

export default function IPLeakPage() {
  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'IP Leak Test',
            description: 'Free tool to test if your VPN is leaking your real IP address through WebRTC, DNS, or IPv6.',
            url: 'https://browserleaks.io/tests/ip-leak',
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
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 mb-4">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-sm font-medium text-rose-300">Critical Privacy Test</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100">
              Free IP Leak Test
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Check if your VPN or proxy is actually hiding your real IP address
            </p>
          </div>
        </div>
      </section>

      {/* Test Component */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <IPLeakTest />
        </div>
      </section>

      {/* Educational Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/50">
        <div className="mx-auto max-w-4xl">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-8 text-center">
              What is an IP Leak and Why Should You Care?
            </h2>

            <div className="space-y-8 text-slate-300 leading-relaxed">
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Your IP Address: The Digital ID You Can't Hide
                </h3>
                <p>
                  Think of your IP address like your home address on the internet. Every time you visit a website,
                  you're essentially telling them exactly where you live in the digital world. Your IP reveals your:
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-slate-400">
                  <li><strong className="text-slate-200">Geographic location</strong> - Often accurate to your city or neighborhood</li>
                  <li><strong className="text-slate-200">Internet Service Provider</strong> - Who provides your internet connection</li>
                  <li><strong className="text-slate-200">Network type</strong> - Home, business, mobile, or data center</li>
                  <li><strong className="text-slate-200">Connection history</strong> - Your ISP logs every site you visit</li>
                </ul>
                <p className="mt-4">
                  This is exactly why millions of people use VPNs - to mask their real IP address. But here's the
                  scary part: <strong className="text-white">not all VPNs actually work</strong>.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  The Three Types of IP Leaks
                </h3>

                <div className="space-y-6 mt-4">
                  <div className="border-l-2 border-rose-500/50 pl-4">
                    <h4 className="font-semibold text-rose-400">1. WebRTC Leaks (Most Common)</h4>
                    <p className="mt-2 text-sm">
                      WebRTC is a browser technology used for video calls and real-time communication. The problem?
                      It can bypass your VPN entirely and expose your real IP address directly to websites.
                    </p>
                    <p className="mt-2 text-sm">
                      Security researcher Paolo Stagno tested 70 VPNs and found <strong className="text-white">23% had WebRTC leaks</strong>.
                      That's nearly 1 in 4 VPNs failing at their primary job.
                    </p>
                  </div>

                  <div className="border-l-2 border-amber-500/50 pl-4">
                    <h4 className="font-semibold text-amber-400">2. DNS Leaks</h4>
                    <p className="mt-2 text-sm">
                      When you type a website name, your device asks a DNS server for the actual address. If your VPN
                      isn't configured properly, these requests go to your ISP instead - revealing every site you visit.
                    </p>
                    <p className="mt-2 text-sm">
                      Studies show <strong className="text-white">21% of VPNs leak DNS requests</strong>, even when they
                      claim to have DNS leak protection.
                    </p>
                  </div>

                  <div className="border-l-2 border-violet-500/50 pl-4">
                    <h4 className="font-semibold text-violet-400">3. IPv6 Leaks</h4>
                    <p className="mt-2 text-sm">
                      Many VPNs only protect IPv4 traffic. If your network supports IPv6 (and most do now), your
                      real IPv6 address can leak out while you think you're protected.
                    </p>
                    <p className="mt-2 text-sm">
                      This is particularly dangerous because most users don't even know they have an IPv6 address.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  What Can Websites See From Your IP?
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Data Point</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Accuracy</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Country</td>
                        <td className="py-3 px-4">99%+</td>
                        <td className="py-3 px-4 text-amber-400">Medium</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">City/Region</td>
                        <td className="py-3 px-4">80-95%</td>
                        <td className="py-3 px-4 text-rose-400">High</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">ISP Identity</td>
                        <td className="py-3 px-4">99%+</td>
                        <td className="py-3 px-4 text-amber-400">Medium</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Connection Type</td>
                        <td className="py-3 px-4">95%+</td>
                        <td className="py-3 px-4 text-slate-400">Low</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Proxy/VPN Detection</td>
                        <td className="py-3 px-4">70-90%</td>
                        <td className="py-3 px-4 text-rose-400">High</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  How Our IP Leak Test Works
                </h3>
                <p>
                  Our test checks your connection through multiple methods to ensure your VPN is actually working:
                </p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">HTTP Request Detection</strong> - We check the IP address your browser sends with normal web requests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">WebRTC STUN Test</strong> - We probe WebRTC to detect if it's leaking your local or public IP</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">DNS Resolution Check</strong> - We verify which DNS servers are actually handling your requests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">IPv6 Detection</strong> - We check if IPv6 traffic is bypassing your VPN tunnel</span>
                  </li>
                </ul>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  How to Fix IP Leaks
                </h3>
                <p>
                  If our test found leaks, don't panic. Here's how to fix each type:
                </p>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Fix WebRTC Leaks</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• <strong>Firefox:</strong> Type <code className="text-cyan-400">about:config</code>, search for <code className="text-cyan-400">media.peerconnection.enabled</code>, set to <code className="text-cyan-400">false</code></li>
                      <li>• <strong>Chrome:</strong> Install a WebRTC blocking extension like "WebRTC Leak Prevent"</li>
                      <li>• <strong>VPN:</strong> Use a VPN with built-in WebRTC leak protection</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Fix DNS Leaks</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• Enable your VPN's DNS leak protection feature</li>
                      <li>• Manually configure DNS to use your VPN's DNS servers</li>
                      <li>• Use DNS over HTTPS (DoH) as a backup</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Fix IPv6 Leaks</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• Enable IPv6 leak protection in your VPN settings</li>
                      <li>• Disable IPv6 at the operating system level if not needed</li>
                      <li>• Use a VPN that properly routes IPv6 traffic</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">
                  Test Other Privacy Vulnerabilities
                </h3>
                <p>
                  IP leaks are just one piece of the puzzle. For complete privacy protection, you should also test:
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Link href="/tests/dns-leak" className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors">
                    <Server className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">DNS Leak Test</div>
                      <div className="text-xs text-slate-500">Check DNS query privacy</div>
                    </div>
                  </Link>
                  <Link href="/tests/webrtc-leak" className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors">
                    <Wifi className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">WebRTC Leak Test</div>
                      <div className="text-xs text-slate-500">Detailed WebRTC analysis</div>
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
