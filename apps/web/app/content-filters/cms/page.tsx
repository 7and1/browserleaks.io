'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface TechDetection {
  name: string;
  category: 'cms' | 'framework' | 'server' | 'analytics' | 'cdn' | 'security';
  version?: string;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
  icon: string;
}

interface CMSResult {
  detections: TechDetection[];
  categories: Record<string, number>;
  riskLevel: 'low' | 'medium' | 'high';
  fingerprintUniqueness: number;
}

export default function CMSDetectionPage() {
  const [result, setResult] = useState<CMSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState('');

  const runDetection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Detect technologies on the current page (self-analysis)
      const detections: TechDetection[] = [];
      const categories: Record<string, number> = {};

      // Framework detection
      // React
      if (document.querySelector('[data-reactroot]') ||
          document.querySelector('#__next') ||
          (window as unknown as Record<string, unknown>).__NEXT_DATA__) {
        const isNext = !!(window as unknown as Record<string, unknown>).__NEXT_DATA__;
        detections.push({
          name: isNext ? 'Next.js' : 'React',
          category: 'framework',
          confidence: 'high',
          indicators: isNext
            ? ['__NEXT_DATA__ present', 'Next.js page structure']
            : ['data-reactroot attribute', 'React render patterns'],
          icon: '⚛️',
        });
        categories.framework = (categories.framework || 0) + 1;
      }

      // Vue
      if (document.querySelector('[data-v-]') ||
          (window as unknown as Record<string, unknown>).__VUE__) {
        detections.push({
          name: 'Vue.js',
          category: 'framework',
          confidence: 'high',
          indicators: ['data-v- attributes', 'Vue instance detected'],
          icon: '💚',
        });
        categories.framework = (categories.framework || 0) + 1;
      }

      // Angular
      if (document.querySelector('[ng-version]') ||
          document.querySelector('[_ngcontent]')) {
        const versionEl = document.querySelector('[ng-version]');
        detections.push({
          name: 'Angular',
          category: 'framework',
          version: versionEl?.getAttribute('ng-version') || undefined,
          confidence: 'high',
          indicators: ['ng-version attribute', 'Angular compilation markers'],
          icon: '🅰️',
        });
        categories.framework = (categories.framework || 0) + 1;
      }

      // jQuery
      if ((window as unknown as Record<string, unknown>).jQuery ||
          (window as unknown as Record<string, unknown>).$) {
        const jq = (window as unknown as { jQuery?: { fn?: { jquery?: string } } }).jQuery;
        detections.push({
          name: 'jQuery',
          category: 'framework',
          version: jq?.fn?.jquery,
          confidence: 'high',
          indicators: ['window.jQuery present'],
          icon: '📜',
        });
        categories.framework = (categories.framework || 0) + 1;
      }

      // CMS Detection
      // WordPress
      const wpContent = document.querySelector('link[href*="wp-content"]');
      const wpIncludes = document.querySelector('script[src*="wp-includes"]');
      if (wpContent || wpIncludes) {
        detections.push({
          name: 'WordPress',
          category: 'cms',
          confidence: 'high',
          indicators: ['wp-content paths', 'wp-includes scripts'],
          icon: '📝',
        });
        categories.cms = (categories.cms || 0) + 1;
      }

      // Shopify
      if (document.querySelector('link[href*="cdn.shopify.com"]') ||
          (window as unknown as Record<string, unknown>).Shopify) {
        detections.push({
          name: 'Shopify',
          category: 'cms',
          confidence: 'high',
          indicators: ['Shopify CDN', 'Shopify global object'],
          icon: '🛒',
        });
        categories.cms = (categories.cms || 0) + 1;
      }

      // CDN Detection
      const cdnPatterns = [
        { name: 'Cloudflare', pattern: 'cloudflare', icon: '☁️' },
        { name: 'AWS CloudFront', pattern: 'cloudfront.net', icon: '🔶' },
        { name: 'Fastly', pattern: 'fastly', icon: '⚡' },
        { name: 'Vercel', pattern: 'vercel', icon: '▲' },
        { name: 'Netlify', pattern: 'netlify', icon: '🌐' },
      ];

      const scripts = Array.from(document.querySelectorAll('script[src], link[href]'));
      for (const cdn of cdnPatterns) {
        const found = scripts.some(el => {
          const src = el.getAttribute('src') || el.getAttribute('href') || '';
          return src.toLowerCase().includes(cdn.pattern);
        });
        if (found) {
          detections.push({
            name: cdn.name,
            category: 'cdn',
            confidence: 'medium',
            indicators: [`${cdn.pattern} resources detected`],
            icon: cdn.icon,
          });
          categories.cdn = (categories.cdn || 0) + 1;
        }
      }

      // Analytics detection
      if ((window as unknown as Record<string, unknown>).gtag ||
          (window as unknown as Record<string, unknown>).ga ||
          document.querySelector('script[src*="google-analytics"]') ||
          document.querySelector('script[src*="googletagmanager"]')) {
        detections.push({
          name: 'Google Analytics',
          category: 'analytics',
          confidence: 'high',
          indicators: ['gtag/ga present', 'Google Analytics scripts'],
          icon: '📊',
        });
        categories.analytics = (categories.analytics || 0) + 1;
      }

      // Server detection from meta tags
      const generator = document.querySelector('meta[name="generator"]');
      if (generator) {
        const content = generator.getAttribute('content') || '';
        detections.push({
          name: content.split(' ')[0] || 'Unknown Generator',
          category: 'server',
          version: content.split(' ')[1],
          confidence: 'high',
          indicators: ['meta generator tag'],
          icon: '🔧',
        });
        categories.server = (categories.server || 0) + 1;
      }

      // Security headers (simulated - would need server-side check)
      detections.push({
        name: 'HTTPS',
        category: 'security',
        confidence: 'high',
        indicators: [window.location.protocol === 'https:' ? 'Secure connection' : 'Insecure connection'],
        icon: window.location.protocol === 'https:' ? '🔒' : '⚠️',
      });
      categories.security = (categories.security || 0) + 1;

      // Calculate fingerprint uniqueness based on tech stack combination
      const uniqueness = Math.min(detections.length * 0.15, 1);

      // Determine risk level
      let riskLevel: CMSResult['riskLevel'] = 'low';
      if (detections.some(d => d.version)) riskLevel = 'medium';
      if (detections.length > 5) riskLevel = 'high';

      setResult({
        detections,
        categories,
        riskLevel,
        fingerprintUniqueness: uniqueness,
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
      label: 'Tech Stack',
      value: result ? result.detections.length.toString() : loading ? '...' : '0',
      tone: 'active' as const,
    },
    {
      label: 'Uniqueness',
      value: result ? `${Math.round(result.fingerprintUniqueness * 100)}%` : '---',
      tone: result && result.fingerprintUniqueness > 0.5 ? 'alert' as const : 'neutral' as const,
    },
    {
      label: 'Risk',
      value: result?.riskLevel.toUpperCase() || '---',
      tone: result?.riskLevel === 'high' ? 'alert' as const : 'neutral' as const,
    },
  ], [result, loading]);

  const getCategoryColor = (category: TechDetection['category']) => {
    switch (category) {
      case 'cms': return 'text-purple-400';
      case 'framework': return 'text-cyan-400';
      case 'server': return 'text-yellow-400';
      case 'analytics': return 'text-orange-400';
      case 'cdn': return 'text-green-400';
      case 'security': return 'text-red-400';
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
          <h1 className="mt-2 text-4xl font-light text-slate-100">CMS & Technology Detection</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect content management systems, JavaScript frameworks, CDNs, and server technologies.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Technology Stack (This Page)
            </p>

            {loading ? (
              <div className="h-48 flex items-center justify-center text-slate-500">
                Analyzing technology stack...
              </div>
            ) : result ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {result.detections.map((tech, i) => (
                  <div key={i} className="p-3 bg-slate-800/40 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{tech.icon}</span>
                        <div>
                          <p className="text-sm text-slate-200">
                            {tech.name}
                            {tech.version && <span className="text-slate-500 ml-2">v{tech.version}</span>}
                          </p>
                          <p className={`text-xs capitalize ${getCategoryColor(tech.category)}`}>
                            {tech.category}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        tech.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                        tech.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-600/50 text-slate-400'
                      }`}>
                        {tech.confidence}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tech.indicators.map((ind, j) => (
                        <span key={j} className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Detection Summary
            </p>

            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded">
                  <p className="text-xs text-slate-500 mb-2">Fingerprint Uniqueness</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-mono text-cyan-400">
                      {Math.round(result.fingerprintUniqueness * 100)}%
                    </p>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-500"
                        style={{ width: `${result.fingerprintUniqueness * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Based on {result.detections.length} detected technologies
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(result.categories).map(([cat, count]) => (
                    <div key={cat} className="p-2 bg-slate-800/40 rounded text-center">
                      <p className="text-lg font-mono text-cyan-300">{count}</p>
                      <p className="text-xs text-slate-500 capitalize">{cat}</p>
                    </div>
                  ))}
                </div>

                {result.riskLevel !== 'low' && (
                  <div className={`p-4 rounded ${
                    result.riskLevel === 'high'
                      ? 'bg-orange-500/10 border border-orange-500/30'
                      : 'bg-yellow-500/10 border border-yellow-500/30'
                  }`}>
                    <p className={`text-sm ${
                      result.riskLevel === 'high' ? 'text-orange-300' : 'text-yellow-300'
                    }`}>
                      {result.riskLevel === 'high'
                        ? 'Your tech stack is highly detectable. Version information was exposed.'
                        : 'Some version information was detected, which could aid targeted attacks.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* URL Checker */}
            <div className="mt-6">
              <p className="text-xs text-slate-500 mb-2">Check External URL (Coming Soon)</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-300"
                  disabled
                />
                <button
                  disabled
                  className="px-4 py-2 bg-slate-700 text-slate-400 rounded text-sm cursor-not-allowed"
                >
                  Analyze
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="lab-panel p-4 bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Technology Detection: Reading a Website&apos;s DNA
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Every website leaves fingerprints. The frameworks, CMS, servers, and services it uses
              create a unique signature. This &quot;technology stack fingerprint&quot; is valuable for
              reconnaissance, security research, and competitive intelligence.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Why Technology Detection Matters</h3>
            <p>
              Understanding what technologies a website uses has both defensive and offensive applications:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Security Implications</h4>
                <ul className="text-sm space-y-1">
                  <li>Known vulnerabilities in specific versions</li>
                  <li>Default configuration weaknesses</li>
                  <li>Predictable file/URL structures</li>
                  <li>Targeted exploit development</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Business Intelligence</h4>
                <ul className="text-sm space-y-1">
                  <li>Competitor technology analysis</li>
                  <li>Market share tracking</li>
                  <li>Technology adoption trends</li>
                  <li>Lead generation for tech companies</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Detection Techniques</h3>
            <p>
              There are multiple ways to identify what&apos;s running under the hood:
            </p>

            <h4 className="text-lg text-slate-200 mt-6">1. DOM Inspection</h4>
            <p>
              Frameworks leave distinctive markers in the HTML:
            </p>
            <div className="bg-slate-900 p-4 rounded font-mono text-sm my-4">
              <p className="text-slate-500">{`// React`}</p>
              <p className="text-cyan-300">&lt;div data-reactroot=&quot;&quot;&gt;...&lt;/div&gt;</p>
              <p className="text-slate-500 mt-2">{`// Next.js`}</p>
              <p className="text-cyan-300">&lt;script id=&quot;__NEXT_DATA__&quot;&gt;...&lt;/script&gt;</p>
              <p className="text-slate-500 mt-2">{`// Vue.js`}</p>
              <p className="text-cyan-300">&lt;div data-v-abc123&gt;...&lt;/div&gt;</p>
              <p className="text-slate-500 mt-2">{`// Angular`}</p>
              <p className="text-cyan-300">&lt;app-root ng-version=&quot;15.2.0&quot;&gt;...&lt;/app-root&gt;</p>
            </div>

            <h4 className="text-lg text-slate-200 mt-6">2. Global Objects</h4>
            <p>
              JavaScript libraries expose global variables:
            </p>
            <div className="bg-slate-900 p-4 rounded font-mono text-sm my-4">
              <p className="text-cyan-300">window.jQuery         // jQuery</p>
              <p className="text-cyan-300">window.__NUXT__       // Nuxt.js</p>
              <p className="text-cyan-300">window.Shopify        // Shopify</p>
              <p className="text-cyan-300">window.gtag           // Google Analytics</p>
            </div>

            <h4 className="text-lg text-slate-200 mt-6">3. HTTP Headers</h4>
            <p>
              Server technologies often reveal themselves in response headers:
            </p>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Header</th>
                  <th className="text-left py-2 text-slate-300">Example Value</th>
                  <th className="text-left py-2 text-slate-300">Reveals</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">Server</td>
                  <td className="py-2">nginx/1.18.0</td>
                  <td className="py-2">Web server + version</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">X-Powered-By</td>
                  <td className="py-2">PHP/8.1.0</td>
                  <td className="py-2">Backend language</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">X-Generator</td>
                  <td className="py-2">Drupal 10</td>
                  <td className="py-2">CMS platform</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono">cf-ray</td>
                  <td className="py-2">7abc123-LAX</td>
                  <td className="py-2">Cloudflare CDN</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">CMS Market Share (2024)</h3>
            <p>
              Content Management Systems power most of the web:
            </p>
            <div className="bg-slate-800/50 p-4 rounded my-4">
              <ul className="text-sm space-y-2">
                <li><strong className="text-slate-300">WordPress</strong> — 43% of all websites, 65% of CMS market</li>
                <li><strong className="text-slate-300">Shopify</strong> — 4.4% of all websites, dominant in e-commerce</li>
                <li><strong className="text-slate-300">Wix</strong> — 2.6% of all websites</li>
                <li><strong className="text-slate-300">Squarespace</strong> — 2% of all websites</li>
                <li><strong className="text-slate-300">Joomla</strong> — 1.7% of all websites</li>
                <li><strong className="text-slate-300">Drupal</strong> — 1.3% of all websites (popular with enterprises/gov)</li>
              </ul>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Framework Popularity</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Framework</th>
                  <th className="text-left py-2 text-slate-300">Usage</th>
                  <th className="text-left py-2 text-slate-300">Notable Sites</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">React</td>
                  <td className="py-2">40% of top 10K sites</td>
                  <td className="py-2">Facebook, Netflix, Airbnb</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Vue.js</td>
                  <td className="py-2">15% of top 10K sites</td>
                  <td className="py-2">Alibaba, GitLab, Nintendo</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Angular</td>
                  <td className="py-2">10% of top 10K sites</td>
                  <td className="py-2">Google, Microsoft, BMW</td>
                </tr>
                <tr>
                  <td className="py-2">jQuery</td>
                  <td className="py-2">77% of all sites</td>
                  <td className="py-2">Legacy dominance</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Security Recommendations</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Remove version numbers</strong> — Configure servers
                to not expose version information in headers.
              </li>
              <li>
                <strong className="text-slate-300">Strip generator meta tags</strong> — Remove
                <code className="bg-slate-800 px-1 rounded">&lt;meta name=&quot;generator&quot;&gt;</code> tags.
              </li>
              <li>
                <strong className="text-slate-300">Customize default paths</strong> — Change standard
                admin URLs (/wp-admin, /administrator, etc.).
              </li>
              <li>
                <strong className="text-slate-300">Keep software updated</strong> — Even if detected,
                current versions have fewer known vulnerabilities.
              </li>
              <li>
                <strong className="text-slate-300">Use a WAF</strong> — Web Application Firewalls can
                hide technology signatures and block exploit attempts.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Technology stacks are highly detectable through multiple methods</li>
                <li>WordPress powers 43% of all websites</li>
                <li>Version information is the most dangerous exposure</li>
                <li>Server headers often reveal too much</li>
                <li>Regular updates are the best defense against known vulnerabilities</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}
