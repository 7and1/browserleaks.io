# BrowserLeaks.io 架构设计文档

**版本**: v1.0
**更新日期**: 2025-11-15

---

## 📌 架构概述

BrowserLeaks.io 采用**前后端分离 + 边缘加速**的现代化架构，充分利用Cloudflare CDN和VPS服务器的优势，实现全球低延迟访问和高可靠性。

### 核心设计原则

1. **性能优先**: 首屏加载 <2秒，API响应 <100ms
2. **可扩展性**: 支持水平扩展，轻松应对流量增长
3. **安全性**: 多层安全防护，保护用户隐私
4. **可维护性**: 模块化设计，代码复用率高
5. **成本优化**: 充分利用免费层服务，降低运营成本

---

## 🏗️ 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户浏览器                                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 指纹采集器    │  │ UI组件       │  │ 状态管理      │          │
│  │ (creepjs)   │  │ (React)      │  │ (Zustand)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Cloudflare 全球网络                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Cloudflare CDN                        │  │
│  │                                                          │  │
│  │  ┌─────────────────┐         ┌─────────────────────┐   │  │
│  │  │ Cloudflare Pages│         │ Cloudflare Workers  │   │  │
│  │  │                 │         │ (可选边缘API)        │   │  │
│  │  │ • Next.js SSG   │         │ • 轻量级端点         │   │  │
│  │  │ • 静态资源      │         │ • 地理位置路由       │   │  │
│  │  │ • 自动部署      │         │ • KV存储            │   │  │
│  │  └─────────────────┘         └─────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VPS服务器 (93.127.133.204)                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Express API服务器                      │  │
│  │                      (Port 4000)                          │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ API路由层                                            │ │  │
│  │  │  • /api/v1/fingerprint                             │ │  │
│  │  │  • /api/v1/detect/ip                               │ │  │
│  │  │  • /api/v1/detect/dns-leak                         │ │  │
│  │  │  • /api/v1/detect/webrtc-leak                      │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ 服务层                                               │ │  │
│  │  │  • FingerprintService (指纹分析)                    │ │  │
│  │  │  • IPService (IP检测)                               │ │  │
│  │  │  • DNSLeakService (DNS泄露)                         │ │  │
│  │  │  • WebRTCService (WebRTC泄露)                       │ │  │
│  │  │  • PrivacyScoreService (隐私评分)                   │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ 中间件层                                             │ │  │
│  │  │  • Authentication (认证)                            │ │  │
│  │  │  • RateLimit (速率限制)                             │ │  │
│  │  │  • Validation (参数验证)                            │ │  │
│  │  │  • ErrorHandler (错误处理)                          │ │  │
│  │  │  • Logger (日志记录)                                │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │ PostgreSQL      │  │ Redis           │  │ 外部API        │  │
│  │ (Port 54322)    │  │ (Port 6379)     │  │                │  │
│  │                 │  │                 │  │ • ipinfo.io    │  │
│  │ • 用户数据      │  │ • 缓存          │  │ • Cloudflare   │  │
│  │ • 检测历史      │  │ • 会话          │  │   Radar        │  │
│  │ • API Token     │  │ • 速率限制      │  │ • my-ip-data   │  │
│  └─────────────────┘  └─────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 前端架构

### 技术栈

```typescript
{
  "framework": "Next.js 15",
  "runtime": "React 19",
  "language": "TypeScript 5.7",
  "styling": "Tailwind CSS 4.0",
  "components": "shadcn/ui",
  "stateManagement": "Zustand",
  "dataVisualization": "Chart.js + react-chartjs-2",
  "i18n": "next-intl",
  "pwa": "next-pwa",
  "testing": "Vitest + Playwright"
}
```

### 目录结构

```
apps/web/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # 国际化路由
│   │   ├── layout.tsx            # 根布局
│   │   ├── page.tsx              # 首页（仪表板）
│   │   ├── tests/                # 检测页面
│   │   │   ├── ip-leak/
│   │   │   │   └── page.tsx
│   │   │   ├── dns-leak/
│   │   │   │   └── page.tsx
│   │   │   ├── webrtc-leak/
│   │   │   │   └── page.tsx
│   │   │   ├── canvas-fingerprint/
│   │   │   │   └── page.tsx
│   │   │   ├── webgl-fingerprint/
│   │   │   │   └── page.tsx
│   │   │   └── ... (其他检测页面)
│   │   ├── docs/                 # 文档中心
│   │   ├── api-docs/             # API文档
│   │   └── blog/                 # 博客
│   └── api/                      # Next.js API Routes (轻量级)
│       └── ...
│
├── components/                   # React组件
│   ├── ui/                       # shadcn/ui组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── leak-tests/               # 检测组件
│   │   ├── IPLeakTest.tsx
│   │   ├── DNSLeakTest.tsx
│   │   ├── WebRTCLeakTest.tsx
│   │   └── ...
│   ├── dashboard/                # 仪表板组件
│   │   ├── PrivacyScoreCard.tsx
│   │   ├── RiskLevelIndicator.tsx
│   │   ├── ScanProgress.tsx
│   │   └── TrendChart.tsx
│   ├── layout/                   # 布局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   └── shared/                   # 共享组件
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ...
│
├── lib/                          # 工具函数和配置
│   ├── api-client.ts             # API客户端
│   ├── storage.ts                # LocalStorage封装
│   ├── i18n.ts                   # 国际化配置
│   └── utils.ts                  # 通用工具
│
├── stores/                       # Zustand状态管理
│   ├── useTestStore.ts           # 检测状态
│   ├── useUIStore.ts             # UI状态（主题、语言）
│   └── useHistoryStore.ts        # 历史记录
│
├── hooks/                        # 自定义Hooks
│   ├── useFingerprint.ts         # 指纹采集Hook
│   ├── useIPDetect.ts            # IP检测Hook
│   ├── useDNSLeak.ts             # DNS泄露Hook
│   └── useWebRTCLeak.ts          # WebRTC泄露Hook
│
├── types/                        # TypeScript类型定义
│   ├── fingerprint.ts
│   ├── leak-test.ts
│   └── api.ts
│
├── public/                       # 静态资源
│   ├── images/
│   ├── icons/
│   └── manifest.json             # PWA配置
│
├── styles/                       # 样式文件
│   └── globals.css
│
├── next.config.js                # Next.js配置
├── tailwind.config.js            # Tailwind配置
├── tsconfig.json                 # TypeScript配置
└── package.json
```

### 核心组件设计

#### 1. 仪表板组件 (PrivacyScoreCard)

```typescript
// components/dashboard/PrivacyScoreCard.tsx
interface PrivacyScoreCardProps {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  breakdown: {
    ipPrivacy: number;
    dnsPrivacy: number;
    webrtcPrivacy: number;
    fingerprintResistance: number;
    browserConfig: number;
  };
}

export function PrivacyScoreCard({ score, riskLevel, breakdown }: PrivacyScoreCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>隐私评分</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          {/* 环形进度条显示总分 */}
          <CircularProgress value={score} max={100} />
        </div>
        <RiskLevelBadge level={riskLevel} />
        {/* 详细评分细分 */}
        <ScoreBreakdown breakdown={breakdown} />
      </CardContent>
    </Card>
  );
}
```

#### 2. 检测组件基础类 (BaseLeakTest)

```typescript
// components/leak-tests/BaseLeakTest.tsx
interface BaseLeakTestProps {
  title: string;
  description: string;
  onComplete?: (result: any) => void;
}

export abstract class BaseLeakTest extends React.Component<BaseLeakTestProps> {
  abstract runTest(): Promise<any>;

  render() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{this.props.title}</CardTitle>
          <CardDescription>{this.props.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => this.runTest()}>
            开始检测
          </Button>
          {/* 结果显示区域 */}
        </CardContent>
      </Card>
    );
  }
}
```

### 状态管理 (Zustand)

```typescript
// stores/useTestStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TestState {
  // 当前检测状态
  isScanning: boolean;
  currentTest: string | null;
  progress: number;

  // 检测结果
  results: {
    ipLeak?: IPLeakResult;
    dnsLeak?: DNSLeakResult;
    webrtcLeak?: WebRTCLeakResult;
    fingerprint?: FingerprintResult;
    // ... 其他检测结果
  };

  // 隐私评分
  privacyScore: PrivacyScore | null;

  // 历史记录
  history: TestResult[];

  // Actions
  startScan: () => void;
  stopScan: () => void;
  updateProgress: (progress: number) => void;
  setResult: (testType: string, result: any) => void;
  calculatePrivacyScore: () => void;
  saveToHistory: () => void;
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      isScanning: false,
      currentTest: null,
      progress: 0,
      results: {},
      privacyScore: null,
      history: [],

      startScan: () => set({ isScanning: true, progress: 0 }),
      stopScan: () => set({ isScanning: false }),
      updateProgress: (progress) => set({ progress }),

      setResult: (testType, result) => set((state) => ({
        results: { ...state.results, [testType]: result }
      })),

      calculatePrivacyScore: () => {
        const { results } = get();
        // 计算隐私评分逻辑
        const score = calculateScore(results);
        set({ privacyScore: score });
      },

      saveToHistory: () => {
        const { results, privacyScore } = get();
        const historyItem = {
          timestamp: Date.now(),
          results,
          privacyScore
        };
        set((state) => ({
          history: [historyItem, ...state.history].slice(0, 30)
        }));
      }
    }),
    {
      name: 'browserleaks-test-storage',
      partialize: (state) => ({
        history: state.history
      })
    }
  )
);
```

### API客户端

```typescript
// lib/api-client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.browserleaks.io/v1';

class APIClient {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  async detectIP(ip?: string) {
    const response = await this.client.post('/detect/ip', { ip });
    return response.data;
  }

  async detectDNSLeak(testId: string) {
    const response = await this.client.post('/detect/dns-leak', { testId });
    return response.data;
  }

  async detectWebRTCLeak(data: any) {
    const response = await this.client.post('/detect/webrtc-leak', data);
    return response.data;
  }

  async analyzeFingerprint(components: any) {
    const response = await this.client.post('/fingerprint', { components });
    return response.data;
  }
}

export const apiClient = new APIClient();
```

---

## 🔧 后端架构

### 技术栈

```typescript
{
  "runtime": "Node.js 20+",
  "framework": "Express 5.x",
  "language": "TypeScript 5.7",
  "database": "PostgreSQL 15",
  "cache": "Redis 7",
  "validation": "Zod",
  "orm": "Prisma",
  "testing": "Vitest + Supertest"
}
```

### 目录结构

```
apps/api/
├── src/
│   ├── app.ts                    # Express应用配置
│   ├── server.ts                 # HTTP服务器入口
│   ├── config.ts                 # 配置管理（Zod验证）
│   │
│   ├── routes/                   # 路由层
│   │   ├── index.ts              # 路由汇总
│   │   ├── fingerprint.ts        # 指纹检测路由
│   │   ├── ip.ts                 # IP检测路由
│   │   ├── dns-leak.ts           # DNS泄露路由
│   │   ├── webrtc-leak.ts        # WebRTC泄露路由
│   │   ├── batch.ts              # 批量检测路由
│   │   ├── history.ts            # 历史查询路由
│   │   └── auth.ts               # 认证路由
│   │
│   ├── services/                 # 服务层（业务逻辑）
│   │   ├── FingerprintService.ts # 指纹分析服务
│   │   ├── IPService.ts          # IP检测服务
│   │   ├── DNSLeakService.ts     # DNS泄露服务
│   │   ├── WebRTCService.ts      # WebRTC泄露服务
│   │   ├── PrivacyScoreService.ts# 隐私评分服务
│   │   ├── HistoryService.ts     # 历史记录服务
│   │   └── WebhookService.ts     # Webhook服务
│   │
│   ├── clients/                  # 外部API客户端
│   │   ├── IPInfoClient.ts       # ipinfo.io客户端
│   │   ├── CloudflareRadarClient.ts # Cloudflare Radar客户端
│   │   └── MyIPDataClient.ts     # my-ip-data客户端
│   │
│   ├── middleware/               # 中间件
│   │   ├── auth.ts               # 认证中间件
│   │   ├── rateLimit.ts          # 速率限制中间件
│   │   ├── validation.ts         # 参数验证中间件
│   │   ├── errorHandler.ts       # 错误处理中间件
│   │   └── logger.ts             # 日志中间件
│   │
│   ├── schemas/                  # Zod验证模式
│   │   ├── fingerprint.ts
│   │   ├── ip.ts
│   │   └── common.ts
│   │
│   ├── types/                    # TypeScript类型
│   │   ├── api.ts
│   │   ├── fingerprint.ts
│   │   └── leak-test.ts
│   │
│   ├── utils/                    # 工具函数
│   │   ├── cache.ts              # 缓存工具
│   │   ├── hash.ts               # 哈希工具
│   │   └── logger.ts             # 日志工具
│   │
│   └── db/                       # 数据库
│       ├── prisma/
│       │   └── schema.prisma     # Prisma模式
│       └── migrations/           # 数据库迁移
│
├── tests/                        # 测试文件
│   ├── unit/
│   └── integration/
│
├── Dockerfile                    # Docker配置
├── docker-compose.yml            # 开发环境配置
├── tsconfig.json
└── package.json
```

### 核心服务设计

#### 1. 指纹分析服务

```typescript
// src/services/FingerprintService.ts
import { hash } from '../utils/hash';

export class FingerprintService {
  /**
   * 分析浏览器指纹
   */
  async analyze(components: FingerprintComponents): Promise<FingerprintResult> {
    // 1. 计算各组件哈希
    const hashes = {
      canvas: hash(components.canvas),
      webgl: hash(components.webgl),
      audio: hash(components.audio),
      fonts: hash(components.fonts),
      // ... 其他组件
    };

    // 2. 计算综合哈希
    const fingerprintHash = hash(JSON.stringify(hashes));

    // 3. 计算唯一性（与数据库中的指纹对比）
    const uniqueness = await this.calculateUniqueness(fingerprintHash);

    // 4. 检测伪造迹象
    const spoofingIndicators = this.detectSpoofing(components);

    // 5. 识别浏览器类型
    const browserType = this.identifyBrowser(components.userAgent);

    // 6. 检测无头浏览器/爬虫
    const isHeadless = this.detectHeadless(components);
    const isBot = this.detectBot(components);

    return {
      fingerprintId: `fp_${fingerprintHash}`,
      hash: fingerprintHash,
      confidence: this.calculateConfidence(components),
      uniqueness,
      components: hashes,
      spoofingIndicators,
      browserType,
      isHeadless,
      isBot,
      timestamp: Date.now()
    };
  }

  /**
   * 计算唯一性（0-1，越高越独特）
   */
  private async calculateUniqueness(hash: string): Promise<number> {
    // 查询数据库中相同指纹的数量
    const count = await db.fingerprint.count({
      where: { hash }
    });

    // 计算唯一性（简化算法）
    return 1 - Math.min(count / 10000, 1);
  }

  /**
   * 检测伪造迹象
   */
  private detectSpoofing(components: any): string[] {
    const indicators: string[] = [];

    // 检测Canvas伪造
    if (this.isCanvasSpoofed(components.canvas)) {
      indicators.push('Canvas指纹可能被伪造');
    }

    // 检测时区不一致
    if (components.timezone !== components.intlTimezone) {
      indicators.push('时区信息不一致');
    }

    // 检测User-Agent与实际特征不符
    if (!this.isUserAgentConsistent(components)) {
      indicators.push('User-Agent与浏览器特征不符');
    }

    return indicators;
  }

  /**
   * 检测无头浏览器
   */
  private detectHeadless(components: any): boolean {
    // 检测多个无头浏览器特征
    return (
      components.navigator.webdriver ||
      components.window.navigator.plugins.length === 0 ||
      components.window.chrome?.runtime !== undefined
    );
  }

  /**
   * 检测爬虫
   */
  private detectBot(components: any): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /headless/i
    ];

    return botPatterns.some(pattern =>
      pattern.test(components.userAgent)
    );
  }
}
```

#### 2. IP检测服务

```typescript
// src/services/IPService.ts
import { IPInfoClient } from '../clients/IPInfoClient';
import { CloudflareRadarClient } from '../clients/CloudflareRadarClient';
import { cache } from '../utils/cache';

export class IPService {
  private ipinfoClient = new IPInfoClient();
  private cfRadarClient = new CloudflareRadarClient();

  /**
   * 检测IP地址信息
   */
  async detect(ip: string): Promise<IPLeakResult> {
    // 1. 检查缓存
    const cacheKey = `ip:${ip}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    // 2. 从主数据源获取（ipinfo.io）
    let result: IPLeakResult;
    try {
      result = await this.ipinfoClient.lookup(ip);
    } catch (error) {
      // 3. 备用数据源（Cloudflare Radar）
      result = await this.cfRadarClient.lookup(ip);
    }

    // 4. 检测VPN/代理
    result.privacy = await this.detectProxy(ip);

    // 5. 检测IP信誉
    result.reputation = await this.checkReputation(ip);

    // 6. 缓存结果（5分钟）
    await cache.set(cacheKey, result, 300);

    return result;
  }

  /**
   * 检测VPN/代理
   */
  private async detectProxy(ip: string): Promise<PrivacyInfo> {
    // 检测多个维度
    const isDatacenter = await this.isDatacenterIP(ip);
    const isVPN = await this.isVPN(ip);
    const isProxy = await this.isProxy(ip);
    const isTor = await this.isTorExitNode(ip);

    return {
      isProxy,
      isVPN,
      isDatacenter,
      isTor,
      isRelay: false
    };
  }

  /**
   * 检查IP信誉
   */
  private async checkReputation(ip: string): Promise<ReputationInfo> {
    // 调用多个黑名单数据库
    const blacklists = await this.checkBlacklists(ip);

    return {
      score: 100 - blacklists.length * 10,
      isBlacklisted: blacklists.length > 0,
      categories: blacklists
    };
  }
}
```

#### 3. 隐私评分服务

```typescript
// src/services/PrivacyScoreService.ts
export class PrivacyScoreService {
  /**
   * 计算隐私评分
   */
  calculate(results: TestResults): PrivacyScore {
    const scores = {
      ipPrivacy: this.calculateIPPrivacy(results.ipLeak),
      dnsPrivacy: this.calculateDNSPrivacy(results.dnsLeak),
      webrtcPrivacy: this.calculateWebRTCPrivacy(results.webrtcLeak),
      fingerprintResistance: this.calculateFingerprintResistance(results.fingerprint),
      browserConfig: this.calculateBrowserConfig(results.fingerprint)
    };

    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      totalScore: total,
      riskLevel: this.getRiskLevel(total),
      breakdown: scores,
      vulnerabilities: this.identifyVulnerabilities(results),
      timeline: []
    };
  }

  /**
   * IP隐私评分（0-20分）
   */
  private calculateIPPrivacy(ipLeak?: IPLeakResult): number {
    if (!ipLeak) return 0;

    let score = 20;

    // VPN/代理检测
    if (ipLeak.privacy.isVPN) score -= 0; // 使用VPN是好事
    if (ipLeak.privacy.isProxy) score -= 5;
    if (ipLeak.privacy.isDatacenter) score -= 5;

    // IP信誉
    if (ipLeak.reputation.score < 50) score -= 5;
    if (ipLeak.reputation.isBlacklisted) score -= 5;

    return Math.max(0, score);
  }

  /**
   * DNS隐私评分（0-15分）
   */
  private calculateDNSPrivacy(dnsLeak?: DNSLeakResult): number {
    if (!dnsLeak) return 0;

    let score = 15;

    // DNS泄露检测
    if (dnsLeak.isLeak) {
      score -= dnsLeak.leakType === 'full' ? 10 : 5;
    }

    // ISP DNS使用
    const hasISPDNS = dnsLeak.servers.some(s => s.isISP);
    if (hasISPDNS) score -= 3;

    // DoH/DoT
    if (!dnsLeak.dohEnabled && !dnsLeak.dotEnabled) score -= 2;

    return Math.max(0, score);
  }

  /**
   * WebRTC隐私评分（0-15分）
   */
  private calculateWebRTCPrivacy(webrtcLeak?: WebRTCLeakResult): number {
    if (!webrtcLeak) return 0;

    let score = 15;

    // 本地IP泄露
    if (webrtcLeak.localIPs.length > 0) score -= 3;

    // 公网IP泄露
    if (webrtcLeak.publicIPs.length > 0) score -= 5;

    // mDNS泄露
    if (webrtcLeak.mdnsLeak) score -= 4;

    // IPv6泄露
    if (webrtcLeak.ipv6Leak) score -= 3;

    return Math.max(0, score);
  }

  /**
   * 指纹抵抗评分（0-30分）
   */
  private calculateFingerprintResistance(fingerprint?: FingerprintResult): number {
    if (!fingerprint) return 0;

    let score = 30;

    // 唯一性惩罚（越独特越危险）
    score -= fingerprint.uniqueness * 15;

    // Canvas独特性
    if (fingerprint.components.canvas?.uniqueness > 0.8) score -= 5;

    // WebGL独特性
    if (fingerprint.components.webgl?.uniqueness > 0.8) score -= 5;

    // Audio独特性
    if (fingerprint.components.audio?.uniqueness > 0.7) score -= 3;

    // 字体独特性
    if (fingerprint.components.fonts?.uniqueness > 0.6) score -= 2;

    return Math.max(0, score);
  }

  /**
   * 浏览器配置评分（0-20分）
   */
  private calculateBrowserConfig(fingerprint?: FingerprintResult): number {
    if (!fingerprint) return 0;

    let score = 20;

    // Cookie启用
    // 插件数量（太多或太少都不好）
    // DNT（Do Not Track）设置
    // 隐私模式检测

    return Math.max(0, score);
  }

  /**
   * 确定风险等级
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }
}
```

### 数据库设计 (Prisma)

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// API Token
model ApiToken {
  id          String   @id @default(uuid())
  token       String   @unique
  email       String
  tier        TokenTier @default(FREE)
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  isActive    Boolean  @default(true)

  // 使用统计
  requestsToday   Int      @default(0)
  requestsMonth   Int      @default(0)
  lastUsedAt      DateTime?

  // 关联
  usageRecords    UsageRecord[]

  @@map("api_tokens")
}

enum TokenTier {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

// API使用记录
model UsageRecord {
  id          String   @id @default(uuid())
  tokenId     String
  endpoint    String
  timestamp   DateTime @default(now())
  responseTime Int     // 毫秒
  statusCode  Int

  token       ApiToken @relation(fields: [tokenId], references: [id])

  @@map("usage_records")
  @@index([tokenId, timestamp])
}

// 指纹记录（可选）
model Fingerprint {
  id          String   @id @default(uuid())
  hash        String   @unique
  components  Json
  uniqueness  Float
  confidence  Float
  count       Int      @default(1) // 相同指纹的出现次数
  firstSeen   DateTime @default(now())
  lastSeen    DateTime @default(now())

  @@map("fingerprints")
  @@index([hash])
}

// 批量任务
model BatchJob {
  id          String   @id @default(uuid())
  tokenId     String
  status      BatchStatus @default(PROCESSING)
  totalJobs   Int
  completedJobs Int     @default(0)
  results     Json
  webhookUrl  String?
  createdAt   DateTime @default(now())
  completedAt DateTime?

  @@map("batch_jobs")
  @@index([tokenId, status])
}

enum BatchStatus {
  PROCESSING
  COMPLETED
  FAILED
}
```

### 中间件设计

#### 1. 认证中间件

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/client';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 从请求头获取Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Missing or invalid authorization header'
        }
      });
    }

    const token = authHeader.substring(7);

    // 验证Token
    const apiToken = await db.apiToken.findUnique({
      where: { token, isActive: true }
    });

    if (!apiToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }

    // 检查过期时间
    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token has expired'
        }
      });
    }

    // 将Token信息附加到请求对象
    req.apiToken = apiToken;

    // 更新最后使用时间
    await db.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() }
    });

    next();
  } catch (error) {
    next(error);
  }
}
```

#### 2. 速率限制中间件

```typescript
// src/middleware/rateLimit.ts
import { Request, Response, NextFunction } from 'express';
import { redis } from '../utils/redis';

const RATE_LIMITS = {
  FREE: { requests: 100, period: 86400 }, // 24小时
  STARTER: { requests: 10000, period: 2592000 }, // 30天
  PRO: { requests: 100000, period: 2592000 },
  ENTERPRISE: { requests: Infinity, period: 0 }
};

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const apiToken = req.apiToken;
    if (!apiToken) {
      return next();
    }

    const limit = RATE_LIMITS[apiToken.tier];
    const key = `ratelimit:${apiToken.id}`;

    // 从Redis获取当前使用量
    const current = await redis.get(key);
    const count = current ? parseInt(current) : 0;

    if (count >= limit.requests) {
      // 超过限制
      const ttl = await redis.ttl(key);
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded',
          details: {
            limit: limit.requests,
            resetAt: new Date(Date.now() + ttl * 1000).toISOString()
          }
        }
      });
    }

    // 增加计数
    await redis.incr(key);
    if (count === 0) {
      // 第一次请求，设置过期时间
      await redis.expire(key, limit.period);
    }

    // 设置响应头
    res.setHeader('X-RateLimit-Limit', limit.requests);
    res.setHeader('X-RateLimit-Remaining', limit.requests - count - 1);
    const resetAt = Date.now() + (await redis.ttl(key)) * 1000;
    res.setHeader('X-RateLimit-Reset', Math.floor(resetAt / 1000));

    next();
  } catch (error) {
    next(error);
  }
}
```

---

## 🚀 部署架构

### Cloudflare Pages (前端)

```yaml
# .github/workflows/deploy-web.yml
name: Deploy Web to Cloudflare Pages

on:
  push:
    branches: [main]
    paths:
      - 'apps/web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build --filter=@browserleaks/web
        env:
          NEXT_PUBLIC_API_URL: https://api.browserleaks.io/v1

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: browserleaks-web
          directory: apps/web/out
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### VPS Docker (后端)

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm ci --production

EXPOSE 4000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: ./apps/api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/browserleaks
      - REDIS_URL=redis://redis:6379
      - IPINFO_TOKEN=${IPINFO_TOKEN}
      - CLOUDFLARE_RADAR_TOKEN=${CLOUDFLARE_RADAR_TOKEN}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=browserleaks
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## 📊 性能优化

### 前端优化

1. **代码分割**: Next.js自动代码分割
2. **图片优化**: next/image自动优化
3. **字体优化**: next/font自动字体优化
4. **CDN缓存**: Cloudflare CDN全球加速
5. **静态生成**: SSG预渲染静态页面

### 后端优化

1. **Redis缓存**: IP查询结果缓存5分钟
2. **数据库索引**: 关键查询字段添加索引
3. **连接池**: PostgreSQL连接池复用
4. **响应压缩**: gzip/brotli压缩
5. **CDN加速**: API响应通过CDN加速

---

## 🔒 安全措施

1. **HTTPS**: 全站HTTPS加密
2. **CSP**: 严格的内容安全策略
3. **速率限制**: 防止API滥用
4. **输入验证**: Zod严格校验
5. **SQL注入防护**: Prisma参数化查询
6. **XSS防护**: React自动转义
7. **CSRF防护**: SameSite Cookie

---

## 📈 监控和日志

### 日志收集

- Winston日志库
- 结构化JSON日志
- 日志级别：error/warn/info/debug

### 性能监控

- Prometheus指标收集
- Grafana可视化
- API响应时间监控
- 数据库查询性能

### 错误追踪

- Sentry错误报告
- 实时错误告警
- 错误堆栈分析

---

**文档版本**: 1.0
**最后更新**: 2025-11-15
