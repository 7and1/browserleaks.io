'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Activity,
  ChevronDown,
  Fingerprint,
  Globe,
  Menu,
  Shield,
  Cpu,
  Atom,
  X,
  Zap,
  FileSearch,
  Lock,
  Wrench,
} from 'lucide-react';

const navItems = [
  {
    label: 'Tests',
    items: [
      { label: 'IP Leak Test', href: '/tests/ip-leak', icon: Globe, description: 'Detect IP address exposure' },
      { label: 'DNS Leak Test', href: '/tests/dns-leak', icon: Shield, description: 'Check DNS resolver privacy' },
      { label: 'WebRTC Leak Test', href: '/tests/webrtc-leak', icon: Activity, description: 'Find WebRTC vulnerabilities' },
    ],
  },
  {
    label: 'Fingerprints',
    items: [
      { label: 'Canvas Fingerprint', href: '/fingerprints/canvas', icon: Fingerprint, description: 'HTML5 Canvas tracking' },
      { label: 'WebGL Fingerprint', href: '/fingerprints/webgl', icon: Cpu, description: 'GPU rendering signature' },
      { label: 'Font Detection', href: '/fingerprints/fonts', icon: FileSearch, description: 'Installed fonts analysis' },
      { label: 'Client Rects', href: '/fingerprints/client-rects', icon: FileSearch, description: 'Element dimension tracking' },
    ],
  },
  {
    label: 'Network',
    items: [
      { label: 'IP & DNS', href: '/network/ip-dns', icon: Globe, description: 'Network identity analysis' },
      { label: 'HTTP Headers', href: '/network/http-headers', icon: FileSearch, description: 'Request header exposure' },
      { label: 'TLS/JA3', href: '/network/tls-ja3', icon: Lock, description: 'TLS fingerprinting' },
      { label: 'WebRTC', href: '/network/webrtc', icon: Activity, description: 'Real-time connection leaks' },
    ],
  },
  {
    label: 'Hardware',
    items: [
      { label: 'GPU Info', href: '/hardware/gpu', icon: Cpu, description: 'Graphics hardware detection' },
      { label: 'Audio Context', href: '/hardware/audio', icon: Zap, description: 'Audio processing fingerprint' },
      { label: 'Battery Status', href: '/hardware/battery', icon: Zap, description: 'Power API exposure' },
      { label: 'Motion Sensors', href: '/hardware/motion', icon: Activity, description: 'Accelerometer & gyroscope' },
    ],
  },
  {
    label: 'Modern APIs',
    items: [
      { label: 'Bluetooth', href: '/modern-apis/bluetooth', icon: Atom, description: 'Web Bluetooth access' },
      { label: 'USB Devices', href: '/modern-apis/usb', icon: Cpu, description: 'WebUSB enumeration' },
      { label: 'MIDI', href: '/modern-apis/midi', icon: Zap, description: 'MIDI device detection' },
      { label: 'Clipboard', href: '/modern-apis/clipboard', icon: FileSearch, description: 'Clipboard API access' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Password Generator', href: '/tools/password', icon: Lock, description: 'Secure password creation' },
      { label: 'MAC Lookup', href: '/tools/mac-lookup', icon: Globe, description: 'MAC address vendor lookup' },
      { label: 'JavaScript Test', href: '/tools/javascript', icon: FileSearch, description: 'JS environment detection' },
    ],
  },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] border-b border-slate-800/50'
          : 'bg-transparent'
      }`}
    >
      {/* Animated gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 no-underline">
            <div className="relative">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 blur transition-opacity group-hover:opacity-100" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-slate-100 tracking-tight">
                BrowserLeaks<span className="text-cyan-400">.io</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Privacy Testing Lab
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    activeDropdown === item.label
                      ? 'text-cyan-300 bg-cyan-500/10'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      activeDropdown === item.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute left-0 top-full pt-2 transition-all ${
                    activeDropdown === item.label
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="w-72 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="p-2">
                      {item.items.map((subItem) => {
                        const Icon = subItem.icon;
                        const isActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`group flex items-start gap-3 rounded-lg px-3 py-3 transition-all no-underline ${
                              isActive
                                ? 'bg-cyan-500/15 text-cyan-200'
                                : 'hover:bg-slate-800/70 text-slate-300 hover:text-slate-100'
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-cyan-300'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{subItem.label}</span>
                              <span className="text-xs text-slate-500">{subItem.description}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 px-4 py-2 text-sm font-medium text-cyan-200 transition-all hover:from-cyan-500/30 hover:to-blue-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] no-underline"
            >
              <Zap className="h-4 w-4" />
              <span>Full Scan</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all overflow-hidden ${
          mobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-slate-800/60 bg-slate-950/98 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="space-y-2">
              {navItems.map((group) => (
                <div key={group.label} className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors no-underline ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-200'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 px-4 py-3 text-sm font-medium text-cyan-200 transition-all no-underline"
              >
                <Zap className="h-4 w-4" />
                Start Full Privacy Scan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
