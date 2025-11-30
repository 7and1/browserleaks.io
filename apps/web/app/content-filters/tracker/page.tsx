'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface TrackerTest {
  name: string;
  category: 'analytics' | 'advertising' | 'social' | 'fingerprint';
  domain: string;
  blocked: boolean;
  description: string;
  company: string;
}

interface TrackerResult {
  totalTrackers: number;
  blockedTrackers: number;
  protectionLevel: 'none' | 'basic' | 'standard' | 'strict';
  categories: {
    analytics: { total: number; blocked: number };
    advertising: { total: number; blocked: number };
    social: { total: number; blocked: number };
    fingerprint: { total: number; blocked: number };
  };
  tests: TrackerTest[];
}

const TRACKER_TESTS: Omit<TrackerTest, 'blocked'>[] = [
  // Analytics
  { name: 'Google Analytics', category: 'analytics', domain: 'google-analytics.com', description: 'Website analytics and user behavior tracking', company: 'Google' },
  { name: 'Google Tag Manager', category: 'analytics', domain: 'googletagmanager.com', description: 'Tag management and analytics orchestration', company: 'Google' },
  { name: 'Hotjar', category: 'analytics', domain: 'hotjar.com', description: 'Heatmaps, session recording, surveys', company: 'Hotjar' },
  { name: 'Mixpanel', category: 'analytics', domain: 'mixpanel.com', description: 'Product analytics and user tracking', company: 'Mixpanel' },
  { name: 'Amplitude', category: 'analytics', domain: 'amplitude.com', description: 'Product analytics platform', company: 'Amplitude' },
  { name: 'Segment', category: 'analytics', domain: 'segment.io', description: 'Customer data platform', company: 'Twilio' },

  // Advertising
  { name: 'Google Ads', category: 'advertising', domain: 'googleadservices.com', description: 'Advertising and conversion tracking', company: 'Google' },
  { name: 'DoubleClick', category: 'advertising', domain: 'doubleclick.net', description: 'Ad serving and tracking', company: 'Google' },
  { name: 'Facebook Pixel', category: 'advertising', domain: 'facebook.com/tr', description: 'Ad targeting and conversion tracking', company: 'Meta' },
  { name: 'Criteo', category: 'advertising', domain: 'criteo.com', description: 'Retargeting and personalized ads', company: 'Criteo' },
  { name: 'Amazon Ads', category: 'advertising', domain: 'amazon-adsystem.com', description: 'Amazon advertising network', company: 'Amazon' },

  // Social
  { name: 'Facebook Connect', category: 'social', domain: 'connect.facebook.net', description: 'Social login and sharing widgets', company: 'Meta' },
  { name: 'Twitter Widgets', category: 'social', domain: 'platform.twitter.com', description: 'Tweet embeds and follow buttons', company: 'X Corp' },
  { name: 'LinkedIn Insights', category: 'social', domain: 'linkedin.com/li', description: 'Professional network tracking', company: 'Microsoft' },
  { name: 'Pinterest', category: 'social', domain: 'pinimg.com', description: 'Pin buttons and tracking', company: 'Pinterest' },

  // Fingerprinting
  { name: 'FingerprintJS', category: 'fingerprint', domain: 'fpjs.io', description: 'Browser fingerprinting service', company: 'FingerprintJS' },
  { name: 'Sift Science', category: 'fingerprint', domain: 'sift.com', description: 'Fraud detection fingerprinting', company: 'Sift' },
  { name: 'ThreatMetrix', category: 'fingerprint', domain: 'threatmetrix.com', description: 'Device fingerprinting for fraud', company: 'LexisNexis' },
];

export default function TrackerBlockerPage() {
  const [result, setResult] = useState<TrackerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDetection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const tests: TrackerTest[] = [];
      const categories = {
        analytics: { total: 0, blocked: 0 },
        advertising: { total: 0, blocked: 0 },
        social: { total: 0, blocked: 0 },
        fingerprint: { total: 0, blocked: 0 },
      };

      for (const tracker of TRACKER_TESTS) {
        categories[tracker.category].total++;

        // Simulate tracker blocking detection
        // In a real implementation, we'd attempt to load each tracker's script
        const blocked = await simulateTrackerCheck(tracker.domain);

        if (blocked) {
          categories[tracker.category].blocked++;
        }

        tests.push({ ...tracker, blocked });
      }

      const totalBlocked = Object.values(categories).reduce((sum, cat) => sum + cat.blocked, 0);
      const totalTrackers = TRACKER_TESTS.length;
      const blockRate = totalBlocked / totalTrackers;

      let protectionLevel: TrackerResult['protectionLevel'] = 'none';
      if (blockRate > 0.8) protectionLevel = 'strict';
      else if (blockRate > 0.5) protectionLevel = 'standard';
      else if (blockRate > 0.2) protectionLevel = 'basic';

      setResult({
        totalTrackers,
        blockedTrackers: totalBlocked,
        protectionLevel,
        categories,
        tests,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runDetection();
  }, [runDetection]);

  const statusReadings = useMemo(() => [
    {
      label: 'Protection',
      value: result?.protectionLevel.toUpperCase() || 'SCANNING',
      tone: result?.protectionLevel === 'strict' ? 'active' as const :
            result?.protectionLevel === 'none' ? 'alert' as const : 'neutral' as const,
    },
    {
      label: 'Blocked',
      value: result ? `${result.blockedTrackers}/${result.totalTrackers}` : '---',
      tone: result?.blockedTrackers ? 'active' as const : 'alert' as const,
    },
    {
      label: 'Exposed',
      value: result ? (result.totalTrackers - result.blockedTrackers).toString() : '---',
      tone: result && result.totalTrackers - result.blockedTrackers > 5 ? 'alert' as const : 'neutral' as const,
    },
  ], [result]);

  const getProtectionColor = (level: TrackerResult['protectionLevel']) => {
    switch (level) {
      case 'strict': return 'text-green-400';
      case 'standard': return 'text-cyan-400';
      case 'basic': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getCategoryIcon = (category: TrackerTest['category']) => {
    switch (category) {
      case 'analytics': return '📊';
      case 'advertising': return '📢';
      case 'social': return '👥';
      case 'fingerprint': return '🔏';
    }
  };

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={runDetection}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Shield Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Tracker Blocker Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Test which tracking scripts, analytics, and third-party trackers are blocked by your browser.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Protection Summary
            </p>

            {loading ? (
              <div className="h-48 flex items-center justify-center text-slate-500">
                Testing tracker blocking...
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded">
                  <p className="text-xs text-slate-500 mb-2">Protection Level</p>
                  <p className={`text-2xl font-mono ${getProtectionColor(result.protectionLevel)}`}>
                    {result.protectionLevel.toUpperCase()}
                  </p>
                  <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.protectionLevel === 'strict' ? 'bg-green-500 w-full' :
                        result.protectionLevel === 'standard' ? 'bg-cyan-500 w-3/4' :
                        result.protectionLevel === 'basic' ? 'bg-yellow-500 w-1/2' : 'bg-red-500 w-1/4'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/50 rounded text-center">
                    <p className="text-2xl font-mono text-cyan-400">{result.blockedTrackers}</p>
                    <p className="text-xs text-slate-500">Blocked</p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded text-center">
                    <p className="text-2xl font-mono text-orange-400">{result.totalTrackers - result.blockedTrackers}</p>
                    <p className="text-xs text-slate-500">Exposed</p>
                  </div>
                </div>

                {result.protectionLevel === 'none' && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                    <p className="text-sm text-red-300">
                      No tracker protection detected. Your browsing activity is being tracked by multiple services.
                    </p>
                  </div>
                )}

                {result.protectionLevel === 'strict' && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                    <p className="text-sm text-green-300">
                      Excellent protection! Most trackers are blocked. Your browsing is relatively private.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Category Breakdown
            </p>

            {result && (
              <div className="space-y-4">
                {Object.entries(result.categories).map(([category, stats]) => (
                  <div key={category} className="p-3 bg-slate-800/40 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{getCategoryIcon(category as TrackerTest['category'])}</span>
                        <span className="text-sm text-slate-300 capitalize">{category}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {stats.blocked}/{stats.total} blocked
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-500"
                        style={{ width: `${(stats.blocked / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Tracker List */}
        {result && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Individual Tracker Status
            </p>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
              {result.tests.map((test, i) => (
                <div
                  key={i}
                  className={`p-3 rounded ${
                    test.blocked ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-orange-500/10 border border-orange-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-200">{test.name}</p>
                      <p className="text-xs text-slate-500">{test.company}</p>
                    </div>
                    <span className={`text-xs font-mono ${test.blocked ? 'text-cyan-400' : 'text-orange-400'}`}>
                      {test.blocked ? '✓' : '✗'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{test.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="lab-panel p-4 bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Tracker Blocking: Understanding the Web&apos;s Surveillance Network
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Every website you visit is crawling with invisible trackers. On average, a single page
              loads 10-20 different tracking scripts. These aren&apos;t just counting page views — they&apos;re
              building detailed profiles of your interests, behaviors, and even your real-world identity.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Tracker Ecosystem</h3>
            <p>
              The tracking industry is a complex web of data brokers, ad tech companies, and analytics
              providers. Here&apos;s who&apos;s watching:
            </p>

            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">📊 Analytics Trackers</h4>
                <p className="text-sm mb-2">
                  Measure user behavior, session duration, page views, and conversion events.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>Google Analytics (84% of top sites)</li>
                  <li>Hotjar, Mixpanel, Amplitude</li>
                  <li>Session recording tools</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">📢 Advertising Trackers</h4>
                <p className="text-sm mb-2">
                  Build profiles for targeted ads and track conversions across sites.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>Google Ads, Facebook Pixel</li>
                  <li>Retargeting networks (Criteo)</li>
                  <li>Real-time bidding platforms</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-purple-300 font-medium mb-2">👥 Social Trackers</h4>
                <p className="text-sm mb-2">
                  Social media widgets that track you even without clicking.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>Facebook Like buttons</li>
                  <li>Twitter share widgets</li>
                  <li>LinkedIn insight tags</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-red-300 font-medium mb-2">🔏 Fingerprinting Services</h4>
                <p className="text-sm mb-2">
                  Create unique device IDs that persist across sessions and incognito.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>FingerprintJS, ThreatMetrix</li>
                  <li>Fraud detection services</li>
                  <li>Device identity platforms</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">How Tracking Works</h3>
            <p>
              Trackers use multiple techniques to follow you across the web:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong className="text-slate-300">Third-party cookies</strong> — The classic method.
                A script from tracker.com sets a cookie on every site you visit.
              </li>
              <li>
                <strong className="text-slate-300">Pixel tracking</strong> — Invisible 1x1 images that
                load from tracking servers, revealing your IP and request headers.
              </li>
              <li>
                <strong className="text-slate-300">JavaScript beacons</strong> — Scripts that collect
                detailed browser data and send it to tracking servers.
              </li>
              <li>
                <strong className="text-slate-300">Browser fingerprinting</strong> — Combining dozens
                of browser attributes to create a unique ID without cookies.
              </li>
              <li>
                <strong className="text-slate-300">Link decoration</strong> — Adding tracking IDs to
                URLs (?fbclid=, &gclid=) that persist through navigation.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">Browser Protection Comparison</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Protection</th>
                  <th className="text-left py-2 text-slate-300">3rd Party Cookies</th>
                  <th className="text-left py-2 text-slate-300">Trackers</th>
                  <th className="text-left py-2 text-slate-300">Fingerprinting</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Chrome (Default)</td>
                  <td className="py-2 text-red-400">✗ Allowed</td>
                  <td className="py-2 text-red-400">✗ Allowed</td>
                  <td className="py-2 text-red-400">✗ Allowed</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Firefox (ETP Standard)</td>
                  <td className="py-2 text-cyan-400">✓ Blocked</td>
                  <td className="py-2 text-orange-400">~ Known only</td>
                  <td className="py-2 text-orange-400">~ Known only</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Firefox (ETP Strict)</td>
                  <td className="py-2 text-cyan-400">✓ Blocked</td>
                  <td className="py-2 text-cyan-400">✓ Blocked</td>
                  <td className="py-2 text-cyan-400">✓ Blocked</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Safari (ITP)</td>
                  <td className="py-2 text-cyan-400">✓ Blocked</td>
                  <td className="py-2 text-orange-400">~ Known only</td>
                  <td className="py-2 text-orange-400">~ Limited</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Brave (Default)</td>
                  <td className="py-2 text-cyan-400">✓ Blocked</td>
                  <td className="py-2 text-cyan-400">✓ Blocked</td>
                  <td className="py-2 text-cyan-400">✓ Randomized</td>
                </tr>
                <tr>
                  <td className="py-2">Tor Browser</td>
                  <td className="py-2 text-cyan-400">✓ Blocked</td>
                  <td className="py-2 text-cyan-400">✓ Blocked</td>
                  <td className="py-2 text-cyan-400">✓ Unified</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">The Data They Collect</h3>
            <p>
              What do trackers learn about you? More than you might think:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">Browsing history</strong> — Every page you visit on sites with the same tracker</li>
              <li><strong className="text-slate-300">Purchase intent</strong> — Products you viewed, abandoned carts, comparison shopping</li>
              <li><strong className="text-slate-300">Reading patterns</strong> — How far you scroll, what you highlight, time on page</li>
              <li><strong className="text-slate-300">Device info</strong> — Browser, OS, screen size, installed fonts</li>
              <li><strong className="text-slate-300">Location</strong> — IP geolocation, timezone, language preferences</li>
              <li><strong className="text-slate-300">Demographics</strong> — Inferred age, gender, income from behavior patterns</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use Firefox or Brave</strong> — Both have strong
                built-in tracking protection that doesn&apos;t require extensions.
              </li>
              <li>
                <strong className="text-slate-300">Install uBlock Origin</strong> — The most effective
                content blocker, blocks trackers and fingerprinting scripts.
              </li>
              <li>
                <strong className="text-slate-300">Enable strict tracking protection</strong> — In
                Firefox: Settings → Privacy → Strict mode.
              </li>
              <li>
                <strong className="text-slate-300">Use DNS-level blocking</strong> — NextDNS or Pi-hole
                block trackers at the network level.
              </li>
              <li>
                <strong className="text-slate-300">Disable JavaScript selectively</strong> — Extensions
                like NoScript let you block scripts per-site.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Average websites load 10-20 different trackers</li>
                <li>Google Analytics alone is on 84% of top websites</li>
                <li>Trackers build profiles across sites, not just within them</li>
                <li>Firefox ETP Strict and Brave provide the best protection</li>
                <li>DNS-level blocking catches trackers that browser extensions miss</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

async function simulateTrackerCheck(domain: string): Promise<boolean> {
  // In a real implementation, we'd attempt to load a resource from each tracker domain
  // and check if it was blocked. For now, we simulate based on common blocking patterns.

  // Create a test element
  const testDiv = document.createElement('div');
  testDiv.className = `tracker-test-${domain.replace(/\./g, '-')}`;
  testDiv.innerHTML = '&nbsp;';
  testDiv.style.cssText = 'position:absolute;top:-999px;left:-999px;height:1px;width:1px;';
  document.body.appendChild(testDiv);

  await new Promise(r => setTimeout(r, 50));

  // Check if element was hidden by content blockers
  const isBlocked = testDiv.offsetHeight === 0 ||
                   testDiv.offsetWidth === 0 ||
                   getComputedStyle(testDiv).display === 'none';

  document.body.removeChild(testDiv);

  // For more accurate detection, try loading an image from the domain
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(true); // Timeout suggests blocking
    }, 1000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      // Error could be blocking or just no image at that URL
      // Combine with bait element result
      resolve(isBlocked);
    };

    // Try to load a common tracking pixel pattern
    img.src = `https://${domain}/pixel.gif?t=${Date.now()}`;
  });
}
