'use client';

import { useState, useCallback, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface MACResult {
  mac: string;
  normalized: string;
  oui: string;
  vendor: string;
  isValid: boolean;
  type: 'unicast' | 'multicast';
  scope: 'global' | 'local';
}

// Common MAC OUI prefixes (first 3 bytes identify manufacturer)
// In production, this would be a full IEEE OUI database
const OUI_DATABASE: Record<string, string> = {
  '00:00:0C': 'Cisco Systems',
  '00:1A:2B': 'Ayecom Technology',
  '00:1B:63': 'Apple, Inc.',
  '00:1E:C2': 'Apple, Inc.',
  '00:21:E9': 'Apple, Inc.',
  '00:23:12': 'Apple, Inc.',
  '00:23:32': 'Apple, Inc.',
  '00:23:DF': 'Apple, Inc.',
  '00:24:36': 'Apple, Inc.',
  '00:25:00': 'Apple, Inc.',
  '00:25:BC': 'Apple, Inc.',
  '00:26:08': 'Apple, Inc.',
  '00:26:4A': 'Apple, Inc.',
  '00:26:B0': 'Apple, Inc.',
  '00:26:BB': 'Apple, Inc.',
  '00:50:56': 'VMware, Inc.',
  '00:0C:29': 'VMware, Inc.',
  '00:05:69': 'VMware, Inc.',
  '00:1C:14': 'VMware, Inc.',
  '08:00:27': 'Oracle VirtualBox',
  '52:54:00': 'QEMU/KVM',
  '00:15:5D': 'Microsoft Hyper-V',
  '00:03:FF': 'Microsoft Corporation',
  'AC:DE:48': 'Private',
  '00:1A:11': 'Google, Inc.',
  '3C:5A:B4': 'Google, Inc.',
  '94:EB:2C': 'Google, Inc.',
  'F4:F5:D8': 'Google, Inc.',
  '00:17:C8': 'Kyocera',
  'B8:27:EB': 'Raspberry Pi Foundation',
  'DC:A6:32': 'Raspberry Pi Foundation',
  'E4:5F:01': 'Raspberry Pi Foundation',
  '28:CD:C1': 'Raspberry Pi Foundation',
  '00:24:E8': 'Dell Inc.',
  '00:21:9B': 'Dell Inc.',
  '00:14:22': 'Dell Inc.',
  '18:A9:05': 'Hewlett Packard',
  '00:1E:0B': 'Hewlett Packard',
  '00:25:B3': 'Hewlett Packard',
  'F0:92:1C': 'Hewlett Packard Enterprise',
  '00:1F:29': 'Hewlett Packard Enterprise',
  'FC:15:B4': 'Hewlett Packard Enterprise',
  '00:0A:E4': 'Broadcom',
  '00:10:18': 'Broadcom',
  '00:0D:0B': 'Buffalo Inc.',
  '00:1D:73': 'Buffalo Inc.',
  '00:24:A5': 'Buffalo Inc.',
  '30:B5:C2': 'TP-Link Technologies',
  '50:C7:BF': 'TP-Link Technologies',
  'C0:25:E9': 'TP-Link Technologies',
  'D8:0D:17': 'TP-Link Technologies',
  '00:0F:66': 'Cisco-Linksys',
  '00:18:39': 'Cisco-Linksys',
  '00:1A:70': 'Cisco-Linksys',
  '00:23:69': 'Cisco-Linksys',
  '00:1E:58': 'D-Link Corporation',
  '00:22:B0': 'D-Link Corporation',
  '00:26:5A': 'D-Link Corporation',
  '28:10:7B': 'D-Link Corporation',
  '00:04:4B': 'NVIDIA Corporation',
  '00:1B:21': 'Intel Corporate',
  '00:15:17': 'Intel Corporate',
  '00:16:EA': 'Intel Corporate',
  '00:1C:C0': 'Intel Corporate',
  '00:1E:65': 'Intel Corporate',
  '00:22:FA': 'Intel Corporate',
  '00:24:D6': 'Intel Corporate',
  '00:27:10': 'Intel Corporate',
  '3C:A9:F4': 'Intel Corporate',
  '4C:79:6E': 'Intel Corporate',
  '60:02:B4': 'Intel Corporate',
  '88:53:2E': 'Intel Corporate',
  'A4:C4:94': 'Intel Corporate',
  'AC:7B:A1': 'Intel Corporate',
  'B4:AE:2B': 'Intel Corporate',
  'E8:B1:FC': 'Intel Corporate',
  '00:1B:77': 'Intel Corporate',
  '00:13:E8': 'Intel Corporate',
  '7C:5C:F8': 'Intel Corporate',
  '94:65:9C': 'Intel Corporate',
  '00:0E:35': 'Intel Corporate',
  '00:02:B3': 'Intel Corporate',
  '08:00:20': 'Oracle Corporation',
  '00:1C:7E': 'Toshiba',
  '78:E4:00': 'Hon Hai Precision (Foxconn)',
  '00:26:22': 'Compal Electronics',
  '00:1B:38': 'Compal Electronics',
  '00:1E:33': 'Inventec Corporation',
  '00:1F:16': 'Wistron Corporation',
  '00:22:19': 'Dell Inc.',
  '00:25:64': 'Dell Inc.',
  '14:FE:B5': 'Dell Inc.',
  '18:03:73': 'Dell Inc.',
  '18:66:DA': 'Dell Inc.',
  '18:A9:9B': 'Dell Inc.',
  '18:DB:F2': 'Dell Inc.',
  '24:6E:96': 'Dell Inc.',
  '28:F1:0E': 'Dell Inc.',
  '34:17:EB': 'Dell Inc.',
  '4C:76:25': 'Dell Inc.',
  '50:9A:4C': 'Dell Inc.',
  '54:9F:35': 'Dell Inc.',
  '74:86:7A': 'Dell Inc.',
  '78:2B:CB': 'Dell Inc.',
  '84:7B:EB': 'Dell Inc.',
  '98:90:96': 'Dell Inc.',
  'B0:83:FE': 'Dell Inc.',
  'B8:CA:3A': 'Dell Inc.',
  'D4:BE:D9': 'Dell Inc.',
  'D8:9E:F3': 'Dell Inc.',
  'E4:11:5B': 'Dell Inc.',
  'F0:1F:AF': 'Dell Inc.',
  'F4:8E:38': 'Dell Inc.',
  'F8:B1:56': 'Dell Inc.',
  'F8:BC:12': 'Dell Inc.',
  '00:16:3E': 'Xensource, Inc.',
  '00:1C:42': 'Parallels, Inc.',
  '08:00:2B': 'Digital Equipment Corporation',
  '00:10:5A': 'Cisco Systems',
  '00:17:94': 'Cisco Systems',
  '00:18:B9': 'Cisco Systems',
  '00:19:2F': 'Cisco Systems',
  '00:1A:A1': 'Cisco Systems',
  '00:1B:0C': 'Cisco Systems',
  '00:1C:57': 'Cisco Systems',
  '00:1D:45': 'Cisco Systems',
  '00:1E:13': 'Cisco Systems',
  '00:1E:7D': 'Cisco Systems',
  '00:1F:27': 'Cisco Systems',
  '00:1F:9D': 'Cisco Systems',
  '00:21:1B': 'Cisco Systems',
  '00:21:A0': 'Cisco Systems',
  '00:22:0D': 'Cisco Systems',
  '00:22:6B': 'Cisco Systems',
  '00:22:BD': 'Cisco Systems',
  '00:23:04': 'Cisco Systems',
  '00:23:5D': 'Cisco Systems',
  '00:23:AB': 'Cisco Systems',
  '00:24:50': 'Cisco Systems',
  '00:24:97': 'Cisco Systems',
  '00:24:C4': 'Cisco Systems',
  '00:24:F7': 'Cisco Systems',
  '00:25:45': 'Cisco Systems',
  '00:25:83': 'Cisco Systems',
  '00:25:B4': 'Cisco Systems',
  '00:26:0A': 'Cisco Systems',
  '00:26:51': 'Cisco Systems',
  '00:26:98': 'Cisco Systems',
  '00:26:CB': 'Cisco Systems',
  '00:27:0D': 'Cisco Systems',
  '04:62:73': 'Cisco Systems',
  '28:94:0F': 'Cisco Systems',
  '34:62:88': 'Cisco Systems',
  '58:8D:09': 'Cisco Systems',
  '60:2A:D0': 'Cisco Systems',
  '84:B8:02': 'Cisco Systems',
  'A8:9D:21': 'Cisco Systems',
  'B8:38:61': 'Cisco Systems',
  'C4:01:7C': 'Cisco Systems',
  'E8:04:62': 'Cisco Systems',
  'F0:29:29': 'Cisco Systems',
  'F8:C2:88': 'Cisco Systems',
  'FC:5B:39': 'Cisco Systems',
  '38:C9:86': 'Apple, Inc.',
  '40:33:1A': 'Apple, Inc.',
  '54:26:96': 'Apple, Inc.',
  '58:55:CA': 'Apple, Inc.',
  '64:20:0C': 'Apple, Inc.',
  '78:31:C1': 'Apple, Inc.',
  '88:C6:63': 'Apple, Inc.',
  '98:01:A7': 'Apple, Inc.',
  'A4:5E:60': 'Apple, Inc.',
  'AC:87:A3': 'Apple, Inc.',
  'B8:E8:56': 'Apple, Inc.',
  'C8:2A:14': 'Apple, Inc.',
  'D0:23:DB': 'Apple, Inc.',
  'E0:B9:BA': 'Apple, Inc.',
  'F0:DC:E2': 'Apple, Inc.',
  '00:17:F2': 'Apple, Inc.',
  '00:19:E3': 'Apple, Inc.',
  '00:1C:B3': 'Apple, Inc.',
  '00:1D:4F': 'Apple, Inc.',
  '00:1E:52': 'Apple, Inc.',
  '00:1F:5B': 'Apple, Inc.',
  '00:1F:F3': 'Apple, Inc.',
  '00:22:41': 'Apple, Inc.',
  '00:23:6C': 'Apple, Inc.',
  '00:24:2C': 'Apple, Inc.',
  '00:25:4B': 'Apple, Inc.',
  '00:26:B6': 'Apple, Inc.',
  '04:0C:CE': 'Apple, Inc.',
  '04:15:52': 'Apple, Inc.',
  '04:26:65': 'Apple, Inc.',
  '04:48:9A': 'Apple, Inc.',
  '04:54:53': 'Apple, Inc.',
  '04:D3:CF': 'Apple, Inc.',
  '04:DB:56': 'Apple, Inc.',
  '04:E5:36': 'Apple, Inc.',
  '04:F1:3E': 'Apple, Inc.',
  '04:F7:E4': 'Apple, Inc.',
  '08:00:07': 'Apple, Inc.',
  '08:6D:41': 'Apple, Inc.',
  '10:1C:0C': 'Apple, Inc.',
  '10:40:F3': 'Apple, Inc.',
  '10:93:E9': 'Apple, Inc.',
  '10:94:BB': 'Apple, Inc.',
  '10:9A:DD': 'Apple, Inc.',
  '10:DD:B1': 'Apple, Inc.',
  '14:10:9F': 'Apple, Inc.',
  '14:5A:05': 'Apple, Inc.',
  '14:8F:C6': 'Apple, Inc.',
  '14:99:E2': 'Apple, Inc.',
  '18:20:32': 'Apple, Inc.',
  '18:34:51': 'Apple, Inc.',
  '18:65:90': 'Apple, Inc.',
  '18:9E:FC': 'Apple, Inc.',
  '18:AF:61': 'Apple, Inc.',
  '18:AF:8F': 'Apple, Inc.',
  '18:E7:F4': 'Apple, Inc.',
  '18:EE:69': 'Apple, Inc.',
  '18:F6:43': 'Apple, Inc.',
  '1C:1A:C0': 'Apple, Inc.',
  '1C:36:BB': 'Apple, Inc.',
  '1C:5C:F2': 'Apple, Inc.',
  '1C:9E:46': 'Apple, Inc.',
  '1C:AB:A7': 'Apple, Inc.',
  '1C:E6:2B': 'Apple, Inc.',
  '20:3C:AE': 'Apple, Inc.',
  '20:78:F0': 'Apple, Inc.',
  '20:7D:74': 'Apple, Inc.',
  '20:A2:E4': 'Apple, Inc.',
  '20:AB:37': 'Apple, Inc.',
  '20:C9:D0': 'Apple, Inc.',
  '24:1E:EB': 'Apple, Inc.',
  '24:24:0E': 'Apple, Inc.',
  '24:5B:A7': 'Apple, Inc.',
  '24:A0:74': 'Apple, Inc.',
  '24:A2:E1': 'Apple, Inc.',
  '24:AB:81': 'Apple, Inc.',
  '24:E3:14': 'Apple, Inc.',
  '24:F0:94': 'Apple, Inc.',
  '28:0B:5C': 'Apple, Inc.',
  '28:37:37': 'Apple, Inc.',
  '28:6A:B8': 'Apple, Inc.',
  '28:6A:BA': 'Apple, Inc.',
  '28:A0:2B': 'Apple, Inc.',
  '28:CF:DA': 'Apple, Inc.',
  '28:CF:E9': 'Apple, Inc.',
  '28:E0:2C': 'Apple, Inc.',
  '28:E1:4C': 'Apple, Inc.',
  '28:E7:CF': 'Apple, Inc.',
  '28:ED:6A': 'Apple, Inc.',
  '28:F0:76': 'Apple, Inc.',
  '2C:20:0B': 'Apple, Inc.',
  '2C:33:61': 'Apple, Inc.',
  '2C:3A:E8': 'Apple, Inc.',
  '2C:54:CF': 'Apple, Inc.',
  '2C:B4:3A': 'Apple, Inc.',
  '2C:BE:08': 'Apple, Inc.',
  '2C:F0:A2': 'Apple, Inc.',
  '2C:F0:EE': 'Apple, Inc.',
  '30:10:E4': 'Apple, Inc.',
  '30:35:AD': 'Apple, Inc.',
  '30:63:6B': 'Apple, Inc.',
  '30:90:AB': 'Apple, Inc.',
  '30:F7:C5': 'Apple, Inc.',
  '34:08:BC': 'Apple, Inc.',
  '34:12:98': 'Apple, Inc.',
  '34:15:9E': 'Apple, Inc.',
  '34:36:3B': 'Apple, Inc.',
  '34:51:C9': 'Apple, Inc.',
  '34:A3:95': 'Apple, Inc.',
  '34:AB:37': 'Apple, Inc.',
  '34:C0:59': 'Apple, Inc.',
  '34:E2:FD': 'Apple, Inc.',
  '38:0F:4A': 'Apple, Inc.',
  '38:48:4C': 'Apple, Inc.',
  '38:53:9C': 'Apple, Inc.',
  '38:66:F0': 'Apple, Inc.',
  '38:71:DE': 'Apple, Inc.',
  '38:B5:4D': 'Apple, Inc.',
  '38:CA:DA': 'Apple, Inc.',
  '00:50:F2': 'Microsoft Corporation',
  '00:12:5A': 'Microsoft Corporation',
  '00:17:FA': 'Microsoft Corporation',
  '00:1D:D8': 'Microsoft Corporation',
  '00:22:48': 'Microsoft Corporation',
  '00:25:AE': 'Microsoft Corporation',
  '00:27:FA': 'Microsoft Corporation',
  '28:18:78': 'Microsoft Corporation',
  '30:59:B7': 'Microsoft Corporation',
  '34:E1:2D': 'Microsoft Corporation',
  '48:50:73': 'Microsoft Corporation',
  '50:1A:C5': 'Microsoft Corporation',
  '58:82:A8': 'Microsoft Corporation',
  '60:45:BD': 'Microsoft Corporation',
  '7C:1E:52': 'Microsoft Corporation',
  '7C:ED:8D': 'Microsoft Corporation',
  '84:EF:18': 'Microsoft Corporation',
  '98:5F:D3': 'Microsoft Corporation',
  'B4:0E:DE': 'Microsoft Corporation',
  'B8:31:B5': 'Microsoft Corporation',
  'C4:9D:ED': 'Microsoft Corporation',
  'C8:3F:26': 'Microsoft Corporation',
  'D4:AE:52': 'Microsoft Corporation',
  'D8:36:66': 'Microsoft Corporation',
  'DC:B4:C4': 'Microsoft Corporation',
  'EC:83:50': 'Microsoft Corporation',
  'F4:8C:50': 'Microsoft Corporation',
  '00:1D:EA': 'Samsung Electronics',
  '00:21:4C': 'Samsung Electronics',
  '00:23:D6': 'Samsung Electronics',
  '00:24:54': 'Samsung Electronics',
  '00:26:37': 'Samsung Electronics',
  '5C:0A:5B': 'Samsung Electronics',
  '84:25:DB': 'Samsung Electronics',
  '94:63:D1': 'Samsung Electronics',
  'A0:82:1F': 'Samsung Electronics',
  'BC:44:86': 'Samsung Electronics',
  'C4:57:6E': 'Samsung Electronics',
  'CC:07:AB': 'Samsung Electronics',
  'D0:59:E4': 'Samsung Electronics',
  'D4:88:90': 'Samsung Electronics',
  'E4:7C:F9': 'Samsung Electronics',
  'F0:E7:7E': 'Samsung Electronics',
  'F4:7B:5E': 'Samsung Electronics',
  'FC:A1:3E': 'Samsung Electronics',
  '10:D5:42': 'Samsung Electronics',
  '14:49:E0': 'Samsung Electronics',
  '18:22:7E': 'Samsung Electronics',
  '1C:66:AA': 'Samsung Electronics',
  '24:4B:81': 'Samsung Electronics',
  '28:CC:01': 'Samsung Electronics',
  '2C:AE:2B': 'Samsung Electronics',
  '30:19:66': 'Samsung Electronics',
  '34:23:87': 'Samsung Electronics',
  '38:01:97': 'Samsung Electronics',
  '3C:62:00': 'Samsung Electronics',
  '40:0E:85': 'Samsung Electronics',
  '44:4E:1A': 'Samsung Electronics',
  '48:44:F7': 'Samsung Electronics',
  '4C:3C:16': 'Samsung Electronics',
  '50:01:BB': 'Samsung Electronics',
  '50:F0:D3': 'Samsung Electronics',
  '54:40:AD': 'Samsung Electronics',
  '58:C3:8B': 'Samsung Electronics',
  '5C:E8:EB': 'Samsung Electronics',
  '60:AF:6D': 'Samsung Electronics',
  '64:77:91': 'Samsung Electronics',
  '68:48:98': 'Samsung Electronics',
  '6C:F3:73': 'Samsung Electronics',
  '70:F9:27': 'Samsung Electronics',
  '74:45:8A': 'Samsung Electronics',
  '78:52:1A': 'Samsung Electronics',
  '7C:0B:C6': 'Samsung Electronics',
  '80:65:6D': 'Samsung Electronics',
  '84:38:38': 'Samsung Electronics',
  '88:32:9B': 'Samsung Electronics',
  '8C:77:12': 'Samsung Electronics',
  '90:18:7C': 'Samsung Electronics',
  '94:35:0A': 'Samsung Electronics',
  '98:39:8E': 'Samsung Electronics',
  '9C:02:98': 'Samsung Electronics',
  'A0:21:95': 'Samsung Electronics',
  'A4:07:B6': 'Samsung Electronics',
  'A8:06:00': 'Samsung Electronics',
  'AC:5F:3E': 'Samsung Electronics',
  'B0:47:BF': 'Samsung Electronics',
  'B4:07:F9': 'Samsung Electronics',
  'B8:5A:73': 'Samsung Electronics',
  'BC:14:01': 'Samsung Electronics',
  'C0:BD:D1': 'Samsung Electronics',
  'C4:73:1E': 'Samsung Electronics',
  'C8:BA:94': 'Samsung Electronics',
  'D0:17:6A': 'Samsung Electronics',
  'D4:87:D8': 'Samsung Electronics',
  'D8:E0:E1': 'Samsung Electronics',
  'E0:99:71': 'Samsung Electronics',
  'E4:12:1D': 'Samsung Electronics',
  'E8:50:8B': 'Samsung Electronics',
  'EC:1F:72': 'Samsung Electronics',
  'F0:5A:09': 'Samsung Electronics',
  'F4:42:8F': 'Samsung Electronics',
  'F8:04:2E': 'Samsung Electronics',
  'FC:F1:36': 'Samsung Electronics',
};

export default function MACLookupPage() {
  const [macInput, setMacInput] = useState('');
  const [result, setResult] = useState<MACResult | null>(null);
  const [history, setHistory] = useState<MACResult[]>([]);

  const normalizeMac = useCallback((mac: string): string => {
    // Remove all non-hex characters and convert to uppercase
    const cleaned = mac.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    if (cleaned.length !== 12) return '';

    // Format as XX:XX:XX:XX:XX:XX
    return cleaned.match(/.{2}/g)?.join(':') || '';
  }, []);

  const lookupMac = useCallback((mac: string) => {
    const normalized = normalizeMac(mac);

    if (!normalized) {
      setResult({
        mac,
        normalized: '',
        oui: '',
        vendor: 'Invalid MAC address',
        isValid: false,
        type: 'unicast',
        scope: 'global',
      });
      return;
    }

    // Extract OUI (first 3 octets)
    const oui = normalized.split(':').slice(0, 3).join(':');

    // Look up vendor
    const vendor = OUI_DATABASE[oui] || 'Unknown Manufacturer';

    // Determine if unicast or multicast (LSB of first byte)
    const firstByte = parseInt(normalized.split(':')[0], 16);
    const isMulticast = (firstByte & 0x01) === 1;

    // Determine if globally unique or locally administered (second LSB of first byte)
    const isLocallyAdministered = (firstByte & 0x02) === 2;

    const lookupResult: MACResult = {
      mac,
      normalized,
      oui,
      vendor,
      isValid: true,
      type: isMulticast ? 'multicast' : 'unicast',
      scope: isLocallyAdministered ? 'local' : 'global',
    };

    setResult(lookupResult);

    // Add to history (avoid duplicates)
    setHistory(prev => {
      const exists = prev.some(h => h.normalized === normalized);
      if (exists) return prev;
      return [lookupResult, ...prev].slice(0, 10);
    });
  }, [normalizeMac]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (macInput.trim()) {
      lookupMac(macInput.trim());
    }
  }, [macInput, lookupMac]);

  const statusReadings = useMemo(() => [
    {
      label: 'Status',
      value: result?.isValid ? 'VALID' : result ? 'INVALID' : '---',
      tone: result?.isValid ? 'active' as const : 'alert' as const,
    },
    {
      label: 'Type',
      value: result?.type?.toUpperCase() || '---',
      tone: 'neutral' as const,
    },
    {
      label: 'Scope',
      value: result?.scope?.toUpperCase() || '---',
      tone: result?.scope === 'local' ? 'alert' as const : 'neutral' as const,
    },
  ], [result]);

  return (
    <LabShell statusReadings={statusReadings}>
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Utility Kit</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">MAC Address Lookup</h1>
          <p className="mt-2 text-sm text-slate-400">
            Identify device manufacturers from MAC addresses using the IEEE OUI database.
            <span className="text-cyan-400 ml-1">Offline lookup — no network requests.</span>
          </p>
        </header>

        <div className="lab-panel p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
            Enter MAC Address
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <input
                type="text"
                value={macInput}
                onChange={(e) => setMacInput(e.target.value)}
                placeholder="00:1A:2B:3C:4D:5E or 001A2B3C4D5E"
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded text-lg text-slate-200 font-mono focus:border-cyan-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
              >
                Lookup
              </button>
            </div>
          </form>

          <p className="text-xs text-slate-500 mt-2">
            Formats accepted: 00:1A:2B:3C:4D:5E, 00-1A-2B-3C-4D-5E, 001A.2B3C.4D5E, 001A2B3C4D5E
          </p>
        </div>

        {result && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                Lookup Result
              </p>

              {result.isValid ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-800/50 rounded">
                    <p className="text-xs text-slate-500 mb-1">Manufacturer</p>
                    <p className="text-xl text-cyan-300">{result.vendor}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-800/40 rounded">
                      <p className="text-xs text-slate-500 mb-1">OUI Prefix</p>
                      <p className="text-sm text-slate-200 font-mono">{result.oui}</p>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded">
                      <p className="text-xs text-slate-500 mb-1">Normalized</p>
                      <p className="text-sm text-slate-200 font-mono">{result.normalized}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded ${
                      result.type === 'multicast' ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-slate-800/40'
                    }`}>
                      <p className="text-xs text-slate-500 mb-1">Address Type</p>
                      <p className={`text-sm ${result.type === 'multicast' ? 'text-orange-300' : 'text-slate-200'}`}>
                        {result.type === 'multicast' ? '📢 Multicast' : '📍 Unicast'}
                      </p>
                    </div>
                    <div className={`p-3 rounded ${
                      result.scope === 'local' ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-slate-800/40'
                    }`}>
                      <p className="text-xs text-slate-500 mb-1">Scope</p>
                      <p className={`text-sm ${result.scope === 'local' ? 'text-orange-300' : 'text-slate-200'}`}>
                        {result.scope === 'local' ? '🏠 Locally Administered' : '🌐 Globally Unique'}
                      </p>
                    </div>
                  </div>

                  {result.scope === 'local' && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                      <p className="text-xs text-orange-300">
                        This appears to be a locally administered address (LAA). The OUI lookup
                        may not reflect the actual manufacturer. Common for VMs and spoofed addresses.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-sm text-red-300">
                    Invalid MAC address format. Please enter a valid 12-digit hexadecimal address.
                  </p>
                </div>
              )}
            </div>

            <div className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                Lookup History
              </p>

              {history.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setMacInput(item.normalized);
                        setResult(item);
                      }}
                      className="w-full p-3 bg-slate-800/40 hover:bg-slate-800/60 rounded text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cyan-300 font-mono">{item.normalized}</span>
                        <span className="text-xs text-slate-500">{item.vendor}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
                  No lookup history yet
                </div>
              )}
            </div>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            MAC Addresses: Your Network&apos;s Serial Numbers
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Every network device has a MAC (Media Access Control) address — a unique identifier
              burned into its hardware. It&apos;s like a serial number for your network interface.
              Understanding MAC addresses is fundamental to network security and forensics.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Anatomy of a MAC Address</h3>
            <p>
              A MAC address is 48 bits (6 bytes), typically written as six pairs of hexadecimal digits:
            </p>
            <div className="bg-slate-900 p-4 rounded font-mono text-sm my-4">
              <div className="flex items-center justify-center gap-2 text-lg">
                <span className="text-cyan-400">00:1A:2B</span>
                <span className="text-slate-500">:</span>
                <span className="text-orange-400">3C:4D:5E</span>
              </div>
              <div className="flex justify-center gap-8 mt-2 text-xs">
                <span className="text-cyan-400">OUI (Vendor)</span>
                <span className="text-orange-400">NIC Specific</span>
              </div>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">First 3 bytes (OUI)</strong> — Organizationally Unique Identifier, assigned by IEEE to manufacturers</li>
              <li><strong className="text-slate-300">Last 3 bytes</strong> — Assigned by the manufacturer, unique per device</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Special Address Types</h3>
            <p>
              The first byte contains two important flags:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Unicast vs Multicast (Bit 0)</h4>
                <p className="text-sm">
                  <strong className="text-slate-300">0</strong> = Unicast (single destination)<br />
                  <strong className="text-slate-300">1</strong> = Multicast (multiple destinations)
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Example: FF:FF:FF:FF:FF:FF is the broadcast address
                </p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Global vs Local (Bit 1)</h4>
                <p className="text-sm">
                  <strong className="text-slate-300">0</strong> = Globally unique (manufacturer assigned)<br />
                  <strong className="text-slate-300">1</strong> = Locally administered (manually set)
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  VMs and spoofed addresses often use local addresses
                </p>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Major Manufacturers by OUI</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">OUI Range</th>
                  <th className="text-left py-2 text-slate-300">Manufacturer</th>
                  <th className="text-left py-2 text-slate-300">Typical Devices</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">00:50:56, 00:0C:29</td>
                  <td className="py-2">VMware</td>
                  <td className="py-2">Virtual machines</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">08:00:27</td>
                  <td className="py-2">Oracle VirtualBox</td>
                  <td className="py-2">Virtual machines</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">00:1B:21, 88:53:2E</td>
                  <td className="py-2">Intel</td>
                  <td className="py-2">Ethernet adapters, WiFi</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">38:C9:86, 64:20:0C</td>
                  <td className="py-2">Apple</td>
                  <td className="py-2">iPhones, Macs, iPads</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">B8:27:EB, DC:A6:32</td>
                  <td className="py-2">Raspberry Pi</td>
                  <td className="py-2">Pi computers</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono">00:00:0C, 00:1B:0C</td>
                  <td className="py-2">Cisco</td>
                  <td className="py-2">Routers, switches</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Security Implications</h3>
            <p>
              MAC addresses have important security considerations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-slate-300">Tracking</strong> — Your device&apos;s MAC can be
                used to track your movements (WiFi probe requests)
              </li>
              <li>
                <strong className="text-slate-300">Network access control</strong> — Many networks
                use MAC filtering (easily bypassed by spoofing)
              </li>
              <li>
                <strong className="text-slate-300">Device identification</strong> — Network admins
                use MAC to identify devices on the network
              </li>
              <li>
                <strong className="text-slate-300">Forensics</strong> — MAC addresses in logs can
                help trace network activity
              </li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">MAC Randomization</h3>
            <p>
              Modern devices implement MAC randomization to prevent tracking:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">iOS 14+</strong> — Random MAC per network by default</li>
              <li><strong className="text-slate-300">Android 10+</strong> — Random MAC per network</li>
              <li><strong className="text-slate-300">Windows 10+</strong> — Optional per-network randomization</li>
              <li><strong className="text-slate-300">macOS Sequoia+</strong> — Private WiFi addressing</li>
            </ul>
            <p>
              Randomized addresses use the &quot;locally administered&quot; bit, so they&apos;re
              identifiable as non-manufacturer addresses.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Spoofing MAC Addresses</h3>
            <p>
              MAC addresses can be changed in software. This is useful for:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Privacy protection (prevent tracking)</li>
              <li>Bypassing MAC-based access controls</li>
              <li>Network testing and security research</li>
              <li>Cloning a device&apos;s identity</li>
            </ol>
            <div className="bg-slate-900 p-4 rounded font-mono text-sm my-4">
              <p className="text-slate-500"># Linux</p>
              <p className="text-cyan-300">ip link set dev eth0 address XX:XX:XX:XX:XX:XX</p>
              <p className="text-slate-500 mt-2"># macOS</p>
              <p className="text-cyan-300">sudo ifconfig en0 ether XX:XX:XX:XX:XX:XX</p>
            </div>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>First 3 bytes (OUI) identify the manufacturer</li>
                <li>MAC addresses can be spoofed — don&apos;t rely on them for security</li>
                <li>Modern devices randomize MACs for privacy</li>
                <li>Locally administered addresses (bit 1 set) aren&apos;t from manufacturers</li>
                <li>VMs have distinctive OUI prefixes (VMware, VirtualBox, Hyper-V)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}
