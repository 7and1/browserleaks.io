'use client';

import Link from 'next/link';
import {
  Github,
  Twitter,
  Mail,
  Shield,
  Globe,
  Fingerprint,
  Cpu,
  Lock,
  Heart,
  ExternalLink,
} from 'lucide-react';

const footerLinks = {
  tests: {
    title: 'Privacy Tests',
    links: [
      { label: 'IP Leak Test', href: '/tests/ip-leak' },
      { label: 'DNS Leak Test', href: '/tests/dns-leak' },
      { label: 'WebRTC Leak Test', href: '/tests/webrtc-leak' },
      { label: 'Full Privacy Scan', href: '/dashboard' },
    ],
  },
  fingerprints: {
    title: 'Fingerprinting',
    links: [
      { label: 'Canvas Fingerprint', href: '/fingerprints/canvas' },
      { label: 'WebGL Fingerprint', href: '/fingerprints/webgl' },
      { label: 'Font Detection', href: '/fingerprints/fonts' },
      { label: 'Audio Fingerprint', href: '/tests/audio-fingerprint' },
    ],
  },
  network: {
    title: 'Network Analysis',
    links: [
      { label: 'HTTP Headers', href: '/network/http-headers' },
      { label: 'TLS/JA3 Fingerprint', href: '/network/tls-ja3' },
      { label: 'WebRTC Analysis', href: '/network/webrtc' },
      { label: 'IP & DNS Info', href: '/network/ip-dns' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Privacy Guide', href: '/guide', external: false },
      { label: 'API Documentation', href: '/api-docs', external: false },
      { label: 'GitHub', href: 'https://github.com/browserleaks', external: true },
      { label: 'Contact Us', href: 'mailto:privacy@browserleaks.io', external: true },
    ],
  },
};

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/browserleaks', icon: Github },
  { label: 'Twitter', href: 'https://twitter.com/browserleaks', icon: Twitter },
  { label: 'Email', href: 'mailto:privacy@browserleaks.io', icon: Mail },
];

const stats = [
  { icon: Shield, value: '30+', label: 'Privacy Tests' },
  { icon: Globe, value: '100K+', label: 'Monthly Scans' },
  { icon: Fingerprint, value: '99.2%', label: 'Detection Rate' },
  { icon: Lock, value: '100%', label: 'Free Forever' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-slate-800/60 bg-slate-950">
      {/* Gradient top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Stats Section */}
      <div className="border-b border-slate-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 py-8 lg:grid-cols-4 lg:gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4 lg:p-6 border border-slate-800/40 transition-all hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]"
                >
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-cyan-500/5 to-blue-500/5 blur-2xl transition-transform group-hover:scale-150" />
                  <div className="relative flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 lg:h-12 lg:w-12">
                      <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-100 lg:text-3xl">{stat.value}</div>
                      <div className="text-xs text-slate-500 lg:text-sm">{stat.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-6 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="group inline-flex items-center gap-3 no-underline">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 blur transition-opacity group-hover:opacity-100" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                    <Shield className="h-6 w-6 text-cyan-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-semibold text-slate-100 tracking-tight">
                    BrowserLeaks<span className="text-cyan-400">.io</span>
                  </span>
                  <span className="text-xs uppercase tracking-[0.15em] text-slate-500">
                    Privacy Testing Lab
                  </span>
                </div>
              </Link>

              <p className="mt-6 text-sm leading-relaxed text-slate-400 max-w-sm">
                Comprehensive browser privacy testing platform. Detect IP leaks, DNS leaks, WebRTC vulnerabilities,
                and browser fingerprinting techniques that can track you online.
              </p>

              {/* Social Links */}
              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/80 border border-slate-800/60 text-slate-400 transition-all hover:border-cyan-500/40 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Links Sections */}
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {'external' in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-cyan-400 no-underline"
                        >
                          {link.label}
                          <ExternalLink className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-slate-500 transition-colors hover:text-cyan-400 no-underline"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/40 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span>&copy; {currentYear} BrowserLeaks.io</span>
              <span className="hidden sm:inline">|</span>
              <Link href="/privacy" className="transition-colors hover:text-cyan-400 no-underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-cyan-400 no-underline">
                Terms of Service
              </Link>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-rose-500 fill-rose-500 animate-pulse" />
              <span>for privacy advocates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
    </footer>
  );
}
