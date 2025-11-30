'use client';

import Link from 'next/link';
import { LabShell } from '@/components/layout/LabShell';

const utilityTools = [
  {
    id: 'password',
    title: 'Password Strength Analyzer',
    description: 'Calculate password entropy, crack time estimates, and get strength recommendations.',
    href: '/tools/password',
    icon: '🔐',
    category: 'Security',
  },
  {
    id: 'mac-lookup',
    title: 'MAC Address Lookup',
    description: 'Identify device manufacturers from MAC addresses and OUI prefixes.',
    href: '/tools/mac-lookup',
    icon: '📡',
    category: 'Network',
  },
  {
    id: 'javascript',
    title: 'JavaScript Engine Test',
    description: 'Test JavaScript engine features, ES version support, and runtime capabilities.',
    href: '/tools/javascript',
    icon: '⚡',
    category: 'Development',
  },
];

const statusReadings = [
  { label: 'Tools', value: '3', tone: 'active' as const },
  { label: 'Category', value: 'UTILITY', tone: 'neutral' as const },
  { label: 'Type', value: 'ANALYSIS', tone: 'active' as const },
];

export default function ToolsPage() {
  return (
    <LabShell statusReadings={statusReadings}>
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Utility Kit</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Developer & Security Tools</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            A collection of essential utilities for security analysis, network investigation,
            and development testing. No data leaves your browser — all processing happens locally.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {utilityTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="lab-panel p-6 group hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{tool.icon}</span>
                <span className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded">
                  {tool.category}
                </span>
              </div>
              <h3 className="text-lg font-medium text-slate-100 group-hover:text-cyan-300 transition-colors">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {tool.description}
              </p>
              <div className="mt-4 flex items-center text-xs text-cyan-400 group-hover:text-cyan-300">
                <span>Open Tool</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            The Utility Kit: Essential Tools for the Security-Conscious
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Welcome to the Utility Kit. These are the tools I wish existed when I started in
              security. Simple, powerful, and privacy-respecting — everything runs in your browser,
              nothing touches our servers.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Why Local Processing Matters</h3>
            <p>
              Every online tool that processes your data is a potential leak. When you paste a
              password into an online strength checker, you&apos;re trusting that service. When you
              look up a MAC address, you&apos;re revealing your network reconnaissance to the service
              provider.
            </p>
            <p>
              Our tools are different. Everything runs in your browser using JavaScript. Your
              passwords never leave your device. Your MAC lookups don&apos;t hit our servers. Check
              the network tab if you don&apos;t believe me — that&apos;s the kind of transparency I believe in.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Tool Overview</h3>
            <div className="grid md:grid-cols-3 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">🔐 Password Analyzer</h4>
                <p className="text-sm">
                  Real entropy calculation, not arbitrary rules. See exactly how long it would
                  take to crack your password with modern hardware.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">📡 MAC Lookup</h4>
                <p className="text-sm">
                  Identify device manufacturers from MAC addresses. Useful for network audits
                  and understanding your local network topology.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">⚡ JS Engine Test</h4>
                <p className="text-sm">
                  Test ECMAScript feature support, identify your JavaScript engine, and check
                  browser-specific capabilities.
                </p>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">The Tools You Need</h3>
            <p>
              I&apos;ve seen security professionals use dozens of different online services for basic
              tasks. Each one is a potential data collection point. Here&apos;s what each tool in our
              kit actually does:
            </p>

            <h4 className="text-lg text-slate-200 mt-6">Password Strength — Done Right</h4>
            <p>
              Forget those simplistic &quot;needs uppercase, lowercase, number, symbol&quot; rules.
              Real password security is about entropy — the mathematical unpredictability of
              your password. Our analyzer calculates:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">True entropy</strong> — bits of randomness, not arbitrary rules</li>
              <li><strong className="text-slate-300">Crack time estimates</strong> — based on real hardware benchmarks</li>
              <li><strong className="text-slate-300">Pattern detection</strong> — keyboard walks, dictionary words, sequences</li>
              <li><strong className="text-slate-300">Improvement suggestions</strong> — specific, actionable advice</li>
            </ul>

            <h4 className="text-lg text-slate-200 mt-6">MAC Address Intelligence</h4>
            <p>
              Every network interface has a MAC address. The first three octets (OUI) identify
              the manufacturer. This is incredibly useful for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Identifying unknown devices on your network</li>
              <li>Network security audits</li>
              <li>Detecting spoofed MAC addresses</li>
              <li>Understanding IoT device ecosystems</li>
            </ul>

            <h4 className="text-lg text-slate-200 mt-6">JavaScript Engine Fingerprinting</h4>
            <p>
              Different browsers implement JavaScript differently. These differences can be used
              for fingerprinting, but they&apos;re also useful for developers:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Check ES6+ feature support</li>
              <li>Identify your JavaScript engine (V8, SpiderMonkey, JavaScriptCore)</li>
              <li>Test WebAssembly and modern API support</li>
              <li>Debug compatibility issues</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Security Best Practices</h3>
            <p>
              Beyond individual tools, here are principles that should guide your security toolkit:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Trust but verify</strong> — Even these tools.
                Right-click, view source, check network requests.
              </li>
              <li>
                <strong className="text-slate-300">Local first</strong> — When possible, use tools
                that run entirely in your browser or on your machine.
              </li>
              <li>
                <strong className="text-slate-300">Open source preferred</strong> — If you can&apos;t
                see the code, you can&apos;t trust the tool.
              </li>
              <li>
                <strong className="text-slate-300">Minimal data exposure</strong> — Never paste
                real passwords into online tools (except ours, which are local).
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Principles</h4>
              <ul className="text-sm space-y-2">
                <li>All tools run locally in your browser</li>
                <li>No data transmitted to servers</li>
                <li>Open source and auditable</li>
                <li>Professional-grade accuracy</li>
                <li>Privacy-respecting by design</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}
