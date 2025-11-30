import { WebRTCLeakTest } from '@/components/leak-tests/WebRTCLeakTest';
import Link from 'next/link';
import {
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
  Globe,
  Server,
  Video,
  Wifi,
} from 'lucide-react';

export async function generateMetadata() {
  return {
    title: 'Free WebRTC Leak Test - Check If WebRTC Is Exposing Your Real IP',
    description: 'Test for WebRTC IP leaks that bypass your VPN. 23% of VPNs have WebRTC vulnerabilities. Our free test detects STUN/TURN leaks exposing your local and public IP addresses.',
    keywords: ['WebRTC leak test', 'WebRTC IP leak', 'STUN leak', 'VPN WebRTC', 'browser leak test', 'WebRTC security', 'IP leak prevention', 'VPN test'],
    openGraph: {
      title: 'Free WebRTC Leak Test - Is WebRTC Bypassing Your VPN?',
      description: '23% of VPNs leak your IP through WebRTC. Free instant test to check if your real IP is exposed.',
      type: 'website',
      images: ['/og-webrtc-leak.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'WebRTC Leak Test - Protect Your VPN Privacy',
      description: 'Free test to check if WebRTC is leaking your real IP address.',
    },
    alternates: {
      canonical: 'https://browserleaks.io/tests/webrtc-leak',
    },
  };
}

export default function WebRTCLeakPage() {
  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'WebRTC Leak Test',
            description: 'Free tool to test if WebRTC is leaking your real IP address, bypassing your VPN or proxy.',
            url: 'https://browserleaks.io/tests/webrtc-leak',
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
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 mb-4">
              <Activity className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">WebRTC Security Check</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100">
              Free WebRTC Leak Test
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Check if WebRTC is bypassing your VPN and exposing your real IP
            </p>
          </div>
        </div>
      </section>

      {/* Test Component */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <WebRTCLeakTest />
        </div>
      </section>

      {/* Educational Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/50">
        <div className="mx-auto max-w-4xl">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-8 text-center">
              WebRTC Leaks: The VPN Killer You Didn't Know About
            </h2>

            <div className="space-y-8 text-slate-300 leading-relaxed">
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  What is WebRTC?
                </h3>
                <p>
                  WebRTC (Web Real-Time Communication) is a technology built into your browser that enables
                  video calls, voice chat, and file sharing without any plugins. It's what makes Zoom, Google Meet,
                  Discord, and countless other apps work directly in your browser.
                </p>
                <p className="mt-4">
                  Sounds great, right? Here's the catch: <strong className="text-white">WebRTC needs to know your
                  real IP address to establish peer-to-peer connections</strong>. And it's really good at finding it -
                  even when you're using a VPN.
                </p>
                <p className="mt-4">
                  This vulnerability was discovered in 2015, and <strong className="text-white">over 3 billion devices
                  worldwide</strong> are potentially affected because WebRTC is enabled by default in Chrome, Firefox,
                  Edge, and Safari.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Why WebRTC Leaks Are So Dangerous
                </h3>
                <p>
                  Here's what makes WebRTC leaks particularly nasty: they happen at the browser level, completely
                  bypassing your VPN's network protection.
                </p>
                <p className="mt-4">
                  Security researcher Paolo Stagno tested 70 VPN providers and found that
                  <strong className="text-white"> 16 of them (23%) leaked users' IP addresses through WebRTC</strong>.
                  That's nearly 1 in 4 "protected" users who think they're anonymous but aren't.
                </p>
                <p className="mt-4">
                  For free VPN users, it's even worse. A study of free Android VPNs found that
                  <strong className="text-white"> 18% had WebRTC leaks</strong> - and that's just one of many
                  vulnerabilities they found.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  How WebRTC Leaks Work (Technical Details)
                </h3>
                <p>
                  WebRTC uses something called ICE (Interactive Connectivity Establishment) to discover the best
                  path between two devices. This process involves:
                </p>

                <div className="space-y-4 mt-4">
                  <div className="border-l-2 border-cyan-500/50 pl-4">
                    <h4 className="font-semibold text-cyan-400">STUN Servers</h4>
                    <p className="mt-2 text-sm">
                      Session Traversal Utilities for NAT (STUN) servers help discover your public IP address.
                      When WebRTC contacts a STUN server, it can reveal your real IP - even through a VPN.
                    </p>
                  </div>

                  <div className="border-l-2 border-violet-500/50 pl-4">
                    <h4 className="font-semibold text-violet-400">TURN Servers</h4>
                    <p className="mt-2 text-sm">
                      Traversal Using Relays around NAT (TURN) servers relay traffic when direct connections fail.
                      These can also expose connection metadata.
                    </p>
                  </div>

                  <div className="border-l-2 border-rose-500/50 pl-4">
                    <h4 className="font-semibold text-rose-400">Local IP Discovery</h4>
                    <p className="mt-2 text-sm">
                      WebRTC can enumerate your local network interfaces, potentially revealing your
                      private IP address (like 192.168.x.x) and your local network structure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  What WebRTC Can Reveal About You
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Information</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Risk Level</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Real Public IP Address</td>
                        <td className="py-3 px-4 text-rose-400 font-semibold">Critical</td>
                        <td className="py-3 px-4">Completely defeats VPN protection</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Local/Private IP Address</td>
                        <td className="py-3 px-4 text-amber-400 font-semibold">High</td>
                        <td className="py-3 px-4">Reveals network structure</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">ISP Information</td>
                        <td className="py-3 px-4 text-amber-400 font-semibold">High</td>
                        <td className="py-3 px-4">Links activity to your account</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Geographic Location</td>
                        <td className="py-3 px-4 text-amber-400 font-semibold">High</td>
                        <td className="py-3 px-4">City-level accuracy</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Media Devices</td>
                        <td className="py-3 px-4 text-slate-400">Low</td>
                        <td className="py-3 px-4">Fingerprinting data</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  How Our WebRTC Leak Test Works
                </h3>
                <p>
                  Our test thoroughly probes your browser's WebRTC capabilities:
                </p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">STUN Server Probing</strong> - We use multiple STUN servers to detect your public IP address through WebRTC</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">Local IP Detection</strong> - We enumerate local network interfaces to find private IP addresses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">ICE Candidate Analysis</strong> - We analyze all ICE candidates to find every possible IP exposure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">VPN Comparison</strong> - We compare WebRTC IPs with your VPN IP to detect mismatches</span>
                  </li>
                </ul>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  How to Fix WebRTC Leaks
                </h3>
                <p>
                  Good news: WebRTC leaks can be completely prevented. Here's how:
                </p>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Firefox (Recommended - Complete Disable)</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>1. Type <code className="text-cyan-400">about:config</code> in the address bar</li>
                      <li>2. Search for <code className="text-cyan-400">media.peerconnection.enabled</code></li>
                      <li>3. Double-click to set it to <code className="text-cyan-400">false</code></li>
                      <li>4. Video calls will stop working, but you'll have full protection</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Chrome / Edge (Extension Required)</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• Install "WebRTC Leak Prevent" or "WebRTC Control" extension</li>
                      <li>• Chrome doesn't allow disabling WebRTC without an extension</li>
                      <li>• Extensions can limit WebRTC to only use your VPN IP</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">Safari</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>1. Open Safari → Preferences → Advanced</li>
                      <li>2. Check "Show Develop menu in menu bar"</li>
                      <li>3. Develop menu → Experimental Features → disable WebRTC</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">VPN-Level Protection</h4>
                    <p className="text-sm text-slate-400">
                      Many premium VPNs now include WebRTC leak protection. Check your VPN's settings
                      for options like "WebRTC Leak Protection" or "Prevent WebRTC Leaks".
                    </p>
                  </div>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Trade-offs to Consider
                </h3>
                <p>
                  Disabling WebRTC completely will break some features:
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-slate-400">
                  <li><strong className="text-slate-200">Video conferencing</strong> - Zoom, Google Meet, Jitsi won't work in-browser</li>
                  <li><strong className="text-slate-200">Voice chat</strong> - Discord web, Slack calls may have issues</li>
                  <li><strong className="text-slate-200">File sharing</strong> - Some P2P file transfer sites won't work</li>
                  <li><strong className="text-slate-200">Online gaming</strong> - Browser-based games with voice chat</li>
                </ul>
                <p className="mt-4">
                  The middle ground? Use browser extensions that only enable WebRTC for trusted sites,
                  or use a separate browser for video calls.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">
                  Complete Your Security Check
                </h3>
                <p>
                  WebRTC is just one attack vector. Make sure to test these other vulnerabilities:
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Link href="/tests/ip-leak" className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors">
                    <Globe className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">IP Leak Test</div>
                      <div className="text-xs text-slate-500">Full IP exposure check</div>
                    </div>
                  </Link>
                  <Link href="/tests/dns-leak" className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors">
                    <Server className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">DNS Leak Test</div>
                      <div className="text-xs text-slate-500">Check DNS query privacy</div>
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
