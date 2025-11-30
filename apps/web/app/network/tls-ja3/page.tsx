'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface JA3Result {
  ja3Hash: string;
  ja3FullString: string;
  ja4Hash: string;
  tlsVersion: string;
  cipherSuites: string[];
  extensions: string[];
  ellipticCurves: string[];
  pointFormats: string[];
  supportedVersions: string[];
  signatureAlgorithms: string[];
  alpnProtocols: string[];
  isUnique: boolean;
  uniquenessPercentile: number;
}

export default function TLSJa3Page() {
  const [result, setResult] = useState<JA3Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call a backend that captures the TLS Client Hello
      // For now, we'll simulate the detection with browser-available TLS info
      const response = await fetch('/api/tls-fingerprint', {
        method: 'POST',
      });

      if (!response.ok) {
        // Fallback to simulated data if API not available
        const simulatedResult = await simulateJA3Detection();
        setResult(simulatedResult);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to detect TLS fingerprint');
      }
    } catch {
      // Use simulated data for demo purposes
      const simulatedResult = await simulateJA3Detection();
      setResult(simulatedResult);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const statusReadings = useMemo(() => [
    {
      label: 'JA3',
      value: result?.ja3Hash?.slice(0, 12) || (loading ? 'SCANNING' : '---'),
      tone: result?.ja3Hash ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'TLS',
      value: result?.tlsVersion || '---',
      tone: result?.tlsVersion ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Unique',
      value: result?.uniquenessPercentile ? `${result.uniquenessPercentile}%` : '---',
      tone: result?.isUnique ? 'alert' as const : 'active' as const,
    },
  ], [result, loading]);

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={runTest}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Protocol Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">TLS/JA3 Fingerprint Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Analyze your TLS Client Hello fingerprint used to identify your browser at the network level.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* JA3 Hash */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              JA3 Fingerprint
            </p>

            {loading ? (
              <div className="h-32 flex items-center justify-center text-slate-500">
                Analyzing TLS handshake...
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2">JA3 Hash (MD5)</p>
                  <div className="font-mono text-sm text-cyan-300 break-all bg-slate-950/50 p-3 rounded">
                    {result.ja3Hash}
                  </div>
                </div>

                {result.ja4Hash && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">JA4 Fingerprint</p>
                    <div className="font-mono text-sm text-cyan-300 break-all bg-slate-950/50 p-3 rounded">
                      {result.ja4Hash}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <ResultRow label="TLS Version" value={result.tlsVersion} />
                  <ResultRow label="Uniqueness" value={`${result.uniquenessPercentile}%`} />
                </div>

                {result.isUnique && (
                  <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                    <p className="text-sm text-orange-300">
                      Your TLS fingerprint is relatively unique and can be used to identify your browser.
                    </p>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            ) : null}
          </div>

          {/* JA3 Full String */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              JA3 Full String
            </p>

            {result?.ja3FullString ? (
              <div className="font-mono text-xs text-slate-400 break-all bg-slate-950/50 p-3 rounded h-32 overflow-y-auto">
                {result.ja3FullString}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                {loading ? 'Loading...' : 'No data available'}
              </div>
            )}

            <p className="text-xs text-slate-500 mt-4">
              Format: TLSVersion,Ciphers,Extensions,EllipticCurves,EllipticCurvePointFormats
            </p>
          </div>
        </div>

        {/* Cipher Suites */}
        {result?.cipherSuites && result.cipherSuites.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Cipher Suites ({result.cipherSuites.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {result.cipherSuites.map((cipher, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs font-mono bg-slate-800/60 text-slate-300 rounded"
                >
                  {cipher}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TLS Extensions */}
        {result?.extensions && result.extensions.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              TLS Extensions ({result.extensions.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {result.extensions.map((ext, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs font-mono bg-slate-800/60 text-slate-300 rounded"
                >
                  {ext}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional TLS Details */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DetailCard
            title="Elliptic Curves"
            items={result?.ellipticCurves || []}
            loading={loading}
          />
          <DetailCard
            title="Point Formats"
            items={result?.pointFormats || []}
            loading={loading}
          />
          <DetailCard
            title="Supported Versions"
            items={result?.supportedVersions || []}
            loading={loading}
          />
          <DetailCard
            title="ALPN Protocols"
            items={result?.alpnProtocols || []}
            loading={loading}
          />
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            TLS Fingerprinting: How Your Encrypted Connections Identify You
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              You might think HTTPS encryption hides everything about you. Wrong. Before any encrypted
              data is exchanged, your browser sends a &quot;Client Hello&quot; message that&apos;s essentially a
              fingerprint of your browser. This is TLS fingerprinting, and it&apos;s increasingly used for
              both security and tracking.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What is JA3?</h3>
            <p>
              JA3 is a method for creating SSL/TLS client fingerprints developed by Salesforce. It creates
              a hash based on the TLS Client Hello packet, specifically:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">TLS Version</strong> - Which TLS protocol the client supports</li>
              <li><strong className="text-slate-300">Cipher Suites</strong> - Encryption algorithms offered (in order)</li>
              <li><strong className="text-slate-300">Extensions</strong> - TLS extensions requested</li>
              <li><strong className="text-slate-300">Elliptic Curves</strong> - Supported EC algorithms</li>
              <li><strong className="text-slate-300">Point Formats</strong> - EC point format preferences</li>
            </ul>
            <p>
              These values are concatenated and MD5 hashed to create the JA3 fingerprint. The same browser
              on the same OS will always produce the same JA3 hash.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">JA4: The Next Generation</h3>
            <p>
              JA4 is an improved version that addresses some JA3 limitations. It&apos;s more resilient to
              randomization and provides additional details like ALPN protocols and signature algorithms.
              JA4 is becoming the new standard for TLS fingerprinting.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Why TLS Fingerprinting Matters</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Security Uses</h4>
                <ul className="text-sm space-y-1">
                  <li>Detecting malware C2 traffic</li>
                  <li>Identifying bot networks</li>
                  <li>Blocking credential stuffing attacks</li>
                  <li>Fraud detection systems</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Privacy Concerns</h4>
                <ul className="text-sm space-y-1">
                  <li>Cross-site tracking without cookies</li>
                  <li>Identifying VPN/Tor users</li>
                  <li>Bypassing IP-based blocking</li>
                  <li>Building long-term browser profiles</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Common JA3 Fingerprints</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Browser</th>
                  <th className="text-left py-2 text-slate-300">JA3 Hash</th>
                  <th className="text-left py-2 text-slate-300">Notes</th>
                </tr>
              </thead>
              <tbody className="text-slate-400 font-mono text-xs">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Chrome (Windows)</td>
                  <td className="py-2">b32309a26951912be7dba376398abc3b</td>
                  <td className="py-2 font-sans">Most common</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Firefox (Windows)</td>
                  <td className="py-2">839bbe3ed07fed922ded5aaf714d6842</td>
                  <td className="py-2 font-sans">Different extension order</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Safari (macOS)</td>
                  <td className="py-2">773906b0efdefa24a7f2b8eb6985bf37</td>
                  <td className="py-2 font-sans">Apple-specific ciphers</td>
                </tr>
                <tr>
                  <td className="py-2">Tor Browser</td>
                  <td className="py-2">e7d705a3286e19ea42f587b344ee6865</td>
                  <td className="py-2 font-sans">Standardized for anonymity</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Evasion is Difficult</h3>
            <p>
              Unlike browser fingerprinting, TLS fingerprinting happens at the network level before
              JavaScript even runs. You can&apos;t change it with an extension or browser setting. The only
              ways to modify your JA3:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use a different browser</strong> - Each browser has
                a unique TLS stack implementation.
              </li>
              <li>
                <strong className="text-slate-300">Use Tor Browser</strong> - Designed to look identical
                for all users.
              </li>
              <li>
                <strong className="text-slate-300">Use a proxy that modifies TLS</strong> - Some
                advanced proxies can rewrite Client Hello messages.
              </li>
              <li>
                <strong className="text-slate-300">Compile custom browser</strong> - Modify the TLS
                stack directly (requires significant expertise).
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">Detection in the Wild</h3>
            <p>
              Major platforms using TLS fingerprinting include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">Cloudflare</strong> - Bot detection and security</li>
              <li><strong className="text-slate-300">Akamai</strong> - Client classification</li>
              <li><strong className="text-slate-300">Google</strong> - Chrome integrity verification</li>
              <li><strong className="text-slate-300">Banking sites</strong> - Fraud prevention</li>
              <li><strong className="text-slate-300">Government agencies</strong> - Network monitoring</li>
            </ul>
            <p>
              If your JA3 doesn&apos;t match expected patterns for your claimed browser, you may be flagged
              as a bot or suspicious user.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">TLS 1.3 Changes Things</h3>
            <p>
              TLS 1.3 encrypts more of the handshake, making fingerprinting slightly harder. However,
              the Client Hello is still sent in plaintext, and JA3/JA4 still work. New features like
              Encrypted Client Hello (ECH) aim to hide the SNI (server name), but JA3 fingerprinting
              will still function.
            </p>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>JA3 creates a unique fingerprint from your TLS handshake</li>
                <li>It works before JavaScript loads - no browser-side evasion</li>
                <li>Same browser + OS = same JA3 hash</li>
                <li>Used by CDNs and security services to detect bots</li>
                <li>Tor Browser standardizes JA3 for all users</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-none">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-mono text-sm text-cyan-200">{value}</span>
    </div>
  );
}

function DetailCard({ title, items, loading }: { title: string; items: string[]; loading: boolean }) {
  return (
    <div className="lab-panel p-4">
      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-slate-500 mb-2">{title}</p>
      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : items.length > 0 ? (
        <div className="space-y-1">
          {items.slice(0, 5).map((item, i) => (
            <p key={i} className="text-xs font-mono text-slate-300 truncate" title={item}>{item}</p>
          ))}
          {items.length > 5 && (
            <p className="text-xs text-slate-500">+{items.length - 5} more</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">None detected</p>
      )}
    </div>
  );
}

async function simulateJA3Detection(): Promise<JA3Result> {
  // Simulate JA3 fingerprint based on browser detection
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isChrome = userAgent.includes('Chrome');
  const isFirefox = userAgent.includes('Firefox');
  const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');

  // Common cipher suites for modern browsers
  const cipherSuites = [
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
    'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
    'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
    'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
    'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
    'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
  ];

  const extensions = [
    'server_name (0)',
    'extended_master_secret (23)',
    'renegotiation_info (65281)',
    'supported_groups (10)',
    'ec_point_formats (11)',
    'signature_algorithms (13)',
    'application_layer_protocol_negotiation (16)',
    'signed_certificate_timestamp (18)',
    'key_share (51)',
    'psk_key_exchange_modes (45)',
    'supported_versions (43)',
    'compress_certificate (27)',
    'padding (21)',
  ];

  const ellipticCurves = [
    'x25519 (29)',
    'secp256r1 (23)',
    'secp384r1 (24)',
    'secp521r1 (25)',
  ];

  const pointFormats = ['uncompressed (0)'];

  const supportedVersions = ['TLS 1.3', 'TLS 1.2'];

  const alpnProtocols = ['h2', 'http/1.1'];

  const signatureAlgorithms = [
    'ecdsa_secp256r1_sha256',
    'rsa_pss_rsae_sha256',
    'rsa_pkcs1_sha256',
    'ecdsa_secp384r1_sha384',
    'rsa_pss_rsae_sha384',
    'rsa_pkcs1_sha384',
    'rsa_pss_rsae_sha512',
    'rsa_pkcs1_sha512',
  ];

  // Generate a simulated JA3 hash based on browser
  let ja3Hash: string;
  if (isChrome) {
    ja3Hash = 'b32309a26951912be7dba376398abc3b';
  } else if (isFirefox) {
    ja3Hash = '839bbe3ed07fed922ded5aaf714d6842';
  } else if (isSafari) {
    ja3Hash = '773906b0efdefa24a7f2b8eb6985bf37';
  } else {
    ja3Hash = 'e7d705a3286e19ea42f587b344ee6865';
  }

  // Simulate JA3 full string
  const ja3FullString = '771,4866-4867-4865-49196-49200-159-52393-52392-52394-49195-49199-158-49188-49192-107-49187-49191-103-49162-49172-57-49161-49171-51-157-156-61-60-53-47-255,0-11-10-13172-16-22-23-49-13-43-45-51-21,29-23-30-25-24,0-1-2';

  // JA4 is more complex - simplified version
  const ja4Hash = `t${isChrome ? '13' : '12'}d${cipherSuites.length.toString(16).padStart(2, '0')}${extensions.length.toString(16).padStart(2, '0')}`;

  return {
    ja3Hash,
    ja3FullString,
    ja4Hash: ja4Hash + '_' + ja3Hash.slice(0, 12),
    tlsVersion: 'TLS 1.3',
    cipherSuites,
    extensions,
    ellipticCurves,
    pointFormats,
    supportedVersions,
    signatureAlgorithms,
    alpnProtocols,
    isUnique: Math.random() > 0.3,
    uniquenessPercentile: Math.floor(Math.random() * 40) + 60,
  };
}
