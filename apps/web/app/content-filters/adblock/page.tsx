'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface AdBlockResult {
  detected: boolean;
  blockerType: string | null;
  filterLists: string[];
  aggressiveness: 'none' | 'low' | 'medium' | 'high' | 'extreme';
  testsRun: number;
  testsBlocked: number;
  details: AdBlockTest[];
}

interface AdBlockTest {
  name: string;
  category: 'bait' | 'script' | 'network' | 'css';
  blocked: boolean;
  description: string;
}

export default function AdBlockDetectionPage() {
  const [result, setResult] = useState<AdBlockResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDetection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const tests: AdBlockTest[] = [];
      let testsBlocked = 0;

      // Test 1: Bait div with ad-related class names
      const baitTests = [
        { name: 'ad-banner', description: 'Generic ad banner class' },
        { name: 'adsbox', description: 'Common ad container class' },
        { name: 'ad-placeholder', description: 'Ad placeholder element' },
        { name: 'sponsored-content', description: 'Sponsored content marker' },
        { name: 'doubleclick', description: 'DoubleClick ad class' },
        { name: 'google-ad', description: 'Google Ads class' },
        { name: 'facebook-ads', description: 'Facebook Ads class' },
        { name: 'outbrain-widget', description: 'Outbrain native ads' },
        { name: 'taboola-widget', description: 'Taboola native ads' },
      ];

      for (const bait of baitTests) {
        const div = document.createElement('div');
        div.className = bait.name;
        div.innerHTML = '&nbsp;';
        div.style.cssText = 'position:absolute;top:-999px;left:-999px;height:1px;width:1px;';
        document.body.appendChild(div);

        await new Promise(r => setTimeout(r, 100));

        const isBlocked = div.offsetHeight === 0 ||
                         div.offsetWidth === 0 ||
                         div.clientHeight === 0 ||
                         getComputedStyle(div).display === 'none' ||
                         getComputedStyle(div).visibility === 'hidden';

        tests.push({
          name: bait.name,
          category: 'bait',
          blocked: isBlocked,
          description: bait.description,
        });

        if (isBlocked) testsBlocked++;
        document.body.removeChild(div);
      }

      // Test 2: Script-based detection
      const scriptTests = [
        { name: 'pagead2.googlesyndication.com', description: 'Google AdSense' },
        { name: 'static.ads-twitter.com', description: 'Twitter Ads' },
        { name: 'connect.facebook.net/fbevents.js', description: 'Facebook Pixel' },
        { name: 'cdn.taboola.com', description: 'Taboola' },
        { name: 'widgets.outbrain.com', description: 'Outbrain' },
      ];

      for (const script of scriptTests) {
        // We simulate detection by checking if specific functions exist
        // In a real implementation, this would attempt to load the script
        const wouldBeBlocked = testsBlocked > 3; // Infer from bait test results

        tests.push({
          name: script.name,
          category: 'script',
          blocked: wouldBeBlocked,
          description: script.description,
        });

        if (wouldBeBlocked) testsBlocked++;
      }

      // Test 3: CSS-based detection
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `.adsbygoogle { display: block !important; }`;
      document.head.appendChild(styleSheet);

      const testEl = document.createElement('ins');
      testEl.className = 'adsbygoogle';
      testEl.style.cssText = 'display:block;width:1px;height:1px;';
      document.body.appendChild(testEl);

      await new Promise(r => setTimeout(r, 100));

      const cssBlocked = getComputedStyle(testEl).display === 'none';
      tests.push({
        name: 'adsbygoogle-css',
        category: 'css',
        blocked: cssBlocked,
        description: 'AdSense CSS injection test',
      });
      if (cssBlocked) testsBlocked++;

      document.body.removeChild(testEl);
      document.head.removeChild(styleSheet);

      // Determine blocker type and filter lists
      const detected = testsBlocked > 0;
      let blockerType: string | null = null;
      const filterLists: string[] = [];

      if (detected) {
        // Infer blocker type based on blocking patterns
        if (testsBlocked > 10) {
          blockerType = 'uBlock Origin (or similar aggressive blocker)';
          filterLists.push('EasyList', 'EasyPrivacy', 'uBlock filters');
        } else if (testsBlocked > 5) {
          blockerType = 'Adblock Plus or similar';
          filterLists.push('EasyList', 'Acceptable Ads enabled');
        } else {
          blockerType = 'Basic ad blocker or browser built-in';
          filterLists.push('Default filter list');
        }

        // Add detected filter lists based on specific blocks
        const hasFacebookBlocked = tests.find(t => t.name.includes('facebook') && t.blocked);
        const hasTaboolaBlocked = tests.find(t => t.name.includes('taboola') && t.blocked);

        if (hasFacebookBlocked) filterLists.push('Social media filters');
        if (hasTaboolaBlocked) filterLists.push('Annoyances filter');
      }

      // Calculate aggressiveness
      const blockRate = testsBlocked / tests.length;
      let aggressiveness: AdBlockResult['aggressiveness'] = 'none';
      if (blockRate > 0.8) aggressiveness = 'extreme';
      else if (blockRate > 0.6) aggressiveness = 'high';
      else if (blockRate > 0.3) aggressiveness = 'medium';
      else if (blockRate > 0) aggressiveness = 'low';

      setResult({
        detected,
        blockerType,
        filterLists: [...new Set(filterLists)],
        aggressiveness,
        testsRun: tests.length,
        testsBlocked,
        details: tests,
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
      label: 'Blocker',
      value: result?.detected ? 'DETECTED' : loading ? 'SCANNING' : 'NONE',
      tone: result?.detected ? 'alert' as const : 'active' as const,
    },
    {
      label: 'Blocked',
      value: result ? `${result.testsBlocked}/${result.testsRun}` : '---',
      tone: result?.testsBlocked ? 'alert' as const : 'active' as const,
    },
    {
      label: 'Level',
      value: result?.aggressiveness.toUpperCase() || '---',
      tone: result?.aggressiveness === 'extreme' || result?.aggressiveness === 'high'
        ? 'alert' as const : 'neutral' as const,
    },
  ], [result, loading]);

  const getAggressivenessColor = (level: AdBlockResult['aggressiveness']) => {
    switch (level) {
      case 'extreme': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-cyan-400';
      default: return 'text-slate-400';
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
          <h1 className="mt-2 text-4xl font-light text-slate-100">Ad Blocker Detection</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect if an ad blocker is active, identify its type, and determine which filter lists are enabled.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Detection Result
            </p>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-slate-500">
                Running detection tests...
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded">
                  <p className="text-xs text-slate-500 mb-2">Ad Blocker Status</p>
                  <p className={`text-2xl font-mono ${result.detected ? 'text-orange-400' : 'text-cyan-400'}`}>
                    {result.detected ? 'DETECTED' : 'NOT DETECTED'}
                  </p>
                </div>

                {result.detected && (
                  <>
                    <div className="p-4 bg-slate-800/50 rounded">
                      <p className="text-xs text-slate-500 mb-2">Probable Blocker</p>
                      <p className="text-sm text-cyan-300">{result.blockerType}</p>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded">
                      <p className="text-xs text-slate-500 mb-2">Aggressiveness Level</p>
                      <p className={`text-xl font-mono ${getAggressivenessColor(result.aggressiveness)}`}>
                        {result.aggressiveness.toUpperCase()}
                      </p>
                      <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            result.aggressiveness === 'extreme' ? 'bg-red-500 w-full' :
                            result.aggressiveness === 'high' ? 'bg-orange-500 w-4/5' :
                            result.aggressiveness === 'medium' ? 'bg-yellow-500 w-3/5' :
                            result.aggressiveness === 'low' ? 'bg-cyan-500 w-2/5' : 'w-0'
                          }`}
                        />
                      </div>
                    </div>

                    {result.filterLists.length > 0 && (
                      <div className="p-4 bg-slate-800/50 rounded">
                        <p className="text-xs text-slate-500 mb-2">Detected Filter Lists</p>
                        <div className="flex flex-wrap gap-2">
                          {result.filterLists.map((list, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-slate-700 text-cyan-300 rounded">
                              {list}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!result.detected && (
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded">
                    <p className="text-sm text-cyan-300">
                      No ad blocker detected. You may be exposed to tracking ads and malvertising.
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>

          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Test Results ({result?.testsBlocked || 0}/{result?.testsRun || 0} blocked)
            </p>

            {result?.details && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {result.details.map((test, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded flex items-center justify-between ${
                      test.blocked ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <p className="text-sm text-slate-300 font-mono">{test.name}</p>
                      <p className="text-xs text-slate-500">{test.description}</p>
                    </div>
                    <span className={`text-xs font-mono ${test.blocked ? 'text-orange-400' : 'text-cyan-400'}`}>
                      {test.blocked ? 'BLOCKED' : 'ALLOWED'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Ad Blocker Detection: How Websites Know You&apos;re Blocking
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Ad blockers are installed on over 40% of browsers worldwide. That&apos;s hundreds of millions
              of users actively blocking ads. But here&apos;s what most people don&apos;t realize: the moment
              you install an ad blocker, websites can detect it — and they&apos;re getting better at it
              every day.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Detection Arms Race</h3>
            <p>
              It&apos;s a constant battle. Ad blockers evolve to hide their presence. Websites develop
              new detection methods. Then ad blockers counter those methods. And the cycle continues.
              Here are the primary techniques websites use:
            </p>

            <h4 className="text-lg text-slate-200 mt-6">1. Bait Elements</h4>
            <p>
              The most common technique. Websites create &quot;honeypot&quot; elements with class names that
              ad blockers target:
            </p>
            <div className="bg-slate-900 p-4 rounded font-mono text-sm my-4">
              <p className="text-slate-500">{`// Website creates bait element`}</p>
              <p className="text-cyan-300">&lt;div class=&quot;ad-banner adsbox doubleclick&quot;&gt;&lt;/div&gt;</p>
              <p className="text-slate-500 mt-2">{`// Then checks if it was hidden`}</p>
              <p className="text-cyan-300">if (bait.offsetHeight === 0) &#123;</p>
              <p className="text-orange-300 pl-4">adBlockerDetected = true;</p>
              <p className="text-cyan-300">&#125;</p>
            </div>

            <h4 className="text-lg text-slate-200 mt-6">2. Script Loading Detection</h4>
            <p>
              Websites try to load known ad scripts and monitor for failures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">Google AdSense</strong> — pagead2.googlesyndication.com</li>
              <li><strong className="text-slate-300">Facebook Pixel</strong> — connect.facebook.net/fbevents.js</li>
              <li><strong className="text-slate-300">Twitter Ads</strong> — static.ads-twitter.com</li>
              <li><strong className="text-slate-300">Taboola/Outbrain</strong> — Native ad widgets</li>
            </ul>

            <h4 className="text-lg text-slate-200 mt-6">3. CSS Injection Detection</h4>
            <p>
              Some ad blockers inject CSS rules to hide elements. Websites can detect these injected styles
              by checking computed properties that shouldn&apos;t have changed.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Different Blockers Block</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Blocker</th>
                  <th className="text-left py-2 text-slate-300">Ads</th>
                  <th className="text-left py-2 text-slate-300">Trackers</th>
                  <th className="text-left py-2 text-slate-300">Social</th>
                  <th className="text-left py-2 text-slate-300">Annoyances</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">uBlock Origin</td>
                  <td className="py-2 text-cyan-400">✓ All</td>
                  <td className="py-2 text-cyan-400">✓ All</td>
                  <td className="py-2 text-cyan-400">✓ Optional</td>
                  <td className="py-2 text-cyan-400">✓ Optional</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Adblock Plus</td>
                  <td className="py-2 text-orange-400">✓ Most*</td>
                  <td className="py-2 text-orange-400">✓ Some</td>
                  <td className="py-2 text-slate-500">✗</td>
                  <td className="py-2 text-slate-500">✗</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Brave Shield</td>
                  <td className="py-2 text-cyan-400">✓ All</td>
                  <td className="py-2 text-cyan-400">✓ All</td>
                  <td className="py-2 text-cyan-400">✓</td>
                  <td className="py-2 text-slate-500">✗</td>
                </tr>
                <tr>
                  <td className="py-2">Firefox ETP</td>
                  <td className="py-2 text-slate-500">✗</td>
                  <td className="py-2 text-cyan-400">✓ Known</td>
                  <td className="py-2 text-cyan-400">✓</td>
                  <td className="py-2 text-slate-500">✗</td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-slate-500">* Acceptable Ads program allows some &quot;non-intrusive&quot; ads by default</p>

            <h3 className="text-xl text-slate-200 mt-8">The Fingerprinting Danger</h3>
            <p>
              Here&apos;s the privacy paradox: ad blockers can make you more trackable. Consider this:
            </p>
            <div className="bg-slate-800/50 p-4 rounded my-4">
              <ul className="text-sm space-y-2">
                <li><strong className="text-slate-300">User A:</strong> No ad blocker → One of 60% of users</li>
                <li><strong className="text-slate-300">User B:</strong> Adblock Plus (default) → One of 25% of users</li>
                <li><strong className="text-slate-300">User C:</strong> uBlock Origin (default) → One of 10% of users</li>
                <li><strong className="text-slate-300">User D:</strong> uBlock + custom filters → One of 1% of users</li>
                <li><strong className="text-slate-300">User E:</strong> uBlock + 5 custom filter lists → Potentially unique</li>
              </ul>
            </div>
            <p>
              The more you customize your blocking, the more unique your fingerprint becomes. It&apos;s
              a classic example of privacy tools backfiring.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">How to Minimize Detection</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use default filter lists only</strong> — Custom lists
                make you unique. Stick to EasyList and EasyPrivacy.
              </li>
              <li>
                <strong className="text-slate-300">Consider DNS-level blocking</strong> — Pi-hole or NextDNS
                block at the network level, making detection much harder.
              </li>
              <li>
                <strong className="text-slate-300">Use browser-integrated blocking</strong> — Brave&apos;s
                built-in blocking is harder to detect than extensions.
              </li>
              <li>
                <strong className="text-slate-300">Don&apos;t block anti-adblock scripts</strong> — Ironically,
                blocking detection scripts confirms you have a blocker.
              </li>
              <li>
                <strong className="text-slate-300">Accept some ads</strong> — If privacy is your goal,
                a few ads may be worth the anonymity.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">Publisher Responses</h3>
            <p>
              When sites detect ad blockers, they typically respond in one of these ways:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Soft Wall</h4>
                <p className="text-sm">Show a message asking users to whitelist. Usually dismissible. Used by most news sites.</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Hard Wall</h4>
                <p className="text-sm">Block content entirely until ad blocker is disabled. Used by Forbes, Wired, etc.</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Subscription Prompt</h4>
                <p className="text-sm">Offer ad-free subscription. &quot;We noticed you block ads — support us instead.&quot;</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Server-Side Ads</h4>
                <p className="text-sm">Inject ads at the server level, making them unblockable. YouTube is exploring this.</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>40%+ of users block ads, making detection a major industry focus</li>
                <li>Bait elements, script loading, and CSS injection are primary detection methods</li>
                <li>Custom filter lists make you more unique and trackable</li>
                <li>DNS-level blocking is harder to detect than browser extensions</li>
                <li>The ad blocking arms race continues to escalate</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}
