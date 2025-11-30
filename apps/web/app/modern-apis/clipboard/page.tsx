'use client';

import { useState, useCallback, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface ClipboardCapabilities {
  readSupported: boolean;
  writeSupported: boolean;
  readTextSupported: boolean;
  writeTextSupported: boolean;
  permissionStatus?: 'granted' | 'denied' | 'prompt';
}

export default function ClipboardAPIPage() {
  const [capabilities, setCapabilities] = useState<ClipboardCapabilities | null>(null);
  const [clipboardContent, setClipboardContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testText, setTestText] = useState('BrowserLeaks.io Test - ' + new Date().toISOString());

  const checkCapabilities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        setCapabilities({
          readSupported: false,
          writeSupported: false,
          readTextSupported: false,
          writeTextSupported: false,
        });
        return;
      }

      const caps: ClipboardCapabilities = {
        readSupported: 'read' in navigator.clipboard,
        writeSupported: 'write' in navigator.clipboard,
        readTextSupported: 'readText' in navigator.clipboard,
        writeTextSupported: 'writeText' in navigator.clipboard,
      };

      // Check permission status
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({
            name: 'clipboard-read' as PermissionName,
          });
          caps.permissionStatus = permission.state;
        } catch {
          // Permission query not supported for clipboard
        }
      }

      setCapabilities(caps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check clipboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const readClipboard = useCallback(async () => {
    setError(null);

    try {
      const text = await navigator.clipboard.readText();
      setClipboardContent(text);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Clipboard read permission denied');
        } else {
          setError(err.message);
        }
      }
    }
  }, []);

  const writeClipboard = useCallback(async () => {
    setError(null);

    try {
      await navigator.clipboard.writeText(testText);
      setClipboardContent(testText);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, [testText]);

  useState(() => {
    checkCapabilities();
  });

  const statusReadings = useMemo(() => [
    {
      label: 'Read',
      value: capabilities?.readTextSupported ? 'AVAILABLE' : 'BLOCKED',
      tone: capabilities?.readTextSupported ? 'alert' as const : 'active' as const,
    },
    {
      label: 'Write',
      value: capabilities?.writeTextSupported ? 'AVAILABLE' : 'BLOCKED',
      tone: capabilities?.writeTextSupported ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Permission',
      value: capabilities?.permissionStatus?.toUpperCase() || 'UNKNOWN',
      tone: capabilities?.permissionStatus === 'granted' ? 'alert' as const : 'active' as const,
    },
  ], [capabilities]);

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={checkCapabilities}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">API Exploits</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Clipboard API Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Test clipboard read/write access that can expose copied data or inject malicious content.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Clipboard Capabilities
            </p>

            <div className="space-y-3">
              <CapabilityRow
                label="clipboard.read()"
                supported={capabilities?.readSupported}
              />
              <CapabilityRow
                label="clipboard.write()"
                supported={capabilities?.writeSupported}
              />
              <CapabilityRow
                label="clipboard.readText()"
                supported={capabilities?.readTextSupported}
              />
              <CapabilityRow
                label="clipboard.writeText()"
                supported={capabilities?.writeTextSupported}
              />

              {capabilities?.permissionStatus && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded">
                  <p className="text-xs text-slate-500 mb-1">Permission Status</p>
                  <p className={`text-lg font-mono ${
                    capabilities.permissionStatus === 'granted' ? 'text-orange-400' :
                    capabilities.permissionStatus === 'denied' ? 'text-red-400' : 'text-cyan-400'
                  }`}>
                    {capabilities.permissionStatus.toUpperCase()}
                  </p>
                </div>
              )}

              {capabilities?.readTextSupported && (
                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    Clipboard read is available. Websites can potentially access your copied data.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Clipboard Test
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-2 block">Test Text to Write</label>
                <input
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={writeClipboard}
                  disabled={!capabilities?.writeTextSupported}
                  className="py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded transition-colors text-sm"
                >
                  Write to Clipboard
                </button>
                <button
                  onClick={readClipboard}
                  disabled={!capabilities?.readTextSupported}
                  className="py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white rounded transition-colors text-sm"
                >
                  Read from Clipboard
                </button>
              </div>

              {clipboardContent !== null && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2">Clipboard Content</p>
                  <div className="p-3 bg-slate-950 border border-slate-700 rounded max-h-32 overflow-y-auto">
                    <pre className="text-xs text-cyan-300 whitespace-pre-wrap break-all">
                      {clipboardContent || '(empty)'}
                    </pre>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Clipboard API: Reading Your Copied Data
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              The Clipboard API lets websites read from and write to your system clipboard.
              While convenient for legitimate use cases, clipboard access raises serious
              privacy and security concerns.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Privacy Risks</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Clipboard Reading Risks</h4>
                <ul className="text-sm space-y-1">
                  <li>Passwords copied from managers</li>
                  <li>Credit card numbers</li>
                  <li>Private messages or emails</li>
                  <li>Cryptocurrency wallet addresses</li>
                  <li>2FA codes and OTPs</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-red-300 font-medium mb-2">Clipboard Writing Risks</h4>
                <ul className="text-sm space-y-1">
                  <li>Crypto address replacement attacks</li>
                  <li>Malicious URL injection</li>
                  <li>Command injection via copy-paste</li>
                  <li>Overwriting important data</li>
                  <li>Phishing content injection</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">The Clipboard Hijacking Attack</h3>
            <p>
              One notorious attack involves cryptocurrency. When you copy a wallet address, malicious
              websites can detect this (addresses follow patterns) and replace it with the attacker&apos;s
              address. When you paste, you send funds to the wrong wallet.
            </p>
            <div className="bg-slate-900 p-4 rounded font-mono text-sm my-4">
              <p className="text-slate-500">{`// You copy:`}</p>
              <p className="text-cyan-300">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
              <p className="text-slate-500 mt-2">{`// Malicious site replaces with:`}</p>
              <p className="text-red-300">bc1qattacker9address8here7xyz123456</p>
            </div>
            <p>
              Millions of dollars have been stolen through clipboard hijacking attacks.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Browser Protections</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Browser</th>
                  <th className="text-left py-2 text-slate-300">Read Permission</th>
                  <th className="text-left py-2 text-slate-300">Write Permission</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Chrome</td>
                  <td className="py-2 text-orange-400">User prompt</td>
                  <td className="py-2 text-cyan-400">User gesture only</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Firefox</td>
                  <td className="py-2 text-orange-400">User prompt</td>
                  <td className="py-2 text-cyan-400">User gesture only</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Safari</td>
                  <td className="py-2 text-cyan-400">More restricted</td>
                  <td className="py-2 text-cyan-400">User gesture only</td>
                </tr>
                <tr>
                  <td className="py-2">Tor Browser</td>
                  <td className="py-2 text-cyan-400">Blocked by default</td>
                  <td className="py-2 text-cyan-400">Limited</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Understanding Permissions</h3>
            <p>
              Modern browsers require user permission for clipboard read:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">prompt</strong> - User will be asked when site requests access</li>
              <li><strong className="text-slate-300">granted</strong> - Site has permanent clipboard access</li>
              <li><strong className="text-slate-300">denied</strong> - Site is blocked from reading clipboard</li>
            </ul>
            <p>
              Write access typically only requires a user gesture (click, keypress) rather than
              explicit permission, which is why clipboard hijacking attacks work.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Deny clipboard permissions</strong> - Never grant
                clipboard read access to untrusted sites.
              </li>
              <li>
                <strong className="text-slate-300">Clear clipboard after sensitive copies</strong> -
                Don&apos;t leave passwords or keys in clipboard.
              </li>
              <li>
                <strong className="text-slate-300">Verify pasted content</strong> - Always check
                wallet addresses and URLs before using.
              </li>
              <li>
                <strong className="text-slate-300">Use password manager autofill</strong> - Avoid
                copy-paste for sensitive data.
              </li>
              <li>
                <strong className="text-slate-300">Use Tor Browser</strong> - More restrictive
                clipboard policies.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Clipboard read exposes copied passwords and sensitive data</li>
                <li>Write access enables clipboard hijacking attacks</li>
                <li>Always verify pasted wallet addresses and URLs</li>
                <li>Deny clipboard permissions to untrusted sites</li>
                <li>Clear clipboard after copying sensitive information</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

function CapabilityRow({ label, supported }: { label: string; supported?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-none">
      <span className="text-sm text-slate-400 font-mono">{label}</span>
      <span className={`text-sm font-mono ${
        supported === undefined ? 'text-slate-500' :
        supported ? 'text-orange-400' : 'text-slate-500'
      }`}>
        {supported === undefined ? 'CHECKING' : supported ? 'AVAILABLE' : 'NOT AVAILABLE'}
      </span>
    </div>
  );
}
