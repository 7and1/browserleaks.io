'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Atom,
  Cpu,
  Fingerprint,
  Radar,
  ShieldCheck,
} from 'lucide-react';

const navSections = [
  {
    title: 'Control',
    items: [
      {
        label: 'Central Dashboard',
        href: '/dashboard',
        icon: Activity,
        detail: 'Leak score + live telemetry',
      },
      {
        label: 'Quick Audit',
        href: '/tests',
        icon: Radar,
        detail: '20+ probes',
      },
    ],
  },
  {
    title: 'Identity Lab',
    items: [
      { label: 'Fingerprint Studio', href: '/fingerprints', icon: Fingerprint, detail: 'Canvas · WebGL · Fonts' },
    ],
  },
  {
    title: 'Network Lab',
    items: [
      { label: 'Protocol Range', href: '/network', icon: ShieldCheck, detail: 'Traceroute · JA3 · LAN' },
    ],
  },
  {
    title: 'Hardware Lab',
    items: [
      { label: 'Sensor Telemetry', href: '/hardware', icon: Cpu, detail: 'Motion · Battery · Audio' },
    ],
  },
  {
    title: 'Modern API Lab',
    items: [
      { label: 'Surface Scanner', href: '/modern-apis', icon: Atom, detail: 'Bluetooth · USB · Permissions' },
    ],
  },
];

export function LabDock() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-slate-800/60 bg-slate-950/90 backdrop-blur-xl">
      <div className="px-6 pt-8 pb-4">
        <div className="text-[0.65rem] uppercase tracking-[0.5em] text-cyan-400/70">The Lab</div>
        <div className="mt-3 text-xl font-semibold text-slate-100">BrowserLeaks.io</div>
        <p className="mt-1 text-xs text-slate-400">Modern Privacy Penetration Lab</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="px-4 text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
              {section.title}
            </div>
            <div className="mt-3 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-sm px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-200 shadow-lab-glow-cyan border border-cyan-400/40'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      {item.detail && (
                        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-300">
                          {item.detail}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-4 pb-6 text-xs text-slate-500">
        v0.1 • Cloudflare All-in architecture
      </div>
    </aside>
  );
}
