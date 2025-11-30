# BrowserLeaks.io

> **Next-Generation Browser Privacy Detection Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

**Live Demo**: https://browserleaks.io (Coming Soon)
**API Docs**: https://api.browserleaks.io/v1/docs (Coming Soon)

---

## 🎯 Project Vision

BrowserLeaks.io is built to **surpass all existing browser privacy testing tools** (browserleaks.com, browserscan.net) by providing:

- **30+ Leak Detection Tests** - Most comprehensive privacy testing suite
- **Intelligent Privacy Scoring** - AI-driven 0-100 privacy score with actionable insights
- **Modern UI/UX** - Next.js 15 + React 19, fully responsive, PWA-enabled
- **API Service** - RESTful API for developers and enterprises
- **Educational Content** - Deep-dive articles, videos, and best practices
- **Open Source** - Transparent, community-driven development

---

## ✨ Key Features

### Phase 1: MVP (In Development)

**Core Detection Tests**:
1. ✅ **IP Leak Test** - Multi-source IP verification with geolocation, ASN, reputation scoring
2. ✅ **DNS Leak Test** - 4-source DNS leak detection (ip-api.com EDNS + SurfShark)
3. ✅ **WebRTC Leak Test** - Local/public IP exposure via RTCPeerConnection with 4 STUN servers
4. ✅ **Privacy Score Dashboard** - Real-time 0-100 privacy scoring with AI-driven analysis
5. 🚧 Canvas Fingerprint - Canvas 2D rendering analysis (Planned)
6. 🚧 WebGL Fingerprint - GPU vendor/renderer detection (Planned)
7. 🚧 Audio Fingerprint - AudioContext fingerprinting (Planned)
8. 🚧 Font Detection - 200+ system font enumeration (Planned)
9. 🚧 Timezone Leak - Timezone consistency verification (Planned)
10. 🚧 Browser Fingerprint - Comprehensive 40+ component analysis (Planned)

**Dashboard Features**:
- Real-time privacy score (0-100)
- Risk level visualization (Low/Medium/High/Critical)
- One-click full scan
- Scan progress tracking
- Historical trend charts

### Phase 2: Advanced Features (Planned)

11-20. Extension Leak, WebGPU, Bot Detection, Incognito Detection, VPN/Proxy Detection, TLS/SSL Fingerprint, HTTP/2 Fingerprint, Media Devices Leak, Battery API Leak, Network Info Leak

**User Features**:
- History tracking (30 days local, unlimited cloud)
- History comparison timeline
- Share links with QR codes
- Export reports (PDF/JSON/CSV)

### Phase 3: Business Features (Planned)

**API Service**:
- RESTful API with SDKs (JavaScript, Python, Go)
- Batch detection
- Webhook callbacks
- Rate limiting by tier

**Subscription Tiers**:
- **Free**: 100 requests/day, basic features
- **Pro** ($9.99/mo): Unlimited history, cloud sync, PDF reports
- **API Starter** ($29/mo): 10K API requests/month
- **API Pro** ($99/mo): 100K API requests/month
- **Enterprise**: Custom pricing, private deployment

**Educational Content**:
- 30+ privacy articles
- Video tutorials
- Case studies
- Weekly privacy news blog

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.0 + shadcn/ui
- **State**: Zustand
- **Charts**: Chart.js
- **i18n**: next-intl (20+ languages)
- **PWA**: next-pwa

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 5.x
- **Database**: PostgreSQL 15 (VPS Supabase)
- **Cache**: Redis 7
- **ORM**: Prisma
- **Validation**: Zod
- **Testing**: Vitest + Supertest

### Deployment
- **Frontend**: Cloudflare Pages (SSG)
- **Backend**: VPS Docker (93.127.133.204)
- **CDN**: Cloudflare
- **Database**: VPS Supabase (Port 54322)

---

## 📊 Competitive Advantage

| Feature | browserleaks.com | browserscan.net | **BrowserLeaks.io** |
|---------|------------------|-----------------|---------------------|
| Detection Tests | 17 | 20+ | **30+** |
| UI/UX | Old | Modern | **Next-gen** |
| Privacy Score | ❌ | Basic | **AI-driven** |
| History Tracking | ❌ | ❌ | **✅ Timeline** |
| Share Links | ❌ | ❌ | **✅ QR Code** |
| Export Reports | ❌ | ❌ | **✅ PDF/JSON** |
| API Service | ❌ | ❌ | **✅ RESTful** |
| Open Source | ❌ | ❌ | **✅ MIT** |
| PWA Support | ❌ | ❌ | **✅** |
| Mobile First | ❌ | ✅ | **✅** |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (VPS Supabase)
- Redis 7+

### Installation

```bash
# Clone the repository
git clone https://github.com/browserleaks/browserleaks.io.git
cd browserleaks.io

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Setup database
npm run db:migrate
npm run db:seed

# Start development
npm run dev
```

### Development

```bash
# Start all services (frontend + backend)
npm run dev

# Start frontend only (http://localhost:3000)
npm run dev:web

# Start backend only (http://localhost:4000)
npm run dev:api

# Build all
npm run build

# Run tests
npm run test
```

---

## 📁 Project Structure

```
browserleaks.io/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   ├── core/         # Fingerprint collectors (from creepjs)
│   ├── ui/           # Shared UI components
│   └── types/        # Shared TypeScript types
├── docs/
│   ├── PRD.md                # Product Requirements
│   ├── API.md                # API Documentation
│   ├── ARCHITECTURE.md       # Architecture Guide
│   └── DEPLOYMENT.md         # Deployment Guide (TBD)
├── .env              # Environment variables (gitignored)
├── .env.example      # Environment template
├── CLAUDE.md         # Claude Code instructions
└── README.md         # This file
```

---

## 🔐 Privacy & Security

### Privacy Commitment

1. **No Data Collection**: All detection runs in your browser
2. **No Fingerprint Storage**: We don't store your browser fingerprint
3. **No Tracking**: No third-party analytics or trackers
4. **Open Source**: Code is transparent and auditable

### Security Measures

- ✅ HTTPS enforced
- ✅ CSP (Content Security Policy)
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (React)
- ✅ CSRF tokens

---

## 📖 Documentation

- **[PRD](docs/PRD.md)** - Product Requirements Document
- **[API](docs/API.md)** - API Documentation
- **[Architecture](docs/ARCHITECTURE.md)** - Technical Architecture
- **[CLAUDE](CLAUDE.md)** - Development Guide

---

## 🤝 Code Reuse

This project intelligently reuses code from existing high-quality open-source projects:

### From [creepjs](../creepjs)
- 58 fingerprint collectors (Canvas, WebGL, Audio, Fonts, etc.)
- Hashing utilities (MurmurHash3)
- Browser detection logic

### From [MyIP-main](../MyIP-main)
- DNS Leak Test implementation
- WebRTC Leak Test implementation
- Multi-source IP detection
- Country name utilities

### From [iphey](../iphey)
- IP intelligence services
- API client patterns
- Caching strategies

All reused code is properly attributed and adapted to our architecture.

---

## 🗺️ Roadmap

### Q1 2025 (MVP) - Current Phase
- [x] Project setup and documentation
- [x] Frontend scaffold (Next.js 15 + App Router)
- [x] Backend scaffold (Express 5 + TypeScript)
- [x] Multi-language support (next-intl with 10 languages)
- [x] IP Leak Detection (frontend + backend)
- [x] DNS Leak Detection (4-source testing)
- [x] WebRTC Leak Detection (STUN server testing)
- [x] Privacy Scoring System (0-100 score with AI-driven analysis)
- [x] Privacy Dashboard with vulnerability analysis
- [x] Comprehensive unit and integration tests (24 tests passing)
- [x] Type-safe architecture with shared types
- [ ] Browser Fingerprinting (Canvas, WebGL, Audio, Fonts)
- [ ] Responsive UI/UX optimization

### Q2 2025 (Advanced Features)
- [ ] 10 advanced detection tests
- [ ] History tracking & comparison
- [ ] Share links & export
- [ ] PWA support
- [ ] Multi-language (20+ languages)

### Q3 2025 (Commercialization)
- [ ] API service launch
- [ ] Subscription system
- [ ] Payment integration (Stripe)
- [ ] Educational content (30+ articles)
- [ ] Marketing campaign

### Q4 2025 (Growth)
- [ ] Mobile apps (iOS/Android)
- [ ] Browser extensions (Chrome/Firefox)
- [ ] Enterprise features
- [ ] Global expansion

---

## 📈 Success Metrics (KPIs)

| Metric | Target | Status |
|--------|--------|--------|
| Daily Active Users | 10K+ | TBD |
| Registered Users | 50K+ | TBD |
| API Calls/Month | 1M+ | TBD |
| MRR | $10K+ | TBD |
| Lighthouse Score | >95 | TBD |
| API Response Time | <100ms | TBD |

---

## 🙏 Acknowledgments

Special thanks to:
- [Abraham Juliot](https://github.com/abrahamjuliot) for [CreepJS](https://github.com/abrahamjuliot/creepjs)
- [jason5ng32](https://github.com/jason5ng32) for [MyIP](https://github.com/jason5ng32/MyIP)
- All contributors to the open-source privacy community

---

## 📞 Contact

- **Website**: https://browserleaks.io (Coming Soon)
- **API Docs**: https://api.browserleaks.io/v1/docs (Coming Soon)
- **Email**: hello@browserleaks.io
- **Twitter**: @browserleaks (TBD)
- **Discord**: https://discord.gg/browserleaks (TBD)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ for privacy-conscious users worldwide</strong>
</p>

<p align="center">
  <sub>Making browser privacy testing transparent, comprehensive, and accessible</sub>
</p>
