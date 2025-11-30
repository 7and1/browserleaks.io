# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BrowserLeaks.io is a browser privacy detection platform providing leak testing (IP, DNS, WebRTC), fingerprinting analysis (Canvas, WebGL, Audio, Fonts), and privacy scoring.

## Architecture

**Monorepo** with Turborepo, npm workspaces:
- `apps/web` - Next.js 15 frontend (App Router, React 19, Tailwind CSS + shadcn/ui)
- `apps/api` - Express 5 backend (TypeScript, Vitest for testing)
- `packages/types` - Shared TypeScript types

**Data Flow**: Frontend components (`apps/web/components/leak-tests/`) call hooks (`apps/web/hooks/`) → API routes (`/v1/*`) → Services layer (`apps/api/src/services/`)

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Start all services (frontend :3000, backend :3001)
npm run dev

# Start individual services
npm run dev:web     # Frontend only
npm run dev:api     # Backend only

# Build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
npm run format:check

# Tests (API only, uses Vitest)
npm run test
npm run test:watch

# Clean build artifacts
npm run clean
```

### Running a Single Test

```bash
cd apps/api
npx vitest run src/services/__tests__/PrivacyScoreService.test.ts
npx vitest run --testNamePattern "should calculate"  # Filter by test name
```

## API Endpoints

All routes prefixed with `/v1`:
- `POST /v1/detect/ip` - IP detection
- `GET /v1/detect/ip/:ip` - Lookup specific IP
- `POST /v1/detect/dns-leak` - DNS leak test
- `POST /v1/detect/webrtc-leak` - WebRTC leak analysis
- `POST /v1/privacy-score` - Calculate privacy score
- `POST /v1/events/log` - Telemetry logging
- Health: `GET /health`

## Frontend Structure

Pages: `apps/web/app/[locale]/`
- Test pages: `tests/ip-leak/`, `tests/dns-leak/`, `tests/webrtc-leak/`
- Dashboard: `dashboard/`
- Feature pages: `fingerprints/`, `hardware/`, `network/`, `modern-apis/`

Client-side fingerprinting: `apps/web/lib/fingerprint/` (canvas, webgl, audio, fonts)

## Frontend Development Standards

### Design Aesthetics (Critical)

**Premium visual design is mandatory** - users must be impressed at first glance:

1. **Color Palette**: Use curated, harmonious HSL-tailored colors. Avoid generic plain colors. Dark mode support required.

2. **Typography**: Use modern fonts (Inter, Roboto, Outfit from Google Fonts), never browser defaults.

3. **Visual Effects**:
   - Smooth gradients and glassmorphism
   - Subtle micro-animations for engagement
   - Hover effects and interactive elements
   - Dynamic, responsive feel

4. **No Placeholders**: Use real content and assets.

### Implementation Workflow

1. **Plan**: Understand requirements, draw inspiration from modern web designs
2. **Foundation**: Start with `index.css`, implement design tokens and utilities
3. **Components**: Build with shadcn/ui patterns, use predefined styles (not ad-hoc)
4. **Pages**: Assemble with proper routing, responsive layouts
5. **Polish**: Review UX, ensure smooth transitions, optimize performance

### SEO Best Practices

- **Title Tags**: Descriptive titles for each page
- **Meta Descriptions**: Compelling summaries of page content
- **Heading Structure**: Single `<h1>` per page with proper hierarchy
- **Semantic HTML**: Use HTML5 semantic elements
- **Unique IDs**: All interactive elements need descriptive IDs for testing
- **Performance**: Optimize for fast page loads

## Environment Variables

Required in `.env`:
- `IPINFO_TOKEN` - IPInfo.io API token
- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_RADAR_TOKEN` - Cloudflare Radar API
- `API_PORT` - Backend port (default 3001)
- `NEXT_PUBLIC_API_URL` - Frontend API base URL

## Code Reuse

This project reuses code from sibling projects:
- **creepjs** (`../creepjs`) - 58 fingerprint collectors
- **MyIP-main** (`../MyIP-main`) - DNS/WebRTC leak detection logic, IP sources
- **iphey** (`../iphey`) - IP intelligence clients (IPInfo, Cloudflare Radar)

When implementing new detection features, check these projects first.

## Privacy Score Algorithm

See `apps/api/src/services/PrivacyScoreService.ts`. Score breakdown (0-100):
- IP Privacy: 0-20 pts
- DNS Privacy: 0-15 pts
- WebRTC Privacy: 0-15 pts
- Fingerprint Resistance: 0-30 pts
- Browser Config: 0-20 pts

Risk levels: 80-100 (low), 60-79 (medium), 40-59 (high), 0-39 (critical)
