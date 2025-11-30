# BrowserLeaks.io - 产品需求文档 (PRD)

**版本**: v1.0
**更新日期**: 2025-11-15
**作者**: Product Team
**项目地址**: https://browserleaks.io

---

## 📌 执行摘要

### 项目愿景
打造**下一代浏览器隐私检测平台**，通过最全面的泄露检测、智能隐私评分系统和深度教育内容，成为全球用户首选的浏览器隐私安全工具。

### 核心目标
1. **技术领先**: 提供30+种隐私泄露检测，超越所有竞品
2. **用户体验**: 现代化UI/UX，移动端完美适配，PWA支持
3. **商业价值**: 通过API服务、高级功能订阅实现商业化
4. **教育价值**: 提供深度教育内容，建立行业权威地位

### 目标用户
- **隐私爱好者**: 关注个人隐私保护的普通用户
- **安全研究员**: 需要全面指纹分析工具的安全专家
- **开发者**: 需要测试反指纹技术的浏览器/扩展开发者
- **企业客户**: 需要批量检测能力的B2B客户

---

## 🎯 市场分析

### 竞品对比

| 指标 | browserleaks.com | browserscan.net | **browserleaks.io** |
|------|------------------|-----------------|---------------------|
| **检测项目** | 17项 | 20+项 | **30+项** |
| **UI/UX** | 老旧界面 | 现代化 | **Next.js 15 + 暗黑模式** |
| **移动端** | 不友好 | 良好 | **PWA + 响应式** |
| **隐私评分** | ❌ | 基础评分 | **✅ AI驱动智能评分** |
| **历史对比** | ❌ | ❌ | **✅ 时间轴对比** |
| **分享功能** | ❌ | ❌ | **✅ 链接+二维码** |
| **导出报告** | ❌ | ❌ | **✅ PDF/JSON/CSV** |
| **API服务** | ❌ | ❌ | **✅ RESTful API** |
| **国际化** | 英文 | 16种语言 | **20+种语言** |
| **教育内容** | 基础说明 | 工具提示 | **深度文章+视频** |
| **开源** | ❌ | ❌ | **✅ MIT许可** |
| **性能** | 中等 | 良好 | **<100ms响应** |

### 差异化优势

#### 1. 技术深度
- **58个指纹采集器**: 基于creepjs，覆盖Canvas、WebGL、Audio、WebRTC、Font、CSS等
- **IP情报整合**: 复用my-ip-data的8M+IP数据库
- **多源验证**: DNS泄露检测使用4个独立验证源
- **实时检测**: WebSocket实时更新检测结果

#### 2. 用户体验
- **3秒全面扫描**: 并行检测架构，3秒内完成30+项检测
- **可视化仪表板**: Chart.js驱动的实时数据可视化
- **交互式教程**: 每个检测项都有详细解释和修复建议
- **快捷键支持**: 完整的键盘快捷键系统

#### 3. 数据价值
- **隐私评分算法**: 基于加权评分模型，给出0-100分的隐私指数
- **风险等级分类**: 低/中/高/严重四级风险分类
- **历史追踪**: 本地存储最近30天的检测历史
- **趋势分析**: 识别隐私配置的改善或恶化趋势

#### 4. 商业模式
- **免费层**: 基础检测功能完全免费
- **Pro订阅**: $9.99/月，历史无限、云端同步、PDF报告
- **API服务**: 按量计费，$0.01/次检测
- **企业版**: 私有部署，自定义检测规则

---

## 🏗️ 功能规划

### Phase 1: MVP (4-6周)

#### 1.1 核心检测页面 (10个)

##### 1.1.1 IP Leak Test
**路径**: `/tests/ip-leak`

**功能**:
- 检测真实IP地址（IPv4/IPv6）
- 多源IP获取（Cloudflare、IPify、QQ等10+源）
- 地理位置信息（国家、城市、经纬度）
- ISP/ASN信息
- 数据中心检测
- VPN/代理识别
- IP信誉评分

**数据源**:
- ipinfo.io API（主要）
- Cloudflare Radar API（备用）
- my-ip-data自建数据库

**实现细节**:
```typescript
interface IPLeakResult {
  ipv4: string | null;
  ipv6: string | null;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  asn: string;
  isProxy: boolean;
  isVPN: boolean;
  isDatacenter: boolean;
  reputationScore: number; // 0-100
  sources: Array<{
    name: string;
    ip: string;
    timestamp: number;
  }>;
}
```

**风险评估**:
- 所有源IP一致: 安全 ✅
- IP分布在多个国家: 严重风险 🔴
- 检测到数据中心IP: 中等风险 ⚠️

##### 1.1.2 DNS Leak Test
**路径**: `/tests/dns-leak`

**功能**:
- 4源DNS泄露检测（复用MyIP-main实现）
- DNS服务器地理位置分析
- 运营商DNS识别
- 自定义DNS验证
- DNS over HTTPS (DoH) 检测
- DNS over TLS (DoT) 检测

**检测源**:
- ip-api.com EDNS
- Surfshark DNS Leak
- Cloudflare DNS Leak
- 自建检测服务器

**实现细节**:
```typescript
interface DNSLeakResult {
  servers: Array<{
    ip: string;
    country: string;
    isp: string;
    isISP: boolean; // 是否是ISP的DNS
  }>;
  isLeak: boolean;
  leakType: 'none' | 'partial' | 'full';
  dohEnabled: boolean;
  dotEnabled: boolean;
  recommendations: string[];
}
```

**判断逻辑**:
- DNS服务器与IP地址在同一国家: 可能泄露
- 使用ISP默认DNS: 高风险
- 使用第三方DNS（Google/Cloudflare）: 低风险

##### 1.1.3 WebRTC Leak Test
**路径**: `/tests/webrtc-leak`

**功能**:
- 本地IP泄露检测
- 公网IP泄露检测
- NAT类型识别（Host/Srflx/Prflx/Relay）
- STUN服务器测试（4个独立服务器）
- mDNS泄露检测（.local地址）
- IPv6泄露检测

**STUN服务器**:
- Google: stun.l.google.com:19302
- Cloudflare: stun.cloudflare.com
- Twilio: global.stun.twilio.com
- BlackBerry: stun.voip.blackberry.com:3478

**实现细节**:
```typescript
interface WebRTCLeakResult {
  localIPs: string[];
  publicIPs: string[];
  natType: 'host' | 'srflx' | 'prflx' | 'relay' | 'unknown';
  mdnsLeak: boolean;
  ipv6Leak: boolean;
  stunResults: Array<{
    server: string;
    ip: string;
    country: string;
    latency: number;
  }>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}
```

**风险评估**:
- 本地IP暴露: 中等风险（可能泄露内网结构）
- 公网IP与主IP不一致: 严重风险（VPN旁路）
- mDNS泄露: 高风险（可能暴露真实身份）

##### 1.1.4 Canvas Fingerprint
**路径**: `/tests/canvas-fingerprint`

**功能**:
- Canvas 2D渲染指纹
- 文本渲染差异
- 表情符号渲染
- 图形渲染测试
- 像素级差异分析
- 唯一性评分

**检测方法**:
```typescript
interface CanvasFingerprint {
  hash: string; // MurmurHash3
  uniqueness: number; // 0-1，越高越独特
  confidence: number; // 检测可信度
  dataURL: string; // Base64图像
  textMetrics: {
    width: number;
    height: number;
    baseline: number;
  };
  emojiRendering: boolean;
  spoofDetected: boolean; // 检测是否被篡改
}
```

**复用代码**: `creepjs/packages/core/src/collectors/canvas.ts`

##### 1.1.5 WebGL Fingerprint
**路径**: `/tests/webgl-fingerprint`

**功能**:
- GPU厂商/型号检测
- WebGL扩展枚举
- Shader编译结果
- 渲染性能测试
- 纹理能力测试
- 深度缓冲区测试

**检测数据**:
```typescript
interface WebGLFingerprint {
  vendor: string; // e.g., "NVIDIA Corporation"
  renderer: string; // e.g., "GeForce RTX 3080"
  version: string;
  shadingLanguageVersion: string;
  extensions: string[];
  parameters: Record<string, any>;
  hash: string;
  uniqueness: number;
  performanceScore: number;
}
```

**复用代码**: `creepjs/packages/core/src/collectors/webgl.ts`

##### 1.1.6 Audio Fingerprint
**路径**: `/tests/audio-fingerprint`

**功能**:
- AudioContext指纹
- 音频处理器特征
- 动态压缩器测试
- 振荡器波形分析
- 音频输出设备枚举

**检测方法**:
```typescript
interface AudioFingerprint {
  hash: string;
  sampleRate: number;
  channelCount: number;
  compressorNode: {
    reduction: number;
    threshold: number;
  };
  oscillatorValues: number[];
  devices: Array<{
    deviceId: string;
    label: string;
    groupId: string;
  }>;
  uniqueness: number;
}
```

**复用代码**: `creepjs/packages/core/src/collectors/audio.ts`

##### 1.1.7 Font Detection
**路径**: `/tests/font-fingerprint`

**功能**:
- 系统字体枚举（200+常见字体）
- 字体渲染差异检测
- CJK字体检测
- 自定义字体识别
- 字体指纹哈希

**字体列表**:
- 西文: Arial, Times New Roman, Helvetica, ...
- 中文: 微软雅黑, 宋体, 黑体, ...
- 日文: メイリオ, ヒラギノ, ...
- 韩文: 맑은 고딕, ...

**检测方法**:
```typescript
interface FontFingerprint {
  installedFonts: string[];
  fontCount: number;
  hash: string;
  uniqueness: number;
  cjkFonts: {
    chinese: string[];
    japanese: string[];
    korean: string[];
  };
  customFonts: string[];
}
```

**复用代码**: `creepjs/packages/core/src/collectors/fonts.ts`

##### 1.1.8 Timezone Leak
**路径**: `/tests/timezone-leak`

**功能**:
- 时区信息检测
- 时区偏移分析
- 夏令时状态
- Intl API时区
- Date API时区
- 时区一致性验证
- 时区伪造检测

**检测逻辑**:
```typescript
interface TimezoneLeakResult {
  timezone: string; // e.g., "Asia/Shanghai"
  offset: number; // UTC偏移（分钟）
  dstActive: boolean; // 是否夏令时
  intlTimezone: string;
  dateTimezone: string;
  isConsistent: boolean; // 各API是否一致
  isSpoofed: boolean; // 是否被伪造
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}
```

**风险评估**:
- 时区与IP地理位置不一致: 高风险
- 多个API返回不同时区: 伪造嫌疑
- 时区过于独特（如小岛国）: 增加可识别性

**复用代码**: `creepjs/packages/core/src/collectors/timezone.ts`

##### 1.1.9 Browser Fingerprint (综合)
**路径**: `/tests/browser-fingerprint`

**功能**:
- 综合40+种浏览器特征
- User-Agent分析
- Navigator属性
- Screen分辨率
- 硬件信息（CPU核心、内存）
- 插件检测
- 存储API检测
- 媒体查询

**数据结构**:
```typescript
interface BrowserFingerprint {
  hash: string; // 综合哈希
  confidence: number; // 0-1
  uniqueness: number; // 0-1
  components: {
    userAgent: string;
    platform: string;
    language: string[];
    screenResolution: { width: number; height: number };
    colorDepth: number;
    timezone: string;
    cpuClass: string;
    hardwareConcurrency: number;
    deviceMemory: number;
    plugins: string[];
    canvas: string;
    webgl: string;
    audio: string;
    fonts: string[];
    // ... 40+ more
  };
  spoofingIndicators: string[]; // 检测到的伪造迹象
  browserType: 'chrome' | 'firefox' | 'safari' | 'edge' | 'other';
  isHeadless: boolean; // 无头浏览器检测
  isBot: boolean; // 爬虫检测
}
```

**复用代码**: creepjs所有collectors的综合

##### 1.1.10 Privacy Score Dashboard
**路径**: `/dashboard` (首页)

**功能**:
- 实时隐私评分（0-100分）
- 风险等级可视化
- 所有检测项快速预览
- 一键全面扫描
- 扫描进度实时显示
- 历史评分趋势图

**评分算法**:
```typescript
interface PrivacyScore {
  totalScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  breakdown: {
    ipPrivacy: number; // 0-20
    dnsPrivacy: number; // 0-15
    webrtcPrivacy: number; // 0-15
    fingerprintResistance: number; // 0-30
    browserConfig: number; // 0-20
  };
  vulnerabilities: Array<{
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  timeline: Array<{
    timestamp: number;
    score: number;
  }>;
}
```

**评分权重**:
- IP隐私（20分）: IP泄露、VPN检测、数据中心检测
- DNS隐私（15分）: DNS泄露、DoH/DoT使用
- WebRTC隐私（15分）: 本地IP泄露、公网IP泄露、mDNS
- 指纹抵抗（30分）: Canvas、WebGL、Audio、Font唯一性
- 浏览器配置（20分）: Cookie、存储、隐私设置

---

#### 1.2 技术架构

##### 1.2.1 前端技术栈
```json
{
  "framework": "Next.js 15 (App Router)",
  "ui": "React 19 + TypeScript 5.7",
  "styling": "Tailwind CSS 4.0 + shadcn/ui",
  "stateManagement": "Zustand",
  "charts": "Chart.js 4.x + react-chartjs-2",
  "i18n": "next-intl",
  "pwa": "next-pwa",
  "testing": "Vitest + Playwright"
}
```

##### 1.2.2 后端技术栈
```json
{
  "runtime": "Node.js 20+",
  "framework": "Express 5.x",
  "database": "PostgreSQL (VPS Supabase)",
  "cache": "Redis",
  "validation": "Zod",
  "rateLimit": "express-rate-limit",
  "logging": "winston",
  "testing": "Vitest + Supertest"
}
```

##### 1.2.3 部署架构
```
用户浏览器
    │
    ├─→ Cloudflare CDN
    │       ├─→ Cloudflare Pages (Next.js SSG)
    │       │       └─→ 前端静态资源
    │       │
    │       └─→ Cloudflare Workers (可选)
    │               └─→ 边缘API加速
    │
    └─→ VPS API服务器 (93.127.133.204)
            ├─→ Express API (Port 4000)
            │       ├─→ /api/detect/ip
            │       ├─→ /api/detect/dns
            │       └─→ ... (其他检测端点)
            │
            ├─→ PostgreSQL (Port 54322)
            │       └─→ 检测历史、用户数据
            │
            └─→ Redis (Port 6379)
                    └─→ 缓存、限流
```

---

### Phase 2: 高级功能 (6-8周)

#### 2.1 高级检测页面 (10个)

##### 2.1.1 Extension Leak
**功能**: 检测浏览器扩展（AdBlock、Tampermonkey等）

##### 2.1.2 WebGPU Fingerprint
**功能**: 下一代GPU指纹（比WebGL更详细）

##### 2.1.3 Bot Detection
**功能**: 检测自动化工具（Puppeteer、Selenium）

##### 2.1.4 Incognito Mode Detection
**功能**: 检测隐私/无痕模式

##### 2.1.5 VPN/Proxy Detection
**功能**: 深度代理检测（TCP、HTTP、SOCKS）

##### 2.1.6 TLS/SSL Fingerprint
**功能**: TLS握手指纹（JA3）

##### 2.1.7 HTTP/2 Fingerprint
**功能**: HTTP/2连接特征分析

##### 2.1.8 Media Devices Leak
**功能**: 摄像头、麦克风、扬声器枚举

##### 2.1.9 Battery API Leak
**功能**: 电池状态泄露（充电状态、电量）

##### 2.1.10 Network Information API Leak
**功能**: 网络类型、速度、RTT泄露

#### 2.2 用户功能

##### 2.2.1 历史保存
- LocalStorage存储最近30次扫描
- 可选云端同步（需登录）
- 历史数据导出

##### 2.2.2 历史对比
- 时间轴视图
- 差异高亮
- 评分趋势图

##### 2.2.3 分享功能
- 生成唯一分享链接
- 二维码生成
- 社交媒体分享卡片

##### 2.2.4 导出报告
- PDF格式（完整报告）
- JSON格式（原始数据）
- CSV格式（表格数据）

---

### Phase 3: 商业化 (8-12周)

#### 3.1 API服务

##### 3.1.1 API端点
```
POST /api/v1/fingerprint
POST /api/v1/batch
GET  /api/v1/history/:id
GET  /api/v1/stats
```

##### 3.1.2 认证方式
- API Token（Bearer Token）
- 速率限制（免费：100次/天，付费：10000次/天）
- Webhook回调

##### 3.1.3 定价模型
| 套餐 | 价格 | 请求数 | 功能 |
|-----|------|--------|------|
| 免费 | $0 | 100/天 | 基础检测 |
| Starter | $29/月 | 10K/月 | 全部检测 |
| Pro | $99/月 | 100K/月 | 批量+Webhook |
| Enterprise | 定制 | 无限 | 私有部署 |

#### 3.2 订阅服务

##### 3.2.1 免费层
- 所有检测功能
- 本地历史（30天）
- 基础报告

##### 3.2.2 Pro订阅（$9.99/月）
- 无限历史
- 云端同步
- PDF专业报告
- 优先支持
- 无广告

##### 3.2.3 企业版（定制）
- 私有部署
- 自定义品牌
- 专属API
- SLA保障

#### 3.3 教育内容

##### 3.3.1 知识库
- 30+篇隐私保护文章
- 视频教程
- 案例研究
- 最佳实践

##### 3.3.2 博客
- 每周隐私新闻
- 技术深度解析
- 工具评测

##### 3.3.3 文档中心
- API文档
- 集成指南
- 故障排查

---

## 📊 成功指标 (KPI)

### 用户指标
- **DAU**: 10K+（第一季度）
- **注册用户**: 50K+（第一年）
- **付费转化率**: 3%
- **用户留存**: 40%（30天）

### 技术指标
- **首屏加载**: <2秒
- **API响应**: <100ms
- **检测准确率**: >95%
- **正常运行时间**: >99.9%

### 商业指标
- **MRR**: $10K+（第一年）
- **API调用**: 1M+/月
- **CAC**: <$20
- **LTV/CAC**: >3

### SEO指标
- **有机流量**: 50K+/月（第一年）
- **关键词排名**: Top 10（主要关键词）
- **反向链接**: 1000+

---

## 🚀 路线图

### Q1 2025 (MVP)
- ✅ 完成10个核心检测页面
- ✅ 隐私评分系统
- ✅ 响应式UI
- ✅ 国际化（英文、中文）

### Q2 2025 (高级功能)
- 10个高级检测页面
- 历史对比功能
- 分享和导出
- PWA支持

### Q3 2025 (商业化)
- API服务上线
- 订阅系统
- 支付集成
- 教育内容

### Q4 2025 (增长)
- 移动应用
- 浏览器扩展
- 企业版
- 全球扩张

---

## 🔐 隐私和安全

### 隐私承诺
1. **不收集个人数据**: 所有检测在浏览器端完成
2. **不存储指纹**: 不保存用户的浏览器指纹
3. **不跟踪用户**: 不使用第三方跟踪脚本
4. **开源透明**: 核心代码开源，接受社区审计

### 安全措施
1. **CSP策略**: 严格的内容安全策略
2. **HTTPS**: 全站HTTPS加密
3. **速率限制**: 防止滥用
4. **输入验证**: Zod严格校验

---

## 📈 营销策略

### SEO优化
- 关键词: "browser fingerprint", "privacy test", "IP leak test"
- 内容营销: 每周发布隐私相关文章
- 技术博客: 深度技术解析
- 外链建设: Reddit, HackerNews, ProductHunt

### 社交媒体
- Twitter: 隐私新闻、工具更新
- GitHub: 开源代码、社区互动
- YouTube: 视频教程、演示
- Reddit: r/privacy, r/VPN

### 合作伙伴
- VPN服务商: 互相推荐
- 浏览器厂商: 技术合作
- 安全公司: 联合营销

---

## 🎨 设计规范

### 视觉风格
- **主色调**: 蓝色（信任、科技）
- **辅助色**: 绿色（安全）、红色（风险）、黄色（警告）
- **字体**: Inter（西文）、思源黑体（中文）
- **图标**: Lucide Icons

### 组件库
- shadcn/ui
- 自定义组件：PrivacyScoreCard、LeakTestCard、TrendChart

### 暗黑模式
- 完整的暗黑主题支持
- 自动切换（系统偏好）
- 用户手动切换

---

## 🛠️ 技术债务管理

### 代码质量
- ESLint + Prettier
- TypeScript strict模式
- 单元测试覆盖率 >80%
- E2E测试覆盖核心流程

### 性能优化
- 代码分割（Next.js自动）
- 图片优化（next/image）
- 字体优化（next/font）
- 缓存策略（Redis + CDN）

### 可访问性
- WCAG 2.1 AA标准
- 键盘导航
- 屏幕阅读器支持
- 高对比度模式

---

## 📞 联系和支持

### 技术支持
- Email: support@browserleaks.io
- Discord: BrowserLeaks社区
- GitHub Issues: 开源项目反馈

### 商务合作
- Email: business@browserleaks.io
- Twitter: @browserleaks

---

## 附录

### A. 技术术语表
- **Canvas Fingerprint**: 基于Canvas API的浏览器指纹技术
- **WebRTC Leak**: WebRTC导致的真实IP泄露
- **DNS Leak**: DNS查询导致的隐私泄露
- **TLS Fingerprint**: TLS握手特征分析

### B. 参考资料
- [browserleaks.com](https://browserleaks.com)
- [browserscan.net](https://www.browserscan.net)
- [creepjs](https://github.com/abrahamjuliot/creepjs)
- [FingerprintJS](https://github.com/fingerprintjs/fingerprintjs)

### C. 更新日志
- 2025-11-15: v1.0 初始版本

---

**文档版本**: 1.0
**最后更新**: 2025-11-15
**状态**: 待审核
