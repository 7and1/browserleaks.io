'use client';

interface Capability {
  label: string;
  status: 'active' | 'guarded' | 'unsupported';
  detail: string;
}

const capabilityChecks: Array<{ label: string; check: () => Capability }>= [
  {
    label: 'Web Bluetooth',
    check: () => ({
      label: 'Web Bluetooth',
      status: 'bluetooth' in navigator ? 'active' : 'unsupported',
      detail: 'bluetooth' in navigator ? 'Adapter exposed to JS' : 'Not available',
    }),
  },
  {
    label: 'Web USB',
    check: () => ({
      label: 'Web USB',
      status: 'usb' in navigator ? 'active' : 'unsupported',
      detail: 'usb' in navigator ? 'Devices can be enumerated' : 'Not available',
    }),
  },
  {
    label: 'Web MIDI',
    check: () => ({
      label: 'Web MIDI',
      status: 'requestMIDIAccess' in navigator ? 'active' : 'unsupported',
      detail: 'requestMIDIAccess' in navigator ? 'Potential hardware leak' : 'Not available',
    }),
  },
  {
    label: 'Clipboard',
    check: () => ({
      label: 'Clipboard',
      status: navigator.clipboard ? 'active' : 'guarded',
      detail: navigator.clipboard ? 'Read/write gated by permission' : 'Requires user gesture',
    }),
  },
];

const tone: Record<Capability['status'], string> = {
  active: 'border-orange-500/40 bg-orange-500/10 text-orange-200',
  guarded: 'border-cyan-400/40 bg-cyan-500/5 text-cyan-200',
  unsupported: 'border-slate-800 text-slate-400',
};

export function ApiScannerGrid() {
  const capabilities = capabilityChecks.map((item) => item.check());

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {capabilities.map((cap) => (
        <div key={cap.label} className={`rounded-sm border px-4 py-3 text-sm ${tone[cap.status]}`}>
          <div className="flex items-center justify-between">
            <span>{cap.label}</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em]">{cap.status}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">{cap.detail}</p>
        </div>
      ))}
    </div>
  );
}
