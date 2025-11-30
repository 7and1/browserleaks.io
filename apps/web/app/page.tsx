import Link from 'next/link';
import {
  Shield,
  Fingerprint,
  Globe,
  Cpu,
  Activity,
  Zap,
  Lock,
  Eye,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export async function generateMetadata() {
  return {
    title: 'BrowserLeaks.io - Free Browser Privacy & Fingerprint Test | Check IP, DNS, WebRTC Leaks',
    description: 'Test your browser for privacy leaks and fingerprinting vulnerabilities. Free IP leak test, DNS leak test, WebRTC leak detection, and browser fingerprint analysis. 83.6% of browsers have unique fingerprints - check yours now.',
    keywords: ['browser privacy test', 'fingerprint test', 'IP leak test', 'DNS leak test', 'WebRTC leak', 'browser fingerprint', 'online privacy', 'VPN test', 'privacy check', 'tracking protection'],
    openGraph: {
      title: 'BrowserLeaks.io - Free Browser Privacy & Fingerprint Test',
      description: 'Test your browser for privacy leaks and fingerprint uniqueness. 83.6% of browsers can be uniquely identified. Check yours free.',
      type: 'website',
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'BrowserLeaks.io - Free Browser Privacy Test',
      description: 'Test your browser for privacy leaks and fingerprinting. Free & instant.',
    },
    alternates: {
      canonical: 'https://browserleaks.io',
    },
  };
}

const quickTests = [
  {
    title: 'IP Leak Test',
    href: '/tests/ip-leak',
    icon: Globe,
    description: 'Detect if your real IP address is exposed through HTTP, DNS, or WebRTC',
    status: 'critical',
  },
  {
    title: 'DNS Leak Test',
    href: '/tests/dns-leak',
    icon: Shield,
    description: 'Check if your DNS queries are being routed through your VPN or proxy',
    status: 'warning',
  },
  {
    title: 'WebRTC Leak Test',
    href: '/tests/webrtc-leak',
    icon: Activity,
    description: 'Discover WebRTC vulnerabilities that can expose your local and public IPs',
    status: 'safe',
  },
];

const labs = [
  {
    title: 'Identity Lab',
    href: '/fingerprints',
    icon: Fingerprint,
    description: 'Canvas, WebGL, Fonts, Audio fingerprinting analysis',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
    iconColor: 'text-cyan-400',
  },
  {
    title: 'Network Lab',
    href: '/network',
    icon: Globe,
    description: 'HTTP headers, TLS/JA3, WebRTC, IP & DNS analysis',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    title: 'Hardware Lab',
    href: '/hardware',
    icon: Cpu,
    description: 'GPU, Battery, Motion sensors, Audio context detection',
    gradient: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30',
    iconColor: 'text-violet-400',
  },
  {
    title: 'Modern API Lab',
    href: '/modern-apis',
    icon: Zap,
    description: 'Bluetooth, USB, MIDI, Clipboard API exposure testing',
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    iconColor: 'text-amber-400',
  },
];

const features = [
  {
    icon: Eye,
    title: '30+ Detection Tests',
    description: 'Comprehensive analysis of IP leaks, browser fingerprints, and privacy vulnerabilities',
  },
  {
    icon: Lock,
    title: '100% Client-Side',
    description: 'All fingerprinting tests run locally in your browser. No data sent to our servers.',
  },
  {
    icon: Zap,
    title: 'Real-Time Results',
    description: 'Instant feedback with detailed explanations and privacy recommendations',
  },
  {
    icon: Shield,
    title: 'Free Forever',
    description: 'No registration, no limits, no premium tiers. Privacy testing for everyone.',
  },
];

const stats = [
  { value: '83.6%', label: 'Browsers Have Unique Fingerprints', source: 'EFF Study' },
  { value: '23%', label: 'VPNs Leak WebRTC IP Addresses', source: 'Security Research' },
  { value: '10K+', label: 'Sites Use Fingerprinting', source: 'Web Privacy Study' },
  { value: '3B+', label: 'Devices Use WebRTC', source: 'Industry Data' },
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'BrowserLeaks.io',
            description: 'Comprehensive browser privacy detection, fingerprint testing, and leak analysis platform.',
            url: 'https://browserleaks.io',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            provider: {
              '@type': 'Organization',
              name: 'BrowserLeaks.io',
              url: 'https://browserleaks.io',
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Modern Privacy Testing Lab</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-slate-100">Free Browser Privacy Test: </span>
              <span className="gradient-text">Check What Your Browser Reveals</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Comprehensive privacy testing for IP leaks, DNS leaks, WebRTC vulnerabilities,
              and browser fingerprinting. Free, instant, and completely client-side.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary w-full sm:w-auto group">
                <Shield className="h-5 w-5" />
                <span>Start Full Privacy Scan</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="#quick-tests" className="btn-secondary w-full sm:w-auto">
                Quick Tests
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>No registration required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>100% free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Client-side processing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 border-y border-slate-800/50 bg-slate-900/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
                <div className="mt-0.5 text-xs text-slate-600">{stat.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tests Section */}
      <section id="quick-tests" className="relative px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400 mb-4">
              Quick Tests
            </h2>
            <p className="text-2xl sm:text-3xl font-semibold text-slate-100">
              Essential Privacy Leak Detection
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {quickTests.map((test) => {
              const Icon = test.icon;
              const statusConfig = {
                critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'High Risk' },
                warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Medium Risk' },
                safe: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Check Status' },
              }[test.status];

              return (
                <Link
                  key={test.title}
                  href={test.href}
                  className="group lab-panel p-6 transition-all hover:shadow-lab-glow-cyan hover:border-cyan-500/40"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${statusConfig.bg} ${statusConfig.border} border`}>
                      <Icon className={`h-6 w-6 ${statusConfig.color}`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {test.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Run Test</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Labs Section */}
      <section id="labs" className="relative px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-slate-800/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400 mb-4">
              Testing Labs
            </h2>
            <p className="text-2xl sm:text-3xl font-semibold text-slate-100">
              Deep Dive Into Browser Privacy
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {labs.map((lab) => {
              const Icon = lab.icon;
              return (
                <Link
                  key={lab.title}
                  href={lab.href}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${lab.gradient} border ${lab.borderColor} p-8 transition-all hover:shadow-xl`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900/50 border ${lab.borderColor} mb-6`}>
                      <Icon className={`h-7 w-7 ${lab.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-2">{lab.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{lab.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                      <span>Enter Lab</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-slate-800/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400 mb-4">
              Why BrowserLeaks.io
            </h2>
            <p className="text-2xl sm:text-3xl font-semibold text-slate-100">
              Privacy Testing Done Right
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-4">
                    <Icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Educational Content Section - SEO Rich Content */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-slate-800/50">
        <div className="mx-auto max-w-4xl">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-8 text-center">
              Understanding Browser Privacy: What Every Internet User Needs to Know
            </h2>

            <div className="space-y-8 text-slate-300 leading-relaxed">
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  The Privacy Problem Nobody Talks About
                </h3>
                <p>
                  Look, here's the deal. Every time you open a web browser, you're basically walking into a room with a
                  giant neon sign above your head. That sign? It's broadcasting your digital identity to everyone watching.
                </p>
                <p className="mt-4">
                  According to the <a href="https://www.eff.org/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Electronic Frontier Foundation's</a> landmark
                  research, <strong className="text-white">83.6% of browsers have unique fingerprints</strong>. That means
                  if you're reading this right now, there's about an 84% chance that websites can identify you specifically -
                  not just your device, but YOU - without using a single cookie.
                </p>
                <p className="mt-4">
                  And if you've got Flash or Java enabled? That number jumps to <strong className="text-white">94.2%</strong>.
                  That's not a typo. Ninety-four percent.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  The Numbers That Should Wake You Up
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Privacy Threat</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Impact</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Source</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Unique Browser Fingerprints</td>
                        <td className="py-3 px-4 text-rose-400 font-semibold">83.6%</td>
                        <td className="py-3 px-4 text-slate-500">EFF Panopticlick</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">VPNs with WebRTC Leaks</td>
                        <td className="py-3 px-4 text-amber-400 font-semibold">23%</td>
                        <td className="py-3 px-4 text-slate-500">Paolo Stagno Research</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">VPNs with DNS Leaks</td>
                        <td className="py-3 px-4 text-amber-400 font-semibold">21%</td>
                        <td className="py-3 px-4 text-slate-500">TheBestVPN Study</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Top Sites Using Fingerprinting</td>
                        <td className="py-3 px-4 text-rose-400 font-semibold">10,000+</td>
                        <td className="py-3 px-4 text-slate-500">Web Privacy Research</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Free Android VPNs with Leaks</td>
                        <td className="py-3 px-4 text-amber-400 font-semibold">18%</td>
                        <td className="py-3 px-4 text-slate-500">Top10VPN Analysis</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Devices Using WebRTC</td>
                        <td className="py-3 px-4 text-cyan-400 font-semibold">3 Billion+</td>
                        <td className="py-3 px-4 text-slate-500">Industry Statistics</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  What is Browser Fingerprinting? (Explained Like You're 10)
                </h3>
                <p>
                  Imagine you're at school, and everyone's wearing the same uniform. You'd think nobody could tell
                  you apart, right? Wrong.
                </p>
                <p className="mt-4">
                  Your teacher notices that you have blue shoelaces, a specific brand of backpack, you sit in a
                  particular way, you write with your left hand, and your pencil case has that one sticker on it.
                  Put all those tiny details together, and suddenly you're completely identifiable.
                </p>
                <p className="mt-4">
                  <strong className="text-white">Browser fingerprinting works exactly the same way.</strong>
                </p>
                <p className="mt-4">
                  Websites collect dozens of tiny data points about your browser: your screen size, installed fonts,
                  graphics card capabilities, timezone, language settings, and much more. Individually, these details
                  are meaningless. Combined? They create a fingerprint that's often more unique than an actual fingerprint.
                </p>
                <p className="mt-4">
                  Research from <a href="https://amiunique.org/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">AmIUnique.org</a> shows
                  that <strong className="text-white">99.24% of users can be uniquely identified</strong> when combining
                  browser and device fingerprints. The cookies you've been deleting? They were just the tip of the iceberg.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  IP Leaks: Your Digital Home Address
                </h3>
                <p>
                  Your IP address is like your home address on the internet. When you use a VPN or proxy, you're
                  essentially asking someone else to receive your mail and forward it to you, keeping your real
                  address hidden.
                </p>
                <p className="mt-4">
                  But here's the problem: <strong className="text-white">IP leaks happen more often than you think.</strong>
                </p>
                <p className="mt-4">
                  There are three main ways your IP can leak:
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-slate-400">
                  <li><strong className="text-slate-200">WebRTC Leaks</strong> - Your browser's real-time communication feature can bypass VPNs</li>
                  <li><strong className="text-slate-200">DNS Leaks</strong> - Your DNS queries go to your ISP instead of your VPN</li>
                  <li><strong className="text-slate-200">IPv6 Leaks</strong> - Your VPN only protects IPv4, leaving IPv6 exposed</li>
                </ul>
                <p className="mt-4">
                  Network security researcher Paolo Stagno tested 70 VPN providers and found that
                  <strong className="text-white"> 16 of them (23%) leaked users' IP addresses through WebRTC</strong>.
                  That means nearly 1 in 4 VPNs tested couldn't do the one job they promised to do.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  DNS Leaks: The Silent Privacy Killer
                </h3>
                <p>
                  Every time you type a website name, your device asks a DNS server "Hey, what's the IP address for
                  this website?" It's like asking for directions.
                </p>
                <p className="mt-4">
                  When you're using a VPN, those questions should go through the VPN's DNS servers. But sometimes
                  they don't. Sometimes they go straight to your ISP - and your ISP keeps records of every single
                  website you visit.
                </p>
                <p className="mt-4">
                  A comprehensive study testing 74 VPN services found that <strong className="text-white">15 of them
                  (21%) were leaking DNS data</strong>. That's over one in five VPNs failing at basic privacy protection.
                </p>
                <p className="mt-4">
                  Even worse? <a href="https://www.expressvpn.com/blog/audit-report-research-paper-windows-dns-leaks/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">ExpressVPN's 2024 audit</a> discovered
                  what appears to be an industry-wide issue - a serious flaw in how DNS leaks are tested. Many VPN
                  providers might not even know they have a problem.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  2025 Update: Google Changes Everything
                </h3>
                <p>
                  Here's something wild that just happened. On December 19, 2024, Google announced that starting
                  February 16, 2025, they will <strong className="text-white">allow their advertising customers to
                  use fingerprinting techniques</strong>.
                </p>
                <p className="mt-4">
                  For years, Google prohibited fingerprinting in their advertising network. Now? The floodgates are
                  opening. The UK's Information Commissioner's Office (ICO) sharply criticized this decision, but
                  it's happening anyway.
                </p>
                <p className="mt-4">
                  Research from <a href="https://engineering.tamu.edu/news/2025/06/websites-are-tracking-you-via-browser-fingerprinting.html" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Texas A&M University</a> (2025)
                  confirms what privacy advocates have been saying: websites are covertly using browser fingerprinting
                  to track people across sessions and sites. Their study found strong evidence that fingerprinting can
                  <strong className="text-white"> bypass GDPR and CCPA opt-outs</strong>, enabling privacy-invasive
                  tracking even when you've explicitly said "no."
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Why Should You Care?
                </h3>
                <p>
                  "I have nothing to hide" - I hear this all the time. But privacy isn't about hiding. It's about control.
                </p>
                <p className="mt-4">
                  When companies can track you across the entire internet, they build profiles about you. These profiles
                  determine what prices you see, what news you read, what job ads appear in your feed, and what insurance
                  rates you're offered.
                </p>
                <p className="mt-4">
                  A study found that <strong className="text-white">over 70% of people are concerned about fingerprinting
                  and tracking</strong>, yet only 43% understand how it works. That gap between concern and understanding
                  is exactly what tracking companies exploit.
                </p>
                <p className="mt-4">
                  The financial impact of data breaches reached record highs in 2024. Your browser data, combined with
                  other leaked information, makes you a target for sophisticated phishing, social engineering, and identity theft.
                </p>
              </div>

              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  How BrowserLeaks.io Helps You
                </h3>
                <p>
                  We built BrowserLeaks.io because everyone deserves to know what their browser reveals. Here's what
                  makes us different:
                </p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">100% Client-Side</strong> - All tests run in your browser. We never see your data.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">30+ Detection Tests</strong> - IP leaks, DNS leaks, WebRTC, canvas fingerprint, WebGL, audio, fonts, and more.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">Free Forever</strong> - No registration, no premium tiers, no data collection. Privacy testing should be free.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong className="text-slate-200">Real Explanations</strong> - We don't just show you numbers. We explain what they mean and how to protect yourself.</span>
                  </li>
                </ul>
              </div>

              <div className="lab-panel p-6 lg:p-8 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">
                  Ready to See What Your Browser Reveals?
                </h3>
                <p>
                  Knowledge is power. The first step to protecting your privacy is understanding exactly what you're
                  exposing. Our comprehensive privacy scan takes less than 30 seconds and shows you everything - the
                  good, the bad, and the scary.
                </p>
                <div className="mt-6">
                  <Link href="/dashboard" className="btn-primary inline-flex">
                    <Shield className="h-5 w-5" />
                    <span>Start Your Free Privacy Scan</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 pt-4">
                <p>
                  Questions or feedback? Contact us at{' '}
                  <a href="mailto:privacy@browserleaks.io" className="text-cyan-400 hover:text-cyan-300">
                    privacy@browserleaks.io
                  </a>
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Privacy Alert Banner */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="lab-panel p-8 lg:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
            <div className="relative">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-6">
                <ShieldAlert className="h-8 w-8 text-amber-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">
                Your Browser is Talking
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
                Every website you visit can potentially collect dozens of data points about you.
                From your IP address to your hardware configuration, your browser reveals more than you think.
              </p>
              <Link href="/dashboard" className="btn-primary inline-flex">
                <Shield className="h-5 w-5" />
                <span>See What You're Exposing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
