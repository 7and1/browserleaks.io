'use client';

import { useWebRTCDetect } from '@/hooks/useWebRTCDetect';

export function WebRTCLeakTest() {
  const { data, loading, error, progress, detect } = useWebRTCDetect();

  const getNATTypeColor = (natType: string) => {
    if (natType === 'relay') return 'text-green-600';
    if (natType === 'srflx') return 'text-orange-600';
    return 'text-blue-600';
  };

  const getRiskColor = (level: string) => {
    if (level === 'low') return 'text-green-600';
    if (level === 'medium') return 'text-yellow-600';
    if (level === 'high') return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">WebRTC Leak Test</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Check for IP leaks through WebRTC connections
        </p>
        <button
          onClick={detect}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? `Loading... ${progress}%` : 'Start Scan'}
        </button>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Leak Status */}
          <div className={`rounded-lg shadow-lg p-6 ${
            data.isLeak ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  WebRTC Leak Status
                </h3>
                <p className={`text-3xl font-bold ${data.isLeak ? 'text-red-600' : 'text-green-600'}`}>
                  {data.isLeak ? '⚠️ Leak Detected' : '✅ No Leak'}
                </p>
              </div>
              <div className="text-6xl">
                {data.isLeak ? '⚠️' : '✅'}
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                NAT Type
              </div>
              <div className={`text-2xl font-bold ${getNATTypeColor(data.natType)}`}>
                {data.natType.toUpperCase()}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Risk Level
              </div>
              <div className={`text-2xl font-bold ${getRiskColor(data.riskLevel)}`}>
                {data.riskLevel.toUpperCase()}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                STUN Servers
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {data.stunResults.length}
              </div>
            </div>
          </div>

          {/* Local IPs */}
          {data.localIPs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">
                Local IPs ({data.localIPs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.localIPs.map((ip, idx) => (
                  <div key={idx} className="font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded">
                    {ip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public IPs */}
          {data.publicIPs.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">
                Public IPs ({data.publicIPs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.publicIPs.map((ip, idx) => (
                  <div key={idx} className="font-mono bg-orange-100 dark:bg-orange-900/20 p-3 rounded border-2 border-orange-500">
                    {ip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STUN Results */}
          {data.stunResults.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">
                STUN Server Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.stunResults.map((result, idx) => (
                  <div key={idx} className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <div className="font-semibold text-lg mb-2">{result.server}</div>
                    <div className="font-mono text-sm">{result.ip}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {result.country}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leak Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-lg p-4 ${
              data.mdnsLeak ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">mDNS Leak</span>
                <span className="text-2xl">{data.mdnsLeak ? '✗' : '✓'}</span>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${
              data.ipv6Leak ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">IPv6 Leak</span>
                <span className="text-2xl">{data.ipv6Leak ? '✗' : '✓'}</span>
              </div>
            </div>
          </div>

          {/* Risks */}
          {data.risks.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-200">
                ⚠️ Vulnerabilities
              </h3>
              <div className="space-y-3">
                {data.risks.map((risk, idx) => (
                  <div key={idx} className="border-l-4 border-red-500 pl-4">
                    <div className="font-semibold text-red-900 dark:text-red-100">
                      {risk.title}
                    </div>
                    <div className="text-sm text-red-800 dark:text-red-200 mt-1">
                      {risk.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">
                💡 Recommendations
              </h3>
              <ul className="space-y-2">
                {data.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-blue-900 dark:text-blue-100">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Educational Content */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          WebRTC Leaks: The VPN-Killing Bug in Your Browser
        </h2>

        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-6">
          <p className="text-xl text-gray-800 dark:text-gray-200">
            Here&apos;s a mind-blowing fact: even if you&apos;re using a VPN, your real IP address might
            be exposed right now. Not because of a VPN failure. Not because of a DNS leak. But
            because of a feature built directly into your browser called WebRTC. Let me explain
            why this is one of the most dangerous privacy vulnerabilities on the web.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            What Is WebRTC? The Video Call Protocol
          </h3>
          <p>
            WebRTC (Web Real-Time Communication) is a browser technology that enables peer-to-peer
            communication directly between browsers. It powers:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Video calls (Google Meet, Zoom web client, Discord)</li>
            <li>Voice chat in browser games</li>
            <li>Peer-to-peer file sharing</li>
            <li>Live streaming to viewers</li>
          </ul>
          <p>
            The problem? To establish these direct connections, WebRTC needs to discover your
            real IP address - and it does this even when you&apos;re connected to a VPN.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            How WebRTC Leaks Your IP Address
          </h3>
          <p>
            Here&apos;s the technical breakdown of why WebRTC is such a privacy nightmare:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>A website includes JavaScript that creates an RTCPeerConnection object</li>
            <li>WebRTC uses STUN (Session Traversal Utilities for NAT) servers to discover your IP</li>
            <li>STUN servers help find the best path for peer-to-peer connections</li>
            <li>This process reveals both your local IP (192.168.x.x) AND your public IP</li>
            <li>The VPN tunnel is completely bypassed - WebRTC makes direct OS-level network calls</li>
          </ol>
          <p>
            The killer detail? This happens silently in the background. No permissions asked.
            No notifications. Just your IP address handed over to any website that asks.
          </p>

          <div className="my-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IP Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Example</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">What It Reveals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Local IP (host)</td>
                  <td className="px-6 py-4 text-sm font-mono">192.168.1.105</td>
                  <td className="px-6 py-4 text-sm">Your device on the local network</td>
                  <td className="px-6 py-4 text-sm font-semibold text-yellow-600">Medium</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Public IP (srflx)</td>
                  <td className="px-6 py-4 text-sm font-mono">73.158.42.218</td>
                  <td className="px-6 py-4 text-sm">Your real IP, bypassing VPN</td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">Critical</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">mDNS Address</td>
                  <td className="px-6 py-4 text-sm font-mono">abc123.local</td>
                  <td className="px-6 py-4 text-sm">Device hostname, sometimes real name</td>
                  <td className="px-6 py-4 text-sm font-semibold text-orange-600">Medium-High</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">IPv6 Address</td>
                  <td className="px-6 py-4 text-sm font-mono">2600:1700:...</td>
                  <td className="px-6 py-4 text-sm">Unique identifier, often static</td>
                  <td className="px-6 py-4 text-sm font-semibold text-red-600">High</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            The Discovery: When WebRTC Leaks Went Public
          </h3>
          <p>
            WebRTC leaks were first publicly documented by Daniel Roesler in January 2015. His
            proof-of-concept demo showed that even users behind a VPN could have their real IP
            addresses exposed. The security community was shocked - this wasn&apos;t a bug, it was
            working as designed.
          </p>
          <p>
            The fallout was significant:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-gray-900 dark:text-white">VPN providers scrambled</strong> to add WebRTC leak protection</li>
            <li><strong className="text-gray-900 dark:text-white">Browser extension developers</strong> created WebRTC blockers</li>
            <li><strong className="text-gray-900 dark:text-white">Firefox added</strong> the ability to disable WebRTC in about:config</li>
            <li><strong className="text-gray-900 dark:text-white">Privacy advocates</strong> added WebRTC tests to their standard checks</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            WebRTC Leak Statistics
          </h3>
          <p>
            According to research from VPN testing organizations:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-gray-900 dark:text-white">23%</strong> of VPN users are affected by WebRTC leaks (2023 study)</li>
            <li><strong className="text-gray-900 dark:text-white">70%</strong> of browsers have WebRTC enabled by default</li>
            <li><strong className="text-gray-900 dark:text-white">85%</strong> of users don&apos;t know WebRTC can leak their IP</li>
            <li><strong className="text-gray-900 dark:text-white">Free VPNs</strong> are 3x more likely to have WebRTC leaks than paid VPNs</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            NAT Types Explained
          </h3>
          <p>
            The &quot;NAT Type&quot; shown in WebRTC tests reveals how your network is configured:
          </p>
          <div className="grid md:grid-cols-2 gap-6 my-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Host</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Direct connection with no NAT. Your device has a public IP. Most exposed configuration.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Server Reflexive (srflx)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Behind NAT, but public IP is discoverable via STUN. Most common configuration.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Peer Reflexive (prflx)</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Address learned during connection. Indicates symmetric NAT with some openings.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-bold text-green-800 dark:text-green-300 mb-3">Relay</h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                Traffic goes through a TURN server. Your real IP is hidden. Most private configuration.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            The mDNS Problem: Hostname Leaks
          </h3>
          <p>
            Even if your IP is protected, WebRTC can leak your mDNS hostname. This is the name
            your device uses on the local network, like &quot;Johns-MacBook-Pro.local&quot;. This reveals:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your name (if you used your real name in the hostname)</li>
            <li>Your device type (MacBook, Windows, etc.)</li>
            <li>A unique identifier that persists across VPN connections</li>
          </ul>
          <p>
            Some browsers now generate random mDNS identifiers to prevent this leak, but not all.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            How to Fix WebRTC Leaks
          </h3>
          <ol className="list-decimal pl-6 space-y-3">
            <li>
              <strong className="text-gray-900 dark:text-white">Firefox: Disable WebRTC</strong>
              <p className="text-sm mt-1">
                Go to <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">about:config</code>, search for
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded ml-1">media.peerconnection.enabled</code>, set to <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">false</code>.
              </p>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Chrome: Use an Extension</strong>
              <p className="text-sm mt-1">
                Chrome doesn&apos;t allow disabling WebRTC natively. Install &quot;WebRTC Leak Prevent&quot; or &quot;uBlock Origin&quot;
                (which has WebRTC blocking options).
              </p>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Brave: Built-in Protection</strong>
              <p className="text-sm mt-1">
                Go to Settings → Privacy → WebRTC IP Handling Policy → &quot;Disable non-proxied UDP&quot;.
              </p>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">VPN with WebRTC Protection</strong>
              <p className="text-sm mt-1">
                Quality VPNs (Mullvad, NordVPN, ExpressVPN) include browser extensions that block WebRTC leaks.
              </p>
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Tor Browser</strong>
              <p className="text-sm mt-1">
                WebRTC is completely disabled in Tor Browser. The gold standard for privacy.
              </p>
            </li>
          </ol>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            Browser WebRTC Comparison
          </h3>
          <div className="overflow-x-auto my-6">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Browser</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">WebRTC Default</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Can Disable?</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">mDNS Protection</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Chrome</td>
                  <td className="px-6 py-4 text-sm">Enabled</td>
                  <td className="px-6 py-4 text-sm text-red-600">Extension only</td>
                  <td className="px-6 py-4 text-sm">Partial</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Firefox</td>
                  <td className="px-6 py-4 text-sm">Enabled</td>
                  <td className="px-6 py-4 text-sm text-green-600">Yes (about:config)</td>
                  <td className="px-6 py-4 text-sm">Yes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Safari</td>
                  <td className="px-6 py-4 text-sm">Enabled</td>
                  <td className="px-6 py-4 text-sm text-yellow-600">Limited</td>
                  <td className="px-6 py-4 text-sm">Yes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Brave</td>
                  <td className="px-6 py-4 text-sm">Enabled</td>
                  <td className="px-6 py-4 text-sm text-green-600">Yes (settings)</td>
                  <td className="px-6 py-4 text-sm">Yes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold">Tor Browser</td>
                  <td className="px-6 py-4 text-sm text-green-600">Disabled</td>
                  <td className="px-6 py-4 text-sm">N/A</td>
                  <td className="px-6 py-4 text-sm">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            The Trade-Off: Privacy vs. Functionality
          </h3>
          <p>
            Disabling WebRTC means video calls and voice chat won&apos;t work in your browser. You&apos;ll
            need to choose:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-gray-900 dark:text-white">Maximum privacy:</strong> Disable WebRTC entirely, use dedicated apps for video calls</li>
            <li><strong className="text-gray-900 dark:text-white">Balanced approach:</strong> Use a VPN extension that prevents leaks but allows WebRTC to function</li>
            <li><strong className="text-gray-900 dark:text-white">Situational:</strong> Enable WebRTC only when needed, disable otherwise</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">
            The Bottom Line
          </h3>
          <p>
            WebRTC leaks are one of the most insidious privacy threats because they bypass all
            your other protections. You can have the best VPN, encrypted DNS, and a privacy-focused
            browser - and WebRTC can still expose your real IP with a few lines of JavaScript.
          </p>
          <p>
            The fix is simple: test for WebRTC leaks regularly, use a browser that lets you
            control WebRTC, and consider dedicated apps for video calls instead of browser-based
            solutions. Your privacy is worth the minor inconvenience.
          </p>

          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3">WebRTC Privacy Facts</h4>
            <ul className="text-sm space-y-2 text-blue-700 dark:text-blue-400">
              <li>• WebRTC bypasses VPNs by making direct OS-level network calls</li>
              <li>• 23% of VPN users have WebRTC leaks they don&apos;t know about</li>
              <li>• Your local IP, public IP, and hostname can all be leaked</li>
              <li>• Firefox, Brave, and Tor Browser allow disabling WebRTC</li>
              <li>• Chrome requires an extension to prevent WebRTC leaks</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
