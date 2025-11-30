'use client';

import { useEffect, useState } from 'react';
import { useIPDetect } from '@/hooks/useIPDetect';

export function IPLeakTest() {
  const { data, loading, error, detect } = useIPDetect();
  const [customIP, setCustomIP] = useState('');

  // Auto-detect on mount
  useEffect(() => {
    detect();
  }, [detect]);

  const handleCustomDetect = (e: React.FormEvent) => {
    e.preventDefault();
    if (customIP.trim()) {
      detect(customIP.trim());
    }
  };

  const getRiskLevelColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRiskLevelBg = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getRiskLevelText = (score: number): string => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    if (score >= 40) return 'High Risk';
    return 'Critical Risk';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">IP Leak Test</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Check if your real IP address is exposed through various methods
        </p>
      </div>

      {/* Custom IP Detection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleCustomDetect} className="flex gap-4">
          <input
            type="text"
            value={customIP}
            onChange={(e) => setCustomIP(e.target.value)}
            placeholder="Enter IP address to check..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !customIP.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Check'}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Main IP Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Your IP Address
              </div>
              <div className="text-5xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-2">
                {data.ip}
              </div>
              <div className="inline-flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                  {data.version.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Reputation Score */}
          <div className={`rounded-lg shadow-md p-6 ${getRiskLevelBg(data.reputation.score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Reputation Score</h3>
                <p className={`text-3xl font-bold ${getRiskLevelColor(data.reputation.score)}`}>
                  {data.reputation.score}/100
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${getRiskLevelColor(data.reputation.score)} font-semibold`}>
                {getRiskLevelText(data.reputation.score)}
              </div>
            </div>
          </div>

          {/* Geographic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Geographic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Country" value={`${data.geo.country} (${data.geo.countryCode})`} />
              <InfoItem label="City" value={data.geo.city} />
              <InfoItem label="Region" value={data.geo.region} />
              <InfoItem label="Timezone" value={data.geo.timezone} />
              <InfoItem label="Coordinates" value={`${data.geo.latitude}, ${data.geo.longitude}`} />
              {data.geo.postalCode && (
                <InfoItem label="Postal Code" value={data.geo.postalCode} />
              )}
            </div>
          </div>

          {/* Network Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Network Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="ISP" value={data.network.isp} />
              <InfoItem label="ASN" value={data.network.asn} />
              <InfoItem label="Organization" value={data.network.organization} />
            </div>
          </div>

          {/* Privacy Indicators */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Privacy Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <PrivacyFlag label="Proxy" active={data.privacy.isProxy} />
              <PrivacyFlag label="VPN" active={data.privacy.isVPN} />
              <PrivacyFlag label="Datacenter" active={data.privacy.isDatacenter} />
              <PrivacyFlag label="Tor" active={data.privacy.isTor} />
              <PrivacyFlag label="Relay" active={data.privacy.isRelay} />
            </div>
          </div>

          {/* Blacklist Status */}
          {data.reputation.isBlacklisted && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                IP Blacklisted
              </h3>
              <p className="text-red-700 dark:text-red-300">
                This IP address appears on one or more blacklists and may be associated with malicious activity.
              </p>
              {data.reputation.categories.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.reputation.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-4 border-blue-500 pl-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="font-medium text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function PrivacyFlag({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`
      flex flex-col items-center justify-center p-4 rounded-lg border-2
      ${active
        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
        : 'border-green-500 bg-green-50 dark:bg-green-900/20'
      }
    `}>
      <div className={`
        text-2xl mb-2
        ${active ? 'text-red-600' : 'text-green-600'}
      `}>
        {active ? '✗' : '✓'}
      </div>
      <div className={`
        text-sm font-medium text-center
        ${active ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}
      `}>
        {label}
      </div>
    </div>
  );
}
