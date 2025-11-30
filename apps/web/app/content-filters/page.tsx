'use client';

import Link from 'next/link';
import { LabShell } from '@/components/layout/LabShell';

const shieldTests = [
  {
    id: 'adblock',
    title: 'Ad Blocker Detection',
    description: 'Detect ad blockers, their aggressiveness level, and which filter lists are active.',
    href: '/content-filters/adblock',
    icon: '🛡️',
    riskLabel: 'Detection Risk',
  },
  {
    id: 'tracker',
    title: 'Tracker Blocker Test',
    description: 'Test which tracking scripts and analytics are blocked by your browser or extensions.',
    href: '/content-filters/tracker',
    icon: '🔍',
    riskLabel: 'Tracking Protection',
  },
  {
    id: 'cms',
    title: 'CMS & Framework Detection',
    description: 'Detect content management systems, JavaScript frameworks, and server technologies.',
    href: '/content-filters/cms',
    icon: '🏗️',
    riskLabel: 'Tech Fingerprint',
  },
];

const statusReadings = [
  { label: 'Tests', value: '3', tone: 'active' as const },
  { label: 'Category', value: 'SHIELD', tone: 'neutral' as const },
  { label: 'Focus', value: 'DETECTION', tone: 'alert' as const },
];

export default function ShieldLabPage() {
  return (
    <LabShell statusReadings={statusReadings}>
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Shield Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Content Filter Detection</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Test your browser&apos;s content filtering capabilities and understand how websites detect
            and fingerprint your ad blockers, tracker blockers, and browsing protection tools.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shieldTests.map((test) => (
            <Link
              key={test.id}
              href={test.href}
              className="lab-panel p-6 group hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{test.icon}</span>
                <span className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded">
                  {test.riskLabel}
                </span>
              </div>
              <h3 className="text-lg font-medium text-slate-100 group-hover:text-cyan-300 transition-colors">
                {test.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {test.description}
              </p>
              <div className="mt-4 flex items-center text-xs text-cyan-400 group-hover:text-cyan-300">
                <span>Run Test</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            The Shield Lab: Understanding Content Filter Detection
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Welcome to the Shield Lab. This is where privacy meets counter-surveillance. Every day,
              millions of users install ad blockers and privacy extensions to protect themselves online.
              But here&apos;s the thing most people don&apos;t realize: the very tools you use to protect your
              privacy can actually make you more identifiable.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Ad Blocker Paradox</h3>
            <p>
              Think about it. If 30% of internet users have ad blockers, and you&apos;re using uBlock Origin
              with custom filter lists, you&apos;ve just narrowed yourself down to maybe 2% of users. Add in
              which specific rules you have enabled, and you might be in a group of 0.1%.
            </p>
            <p>
              This is what I call the &quot;privacy tool fingerprint&quot; — the ironic situation where your
              privacy protection becomes a unique identifier. It&apos;s like wearing a distinctive hat to
              avoid being recognized — now you&apos;re just &quot;the person with the weird hat.&quot;
            </p>

            <h3 className="text-xl text-slate-200 mt-8">How Detection Works</h3>
            <p>
              Websites have gotten incredibly sophisticated at detecting content blockers. Here&apos;s the playbook:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Bait Elements</h4>
                <p className="text-sm">
                  Create elements with class names like &quot;ad-banner&quot; or &quot;sponsored-content&quot;.
                  If they disappear or have zero dimensions, an ad blocker is active.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Script Loading</h4>
                <p className="text-sm">
                  Attempt to load known ad scripts (Google Ads, Facebook Pixel). Monitor the
                  load/error events to detect blocking.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Filter List Detection</h4>
                <p className="text-sm">
                  Each filter list has unique rules. By testing specific elements, sites can
                  identify exactly which lists you use.
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Timing Analysis</h4>
                <p className="text-sm">
                  Measure how long elements take to load or fail. Different blockers have
                  different timing signatures.
                </p>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">What the Tests Reveal</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Test</th>
                  <th className="text-left py-2 text-slate-300">What It Detects</th>
                  <th className="text-left py-2 text-slate-300">Privacy Impact</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Ad Blocker</td>
                  <td className="py-2">Blocker presence, type, filter lists</td>
                  <td className="py-2 text-orange-400">Medium-High</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Tracker Blocker</td>
                  <td className="py-2">Analytics blocking, social widget blocking</td>
                  <td className="py-2 text-orange-400">Medium</td>
                </tr>
                <tr>
                  <td className="py-2">CMS Detection</td>
                  <td className="py-2">Server tech, frameworks (reverse fingerprint)</td>
                  <td className="py-2 text-cyan-400">Low (server-side)</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">The Numbers Don&apos;t Lie</h3>
            <p>
              According to recent industry data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">42.7%</strong> of internet users worldwide use ad blockers (2024)</li>
              <li><strong className="text-slate-300">80%+</strong> of major publishers actively detect ad blockers</li>
              <li><strong className="text-slate-300">$78 billion</strong> in blocked ad revenue annually</li>
              <li><strong className="text-slate-300">uBlock Origin</strong> alone has 40+ million users</li>
              <li>But only <strong className="text-slate-300">3-5%</strong> use custom filter configurations</li>
            </ul>
            <p>
              That last stat is crucial. If you&apos;ve customized your blocker beyond defaults, you&apos;re
              in a much smaller, more identifiable group.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Defense Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use default configurations</strong> — Custom filter
                lists make you unique. Stick to EasyList and the popular defaults.
              </li>
              <li>
                <strong className="text-slate-300">Consider not blocking detection scripts</strong> —
                Some anti-adblock scripts are harmless. Blocking them just confirms you have a blocker.
              </li>
              <li>
                <strong className="text-slate-300">Use privacy-focused browsers</strong> — Brave and
                Firefox have built-in blocking that&apos;s less detectable than extensions.
              </li>
              <li>
                <strong className="text-slate-300">Network-level blocking</strong> — Pi-hole or
                NextDNS blocks ads at the DNS level, making detection much harder.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Ad blockers protect you but can also fingerprint you</li>
                <li>Custom configurations make you more unique, not more private</li>
                <li>Detection methods are sophisticated and constantly evolving</li>
                <li>Network-level blocking is harder to detect than browser extensions</li>
                <li>The best privacy comes from blending in, not standing out</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}
