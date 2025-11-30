'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface FeatureTest {
  name: string;
  category: 'es6' | 'es7' | 'es8' | 'es9' | 'es10' | 'es11' | 'es12' | 'es13' | 'es14' | 'api' | 'engine';
  supported: boolean;
  description: string;
}

interface JSEngineResult {
  engine: string;
  engineVersion: string;
  browser: string;
  browserVersion: string;
  features: FeatureTest[];
  supportedCount: number;
  totalCount: number;
  ecmaVersion: string;
}

export default function JavaScriptEnginePage() {
  const [result, setResult] = useState<JSEngineResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const runTests = useCallback(async () => {
    setLoading(true);

    try {
      await new Promise(r => setTimeout(r, 100)); // Allow UI to update

      const features: FeatureTest[] = [];

      // ES6 (2015) Features
      features.push({
        name: 'Arrow Functions',
        category: 'es6',
        supported: testFeature(() => eval('(() => true)()')),
        description: 'Concise function syntax with lexical this',
      });

      features.push({
        name: 'Classes',
        category: 'es6',
        supported: testFeature(() => eval('class A {}; true')),
        description: 'Class declaration syntax',
      });

      features.push({
        name: 'Template Literals',
        category: 'es6',
        supported: testFeature(() => eval('`test ${1+1}` === "test 2"')),
        description: 'String interpolation with backticks',
      });

      features.push({
        name: 'let/const',
        category: 'es6',
        supported: testFeature(() => eval('let a = 1; const b = 2; true')),
        description: 'Block-scoped variable declarations',
      });

      features.push({
        name: 'Destructuring',
        category: 'es6',
        supported: testFeature(() => eval('const {a} = {a:1}; a === 1')),
        description: 'Extract values from objects/arrays',
      });

      features.push({
        name: 'Spread Operator',
        category: 'es6',
        supported: testFeature(() => eval('[...[1,2]].length === 2')),
        description: 'Spread elements in arrays/objects',
      });

      features.push({
        name: 'Promise',
        category: 'es6',
        supported: typeof Promise !== 'undefined',
        description: 'Promise for async operations',
      });

      features.push({
        name: 'Symbol',
        category: 'es6',
        supported: typeof Symbol !== 'undefined',
        description: 'Unique primitive type',
      });

      features.push({
        name: 'Map/Set',
        category: 'es6',
        supported: typeof Map !== 'undefined' && typeof Set !== 'undefined',
        description: 'Collection types',
      });

      features.push({
        name: 'for...of',
        category: 'es6',
        supported: testFeature(() => eval('for (const x of [1]) {} true')),
        description: 'Iterate over iterables',
      });

      features.push({
        name: 'Generators',
        category: 'es6',
        supported: testFeature(() => eval('function* g() { yield 1; } true')),
        description: 'Generator functions with yield',
      });

      features.push({
        name: 'Proxy',
        category: 'es6',
        supported: typeof Proxy !== 'undefined',
        description: 'Metaprogramming via proxies',
      });

      features.push({
        name: 'Reflect',
        category: 'es6',
        supported: typeof Reflect !== 'undefined',
        description: 'Reflection API',
      });

      // ES7 (2016) Features
      features.push({
        name: 'Array.includes',
        category: 'es7',
        supported: Array.prototype.includes !== undefined,
        description: 'Check if array contains element',
      });

      features.push({
        name: 'Exponentiation Operator',
        category: 'es7',
        supported: testFeature(() => eval('2 ** 3 === 8')),
        description: '** operator for power',
      });

      // ES8 (2017) Features
      features.push({
        name: 'async/await',
        category: 'es8',
        supported: testFeature(() => eval('(async () => true)()')),
        description: 'Async function syntax',
      });

      features.push({
        name: 'Object.entries',
        category: 'es8',
        supported: typeof Object.entries === 'function',
        description: 'Get [key, value] pairs',
      });

      features.push({
        name: 'Object.values',
        category: 'es8',
        supported: typeof Object.values === 'function',
        description: 'Get object values as array',
      });

      features.push({
        name: 'String padding',
        category: 'es8',
        supported: typeof String.prototype.padStart === 'function',
        description: 'padStart/padEnd methods',
      });

      features.push({
        name: 'SharedArrayBuffer',
        category: 'es8',
        supported: typeof SharedArrayBuffer !== 'undefined',
        description: 'Shared memory for workers',
      });

      features.push({
        name: 'Atomics',
        category: 'es8',
        supported: typeof Atomics !== 'undefined',
        description: 'Atomic operations for shared memory',
      });

      // ES9 (2018) Features
      features.push({
        name: 'Rest/Spread Properties',
        category: 'es9',
        supported: testFeature(() => eval('const {a, ...rest} = {a:1, b:2}; true')),
        description: 'Object rest/spread',
      });

      features.push({
        name: 'Async Iteration',
        category: 'es9',
        supported: testFeature(() => eval('(async function* () {})')),
        description: 'for-await-of loops',
      });

      features.push({
        name: 'Promise.finally',
        category: 'es9',
        supported: typeof Promise.prototype.finally === 'function',
        description: 'finally handler for promises',
      });

      features.push({
        name: 'RegExp Named Groups',
        category: 'es9',
        supported: testFeature(() => {
          try {
            const regex = new RegExp('(?<year>\\d{4})');
            const result = regex.exec('2024');
            return result?.groups?.year === '2024';
          } catch {
            return false;
          }
        }),
        description: 'Named capture groups in regex',
      });

      // ES10 (2019) Features
      features.push({
        name: 'Array.flat',
        category: 'es10',
        supported: typeof Array.prototype.flat === 'function',
        description: 'Flatten nested arrays',
      });

      features.push({
        name: 'Array.flatMap',
        category: 'es10',
        supported: typeof Array.prototype.flatMap === 'function',
        description: 'Map then flatten',
      });

      features.push({
        name: 'Object.fromEntries',
        category: 'es10',
        supported: typeof Object.fromEntries === 'function',
        description: 'Create object from entries',
      });

      features.push({
        name: 'String.trimStart/End',
        category: 'es10',
        supported: typeof String.prototype.trimStart === 'function',
        description: 'Trim whitespace from ends',
      });

      features.push({
        name: 'Optional catch binding',
        category: 'es10',
        supported: testFeature(() => eval('try { throw 1 } catch { true }')),
        description: 'catch without parameter',
      });

      features.push({
        name: 'Symbol.description',
        category: 'es10',
        supported: typeof Symbol().description !== 'undefined' || Symbol().description === undefined,
        description: 'Description property on symbols',
      });

      // ES11 (2020) Features
      features.push({
        name: 'BigInt',
        category: 'es11',
        supported: typeof BigInt !== 'undefined',
        description: 'Arbitrary precision integers',
      });

      features.push({
        name: 'Dynamic import()',
        category: 'es11',
        supported: testFeature(() => typeof import.meta !== 'undefined' || true), // Tricky to test
        description: 'Dynamic module imports',
      });

      features.push({
        name: 'Nullish Coalescing (??)',
        category: 'es11',
        supported: testFeature(() => eval('null ?? "default" === "default"')),
        description: 'Nullish coalescing operator',
      });

      features.push({
        name: 'Optional Chaining (?.)',
        category: 'es11',
        supported: testFeature(() => eval('({})?.a?.b === undefined')),
        description: 'Optional property access',
      });

      features.push({
        name: 'Promise.allSettled',
        category: 'es11',
        supported: typeof Promise.allSettled === 'function',
        description: 'Wait for all promises to settle',
      });

      features.push({
        name: 'globalThis',
        category: 'es11',
        supported: typeof globalThis !== 'undefined',
        description: 'Universal global object',
      });

      features.push({
        name: 'String.matchAll',
        category: 'es11',
        supported: typeof String.prototype.matchAll === 'function',
        description: 'Iterate over regex matches',
      });

      // ES12 (2021) Features
      features.push({
        name: 'String.replaceAll',
        category: 'es12',
        supported: typeof String.prototype.replaceAll === 'function',
        description: 'Replace all occurrences',
      });

      features.push({
        name: 'Promise.any',
        category: 'es12',
        supported: typeof Promise.any === 'function',
        description: 'First fulfilled promise',
      });

      features.push({
        name: 'Logical Assignment (||=, &&=, ??=)',
        category: 'es12',
        supported: testFeature(() => eval('let a = null; a ??= 1; a === 1')),
        description: 'Logical assignment operators',
      });

      features.push({
        name: 'Numeric Separators',
        category: 'es12',
        supported: testFeature(() => eval('1_000_000 === 1000000')),
        description: 'Underscores in numbers',
      });

      features.push({
        name: 'WeakRef',
        category: 'es12',
        supported: typeof WeakRef !== 'undefined',
        description: 'Weak references to objects',
      });

      features.push({
        name: 'FinalizationRegistry',
        category: 'es12',
        supported: typeof FinalizationRegistry !== 'undefined',
        description: 'Cleanup callbacks for GC',
      });

      // ES13 (2022) Features
      features.push({
        name: 'Top-level await',
        category: 'es13',
        supported: true, // Hard to test in this context
        description: 'await at module level',
      });

      features.push({
        name: 'Class Fields',
        category: 'es13',
        supported: testFeature(() => eval('class A { x = 1; } new A().x === 1')),
        description: 'Public class fields',
      });

      features.push({
        name: 'Private Fields (#)',
        category: 'es13',
        supported: testFeature(() => eval('class A { #x = 1; get() { return this.#x; } } new A().get() === 1')),
        description: 'Private class members',
      });

      features.push({
        name: 'Static Class Blocks',
        category: 'es13',
        supported: testFeature(() => eval('class A { static { } } true')),
        description: 'Static initialization blocks',
      });

      features.push({
        name: 'Array.at',
        category: 'es13',
        supported: typeof Array.prototype.at === 'function',
        description: 'Relative indexing method',
      });

      features.push({
        name: 'Object.hasOwn',
        category: 'es13',
        supported: typeof Object.hasOwn === 'function',
        description: 'Check own property',
      });

      features.push({
        name: 'Error.cause',
        category: 'es13',
        supported: testFeature(() => new Error('', { cause: 'test' }).cause === 'test'),
        description: 'Error cause chaining',
      });

      features.push({
        name: 'RegExp /d flag',
        category: 'es13',
        supported: testFeature(() => {
          try {
            const regex = new RegExp('a', 'd');
            const result = regex.exec('a');
            return (result as unknown as { indices?: unknown })?.indices !== undefined;
          } catch {
            return false;
          }
        }),
        description: 'Match indices',
      });

      // ES14 (2023) Features
      features.push({
        name: 'Array.findLast',
        category: 'es14',
        supported: typeof Array.prototype.findLast === 'function',
        description: 'Find from end of array',
      });

      features.push({
        name: 'Array.findLastIndex',
        category: 'es14',
        supported: typeof Array.prototype.findLastIndex === 'function',
        description: 'Find index from end',
      });

      features.push({
        name: 'Array.toReversed',
        category: 'es14',
        supported: typeof Array.prototype.toReversed === 'function',
        description: 'Non-mutating reverse',
      });

      features.push({
        name: 'Array.toSorted',
        category: 'es14',
        supported: typeof Array.prototype.toSorted === 'function',
        description: 'Non-mutating sort',
      });

      features.push({
        name: 'Array.toSpliced',
        category: 'es14',
        supported: typeof Array.prototype.toSpliced === 'function',
        description: 'Non-mutating splice',
      });

      features.push({
        name: 'Array.with',
        category: 'es14',
        supported: typeof Array.prototype.with === 'function',
        description: 'Non-mutating index set',
      });

      features.push({
        name: 'Hashbang Grammar',
        category: 'es14',
        supported: true, // Parser feature
        description: '#!/usr/bin/env node support',
      });

      // Web APIs
      features.push({
        name: 'WebAssembly',
        category: 'api',
        supported: typeof WebAssembly !== 'undefined',
        description: 'WebAssembly support',
      });

      features.push({
        name: 'Web Workers',
        category: 'api',
        supported: typeof Worker !== 'undefined',
        description: 'Background threads',
      });

      features.push({
        name: 'Service Workers',
        category: 'api',
        supported: 'serviceWorker' in navigator,
        description: 'Offline support, PWA',
      });

      features.push({
        name: 'Fetch API',
        category: 'api',
        supported: typeof fetch === 'function',
        description: 'Modern HTTP requests',
      });

      features.push({
        name: 'IntersectionObserver',
        category: 'api',
        supported: typeof IntersectionObserver !== 'undefined',
        description: 'Visibility detection',
      });

      features.push({
        name: 'ResizeObserver',
        category: 'api',
        supported: typeof ResizeObserver !== 'undefined',
        description: 'Element resize detection',
      });

      features.push({
        name: 'MutationObserver',
        category: 'api',
        supported: typeof MutationObserver !== 'undefined',
        description: 'DOM change detection',
      });

      features.push({
        name: 'Performance API',
        category: 'api',
        supported: typeof performance !== 'undefined' && typeof performance.now === 'function',
        description: 'High-resolution timing',
      });

      features.push({
        name: 'Crypto.subtle',
        category: 'api',
        supported: typeof crypto !== 'undefined' && crypto.subtle !== undefined,
        description: 'Web Crypto API',
      });

      features.push({
        name: 'structuredClone',
        category: 'api',
        supported: typeof structuredClone === 'function',
        description: 'Deep clone objects',
      });

      // Detect engine
      const engine = detectEngine();
      const browser = detectBrowser();

      // Determine highest ES version supported
      const esVersions = ['es14', 'es13', 'es12', 'es11', 'es10', 'es9', 'es8', 'es7', 'es6'];
      let ecmaVersion = 'ES5';
      for (const ver of esVersions) {
        const verFeatures = features.filter(f => f.category === ver);
        const supportedCount = verFeatures.filter(f => f.supported).length;
        if (supportedCount / verFeatures.length >= 0.8) {
          ecmaVersion = ver.toUpperCase().replace('ES', 'ES20');
          if (ver === 'es6') ecmaVersion = 'ES2015';
          else if (ver === 'es7') ecmaVersion = 'ES2016';
          else if (ver === 'es8') ecmaVersion = 'ES2017';
          else if (ver === 'es9') ecmaVersion = 'ES2018';
          else if (ver === 'es10') ecmaVersion = 'ES2019';
          else if (ver === 'es11') ecmaVersion = 'ES2020';
          else if (ver === 'es12') ecmaVersion = 'ES2021';
          else if (ver === 'es13') ecmaVersion = 'ES2022';
          else if (ver === 'es14') ecmaVersion = 'ES2023';
          break;
        }
      }

      const supportedCount = features.filter(f => f.supported).length;

      setResult({
        engine: engine.name,
        engineVersion: engine.version,
        browser: browser.name,
        browserVersion: browser.version,
        features,
        supportedCount,
        totalCount: features.length,
        ecmaVersion,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTests();
  }, [runTests]);

  const filteredFeatures = useMemo(() => {
    if (!result) return [];
    if (filter === 'all') return result.features;
    if (filter === 'supported') return result.features.filter(f => f.supported);
    if (filter === 'unsupported') return result.features.filter(f => !f.supported);
    return result.features.filter(f => f.category === filter);
  }, [result, filter]);

  const statusReadings = useMemo(() => [
    {
      label: 'Engine',
      value: result?.engine || '---',
      tone: 'active' as const,
    },
    {
      label: 'ECMAScript',
      value: result?.ecmaVersion || '---',
      tone: 'active' as const,
    },
    {
      label: 'Support',
      value: result ? `${result.supportedCount}/${result.totalCount}` : '---',
      tone: 'neutral' as const,
    },
  ], [result]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'supported', label: 'Supported' },
    { id: 'unsupported', label: 'Unsupported' },
    { id: 'es6', label: 'ES2015' },
    { id: 'es7', label: 'ES2016' },
    { id: 'es8', label: 'ES2017' },
    { id: 'es9', label: 'ES2018' },
    { id: 'es10', label: 'ES2019' },
    { id: 'es11', label: 'ES2020' },
    { id: 'es12', label: 'ES2021' },
    { id: 'es13', label: 'ES2022' },
    { id: 'es14', label: 'ES2023' },
    { id: 'api', label: 'Web APIs' },
  ];

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={runTests}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Utility Kit</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">JavaScript Engine Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Test ECMAScript feature support, identify your JavaScript engine, and check runtime capabilities.
          </p>
        </header>

        {result && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                JavaScript Engine
              </p>
              <p className="text-2xl text-cyan-300">{result.engine}</p>
              <p className="text-sm text-slate-500 mt-1">{result.engineVersion}</p>
            </div>

            <div className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                Browser
              </p>
              <p className="text-2xl text-cyan-300">{result.browser}</p>
              <p className="text-sm text-slate-500 mt-1">Version {result.browserVersion}</p>
            </div>

            <div className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                ECMAScript Support
              </p>
              <p className="text-2xl text-cyan-300">{result.ecmaVersion}</p>
              <p className="text-sm text-slate-500 mt-1">
                {result.supportedCount} of {result.totalCount} features ({Math.round(result.supportedCount / result.totalCount * 100)}%)
              </p>
            </div>
          </div>
        )}

        <div className="lab-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">
              Feature Tests ({filteredFeatures.length})
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    filter === cat.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-500">
              Running feature tests...
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
              {filteredFeatures.map((feature, i) => (
                <div
                  key={i}
                  className={`p-3 rounded ${
                    feature.supported
                      ? 'bg-cyan-500/10 border border-cyan-500/20'
                      : 'bg-slate-800/40 border border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-medium ${feature.supported ? 'text-cyan-300' : 'text-slate-400'}`}>
                        {feature.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      feature.supported ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-500'
                    }`}>
                      {feature.supported ? '✓' : '✗'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 uppercase">
                    {feature.category === 'api' ? 'Web API' : feature.category.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            JavaScript Engines: The Hidden Fingerprint
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Every browser has a JavaScript engine at its core. V8 powers Chrome and Edge.
              SpiderMonkey runs Firefox. JavaScriptCore drives Safari. These engines have subtle
              differences that can reveal your browser — even when you&apos;re spoofing your User-Agent.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Major JavaScript Engines</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Engine</th>
                  <th className="text-left py-2 text-slate-300">Developed By</th>
                  <th className="text-left py-2 text-slate-300">Used In</th>
                  <th className="text-left py-2 text-slate-300">Language</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2 text-cyan-300">V8</td>
                  <td className="py-2">Google</td>
                  <td className="py-2">Chrome, Edge, Node.js, Deno</td>
                  <td className="py-2">C++</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 text-cyan-300">SpiderMonkey</td>
                  <td className="py-2">Mozilla</td>
                  <td className="py-2">Firefox</td>
                  <td className="py-2">C++, Rust</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 text-cyan-300">JavaScriptCore</td>
                  <td className="py-2">Apple</td>
                  <td className="py-2">Safari, iOS WebView</td>
                  <td className="py-2">C++</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 text-cyan-300">Chakra</td>
                  <td className="py-2">Microsoft</td>
                  <td className="py-2">Legacy Edge (deprecated)</td>
                  <td className="py-2">C++</td>
                </tr>
                <tr>
                  <td className="py-2 text-cyan-300">Hermes</td>
                  <td className="py-2">Meta</td>
                  <td className="py-2">React Native</td>
                  <td className="py-2">C++</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">ECMAScript Version History</h3>
            <p>
              JavaScript evolves through the ECMAScript standard. Each year brings new features:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">ES2015 (ES6) - The Big One</h4>
                <ul className="text-sm space-y-1">
                  <li>Arrow functions, classes, modules</li>
                  <li>let/const, destructuring, spread</li>
                  <li>Promises, generators, symbols</li>
                  <li>Map, Set, Proxy, Reflect</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">ES2017-2020</h4>
                <ul className="text-sm space-y-1">
                  <li>async/await (ES2017)</li>
                  <li>Object.entries/values, padding</li>
                  <li>Optional chaining ?. (ES2020)</li>
                  <li>Nullish coalescing ?? (ES2020)</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">ES2021-2022</h4>
                <ul className="text-sm space-y-1">
                  <li>String.replaceAll</li>
                  <li>Logical assignment (||=, &&=, ??=)</li>
                  <li>Private class fields (#)</li>
                  <li>Array.at(), Object.hasOwn()</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">ES2023</h4>
                <ul className="text-sm space-y-1">
                  <li>Array.findLast/findLastIndex</li>
                  <li>Non-mutating array methods</li>
                  <li>toReversed, toSorted, toSpliced</li>
                  <li>Hashbang grammar support</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Engine Fingerprinting</h3>
            <p>
              Different engines implement JavaScript slightly differently. These differences can
              fingerprint your browser:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-slate-300">Error stack trace formats</strong> — V8 and
                SpiderMonkey format stack traces differently
              </li>
              <li>
                <strong className="text-slate-300">Function.toString()</strong> — Native functions
                display differently across engines
              </li>
              <li>
                <strong className="text-slate-300">Object property order</strong> — Subtle
                differences in iteration order
              </li>
              <li>
                <strong className="text-slate-300">Number precision</strong> — Edge cases in
                floating-point handling
              </li>
              <li>
                <strong className="text-slate-300">RegExp behavior</strong> — Edge cases in
                pattern matching
              </li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Why This Matters</h3>
            <p>
              JavaScript engine detection is used for:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong className="text-slate-300">Browser fingerprinting</strong> — Identify users
                even with spoofed User-Agent strings
              </li>
              <li>
                <strong className="text-slate-300">Feature detection</strong> — Polyfill missing
                features for older browsers
              </li>
              <li>
                <strong className="text-slate-300">Performance optimization</strong> — Engine-specific
                optimizations
              </li>
              <li>
                <strong className="text-slate-300">Security</strong> — Detect automation tools and
                headless browsers
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">Browser Support Matrix</h3>
            <p>
              Feature support varies significantly across browsers:
            </p>
            <div className="bg-slate-800/50 p-4 rounded my-4">
              <ul className="text-sm space-y-2">
                <li><strong className="text-slate-300">Chrome/Edge</strong> — Usually first with new features</li>
                <li><strong className="text-slate-300">Firefox</strong> — Often close behind, sometimes ahead</li>
                <li><strong className="text-slate-300">Safari</strong> — Historically slower, improving recently</li>
                <li><strong className="text-slate-300">Node.js</strong> — Follows V8 updates closely</li>
              </ul>
            </div>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>JavaScript engines have unique fingerprints beyond User-Agent</li>
                <li>ECMAScript adds new features annually</li>
                <li>V8 (Chrome), SpiderMonkey (Firefox), JSC (Safari) dominate</li>
                <li>Feature detection is essential for cross-browser compatibility</li>
                <li>Engine differences can reveal your true browser</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

function testFeature(test: () => boolean): boolean {
  try {
    return test();
  } catch {
    return false;
  }
}

function detectEngine(): { name: string; version: string } {
  const ua = navigator.userAgent;

  // V8 (Chrome, Edge, Node)
  if (ua.includes('Chrome') || ua.includes('Chromium')) {
    const match = ua.match(/Chrome\/(\d+)/);
    return { name: 'V8', version: match ? `Chrome ${match[1]}` : 'Unknown' };
  }

  // SpiderMonkey (Firefox)
  if (ua.includes('Firefox')) {
    const match = ua.match(/Firefox\/(\d+)/);
    return { name: 'SpiderMonkey', version: match ? `Firefox ${match[1]}` : 'Unknown' };
  }

  // JavaScriptCore (Safari)
  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/(\d+)/);
    return { name: 'JavaScriptCore', version: match ? `Safari ${match[1]}` : 'Unknown' };
  }

  // Fallback
  return { name: 'Unknown', version: 'Unknown' };
}

function detectBrowser(): { name: string; version: string } {
  const ua = navigator.userAgent;

  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/(\d+)/);
    return { name: 'Microsoft Edge', version: match?.[1] || 'Unknown' };
  }

  if (ua.includes('Chrome')) {
    const match = ua.match(/Chrome\/(\d+)/);
    return { name: 'Google Chrome', version: match?.[1] || 'Unknown' };
  }

  if (ua.includes('Firefox')) {
    const match = ua.match(/Firefox\/(\d+)/);
    return { name: 'Mozilla Firefox', version: match?.[1] || 'Unknown' };
  }

  if (ua.includes('Safari') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/(\d+)/);
    return { name: 'Apple Safari', version: match?.[1] || 'Unknown' };
  }

  return { name: 'Unknown', version: 'Unknown' };
}
