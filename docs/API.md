# BrowserLeaks.io API 文档

**版本**: v1.0
**Base URL**: `https://api.browserleaks.io/v1`
**更新日期**: 2025-11-15

---

## 📌 概述

BrowserLeaks.io API 提供强大的浏览器指纹检测和隐私泄露分析能力。支持单次检测、批量检测和历史查询。

### 特性
- ✅ RESTful API设计
- ✅ JSON请求/响应
- ✅ Bearer Token认证
- ✅ 速率限制保护
- ✅ Webhook回调（Pro+）
- ✅ 批量检测（Pro+）
- ✅ 历史查询（Pro+）

---

## 🔐 认证

### 获取API Token

所有API请求需要在请求头中包含Bearer Token：

```http
Authorization: Bearer YOUR_API_TOKEN
```

#### 获取Token

```bash
curl -X POST https://api.browserleaks.io/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com"
  }'
```

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "bl_live_1a2b3c4d5e6f7g8h9i0j",
    "expiresAt": "2026-11-15T00:00:00Z",
    "tier": "free",
    "rateLimit": {
      "requests": 100,
      "period": "daily"
    }
  }
}
```

---

## 🌐 核心端点

### 1. 浏览器指纹检测

#### POST /v1/fingerprint

完整的浏览器指纹分析，包含30+种检测项。

**请求**:
```bash
curl -X POST https://api.browserleaks.io/v1/fingerprint \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "components": {
      "userAgent": "Mozilla/5.0...",
      "canvas": {
        "dataURL": "data:image/png;base64,...",
        "hash": "a1b2c3d4"
      },
      "webgl": {
        "vendor": "NVIDIA Corporation",
        "renderer": "GeForce RTX 3080"
      },
      "screen": {
        "width": 1920,
        "height": 1080,
        "colorDepth": 24
      },
      "timezone": "Asia/Shanghai",
      "languages": ["zh-CN", "en-US"],
      "plugins": ["Chrome PDF Plugin"],
      "fonts": ["Arial", "Helvetica"],
      "audio": {
        "hash": "e5f6g7h8",
        "sampleRate": 48000
      }
    },
    "options": {
      "includeScore": true,
      "includeRisks": true,
      "includerecommendations": true
    }
  }'
```

**响应**:
```json
{
  "success": true,
  "data": {
    "fingerprintId": "fp_1a2b3c4d5e6f7g8h9i0j",
    "hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "confidence": 0.95,
    "uniqueness": 0.87,
    "timestamp": 1700000000000,
    "privacyScore": {
      "total": 62,
      "riskLevel": "medium",
      "breakdown": {
        "fingerprintResistance": 18,
        "browserConfig": 14,
        "networkPrivacy": 15,
        "devicePrivacy": 15
      }
    },
    "components": {
      "canvas": {
        "hash": "a1b2c3d4",
        "uniqueness": 0.89,
        "spoofed": false
      },
      "webgl": {
        "vendor": "NVIDIA Corporation",
        "renderer": "GeForce RTX 3080",
        "hash": "e5f6g7h8",
        "uniqueness": 0.92
      },
      "screen": {
        "resolution": "1920x1080",
        "colorDepth": 24,
        "uniqueness": 0.45
      },
      "timezone": {
        "value": "Asia/Shanghai",
        "offset": -480,
        "consistent": true,
        "spoofed": false
      },
      "audio": {
        "hash": "i9j0k1l2",
        "uniqueness": 0.78
      },
      "fonts": {
        "count": 85,
        "hash": "m3n4o5p6",
        "uniqueness": 0.65
      }
    },
    "risks": [
      {
        "category": "fingerprint",
        "severity": "high",
        "title": "Canvas指纹高度独特",
        "description": "您的Canvas指纹在所有用户中独特性为89%，容易被追踪",
        "recommendation": "使用隐私浏览器（如Tor Browser）或Canvas指纹随机化扩展"
      },
      {
        "category": "fingerprint",
        "severity": "medium",
        "title": "WebGL指纹暴露GPU信息",
        "description": "WebGL暴露了您的GPU型号（GeForce RTX 3080），增加可识别性",
        "recommendation": "禁用WebGL或使用GPU伪装扩展"
      }
    ],
    "browser": {
      "name": "Chrome",
      "version": "120.0.0.0",
      "isHeadless": false,
      "isBot": false
    },
    "device": {
      "type": "desktop",
      "vendor": "unknown",
      "model": "unknown"
    }
  }
}
```

**速率限制**:
- 免费: 100次/天
- Starter: 10,000次/月
- Pro: 100,000次/月
- Enterprise: 无限

---

### 2. IP检测

#### POST /v1/detect/ip

检测IP地址、地理位置、VPN/代理等信息。

**请求**:
```bash
curl -X POST https://api.browserleaks.io/v1/detect/ip \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "8.8.8.8",
    "options": {
      "includeGeo": true,
      "includeVPN": true,
      "includeReputation": true
    }
  }'
```

**响应**:
```json
{
  "success": true,
  "data": {
    "ip": "8.8.8.8",
    "version": "ipv4",
    "geo": {
      "country": "United States",
      "countryCode": "US",
      "city": "Mountain View",
      "region": "California",
      "latitude": 37.386,
      "longitude": -122.084,
      "timezone": "America/Los_Angeles",
      "postalCode": "94035"
    },
    "network": {
      "isp": "Google LLC",
      "asn": "AS15169",
      "organization": "Google Public DNS"
    },
    "privacy": {
      "isProxy": false,
      "isVPN": false,
      "isDatacenter": true,
      "isTor": false,
      "isRelay": false
    },
    "reputation": {
      "score": 95,
      "isBlacklisted": false,
      "categories": []
    }
  }
}
```

---

### 3. DNS泄露检测

#### POST /v1/detect/dns-leak

检测DNS泄露风险。

**请求**:
```bash
curl -X POST https://api.browserleaks.io/v1/detect/dns-leak \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testId": "test_1a2b3c4d",
    "userIp": "203.0.113.1",
    "userCountry": "US"
  }'
```

**响应**:
```json
{
  "success": true,
  "data": {
    "testId": "test_1a2b3c4d",
    "isLeak": true,
    "leakType": "partial",
    "servers": [
      {
        "ip": "8.8.8.8",
        "country": "US",
        "countryCode": "US",
        "isp": "Google LLC",
        "isISP": false
      },
      {
        "ip": "114.114.114.114",
        "country": "China",
        "countryCode": "CN",
        "isp": "ChinaNet",
        "isISP": true
      }
    ],
    "risks": [
      {
        "severity": "high",
        "title": "DNS服务器位于不同国家",
        "description": "检测到您的DNS请求分布在美国和中国，可能泄露真实位置"
      },
      {
        "severity": "medium",
        "title": "使用ISP默认DNS",
        "description": "检测到114.114.114.114是ISP默认DNS，可能被记录查询历史"
      }
    ],
    "recommendations": [
      "使用加密DNS（DoH/DoT）",
      "使用隐私友好的DNS服务（如Cloudflare 1.1.1.1）",
      "确保VPN配置正确，防止DNS泄露"
    ]
  }
}
```

---

### 4. WebRTC泄露检测

#### POST /v1/detect/webrtc-leak

检测WebRTC导致的IP泄露。

**请求**:
```bash
curl -X POST https://api.browserleaks.io/v1/detect/webrtc-leak \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "publicIp": "203.0.113.1",
    "localIPs": ["192.168.1.100", "fe80::1"],
    "candidates": [
      {
        "ip": "203.0.113.1",
        "type": "srflx",
        "server": "stun.l.google.com:19302"
      },
      {
        "ip": "192.168.1.100",
        "type": "host"
      }
    ]
  }'
```

**响应**:
```json
{
  "success": true,
  "data": {
    "isLeak": false,
    "localIPs": ["192.168.1.100", "fe80::1"],
    "publicIPs": ["203.0.113.1"],
    "natType": "srflx",
    "mdnsLeak": false,
    "ipv6Leak": false,
    "riskLevel": "low",
    "stunResults": [
      {
        "server": "stun.l.google.com:19302",
        "ip": "203.0.113.1",
        "country": "US",
        "latency": 45
      }
    ],
    "risks": [],
    "recommendations": [
      "当前WebRTC配置安全，未检测到泄露"
    ]
  }
}
```

---

### 5. 批量检测 (Pro+)

#### POST /v1/batch

批量提交多个检测任务。

**请求**:
```bash
curl -X POST https://api.browserleaks.io/v1/batch \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobs": [
      {
        "type": "fingerprint",
        "data": { "components": {...} }
      },
      {
        "type": "ip",
        "data": { "ip": "8.8.8.8" }
      },
      {
        "type": "dns-leak",
        "data": { "testId": "test_123" }
      }
    ],
    "webhook": "https://your-server.com/webhook"
  }'
```

**响应**:
```json
{
  "success": true,
  "data": {
    "batchId": "batch_1a2b3c4d5e6f",
    "status": "processing",
    "totalJobs": 3,
    "completedJobs": 0,
    "estimatedTime": 5,
    "webhookUrl": "https://your-server.com/webhook"
  }
}
```

**Webhook回调**:
```json
{
  "batchId": "batch_1a2b3c4d5e6f",
  "status": "completed",
  "totalJobs": 3,
  "completedJobs": 3,
  "results": [
    {
      "jobId": 0,
      "type": "fingerprint",
      "success": true,
      "data": {...}
    },
    {
      "jobId": 1,
      "type": "ip",
      "success": true,
      "data": {...}
    },
    {
      "jobId": 2,
      "type": "dns-leak",
      "success": true,
      "data": {...}
    }
  ]
}
```

---

### 6. 查询批量任务状态

#### GET /v1/batch/:batchId

**请求**:
```bash
curl -X GET https://api.browserleaks.io/v1/batch/batch_1a2b3c4d5e6f \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**响应**: 同批量检测响应

---

### 7. 历史查询 (Pro+)

#### GET /v1/history

查询历史检测记录。

**请求**:
```bash
curl -X GET "https://api.browserleaks.io/v1/history?limit=10&offset=0&type=fingerprint" \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**响应**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "results": [
      {
        "id": "fp_1a2b3c4d",
        "type": "fingerprint",
        "timestamp": 1700000000000,
        "privacyScore": 62,
        "riskLevel": "medium"
      },
      {
        "id": "fp_2b3c4d5e",
        "type": "fingerprint",
        "timestamp": 1699900000000,
        "privacyScore": 58,
        "riskLevel": "medium"
      }
    ]
  }
}
```

---

### 8. 单条历史详情

#### GET /v1/history/:id

**请求**:
```bash
curl -X GET https://api.browserleaks.io/v1/history/fp_1a2b3c4d \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**响应**: 完整的检测结果（同 `/v1/fingerprint` 响应）

---

### 9. 统计数据

#### GET /v1/stats

获取API使用统计。

**请求**:
```bash
curl -X GET https://api.browserleaks.io/v1/stats \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

**响应**:
```json
{
  "success": true,
  "data": {
    "currentPeriod": {
      "requests": 85,
      "limit": 100,
      "remaining": 15,
      "resetAt": "2025-11-16T00:00:00Z"
    },
    "usage": {
      "today": 12,
      "thisWeek": 45,
      "thisMonth": 85
    },
    "breakdown": {
      "fingerprint": 50,
      "ip": 20,
      "dnsLeak": 10,
      "webrtcLeak": 5
    }
  }
}
```

---

## 📊 错误处理

### 标准错误响应

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 24 hours.",
    "details": {
      "limit": 100,
      "resetAt": "2025-11-16T00:00:00Z"
    }
  }
}
```

### 错误代码

| 代码 | HTTP状态 | 描述 |
|-----|---------|------|
| `INVALID_TOKEN` | 401 | Token无效或已过期 |
| `RATE_LIMIT_EXCEEDED` | 429 | 速率限制超出 |
| `INVALID_REQUEST` | 400 | 请求参数错误 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `SERVICE_UNAVAILABLE` | 503 | 服务暂时不可用 |
| `INSUFFICIENT_TIER` | 403 | 当前订阅层级不支持此功能 |

---

## ⚡ 速率限制

### 限制规则

| 订阅层级 | 请求限制 | 重置周期 |
|---------|---------|---------|
| 免费 | 100次 | 24小时 |
| Starter | 10,000次 | 30天 |
| Pro | 100,000次 | 30天 |
| Enterprise | 无限 | - |

### 响应头

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1700000000
```

---

## 🔗 Webhook

### 配置Webhook

在批量检测时提供webhook URL，任务完成后会自动回调。

**安全验证**:
所有webhook请求都包含签名头：

```http
X-BrowserLeaks-Signature: sha256=a1b2c3d4...
```

**验证方法**:
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === `sha256=${hash}`;
}
```

---

## 📦 SDK

### JavaScript/TypeScript

```bash
npm install @browserleaks/sdk
```

```typescript
import { BrowserLeaksClient } from '@browserleaks/sdk';

const client = new BrowserLeaksClient({
  apiKey: 'YOUR_API_TOKEN',
  baseURL: 'https://api.browserleaks.io/v1'
});

// 浏览器指纹检测
const result = await client.fingerprint.detect({
  includeScore: true,
  includeRisks: true
});

console.log(result.privacyScore.total); // 62

// IP检测
const ipResult = await client.ip.detect('8.8.8.8');
console.log(ipResult.geo.country); // "United States"

// 批量检测
const batch = await client.batch.create([
  { type: 'fingerprint', data: {...} },
  { type: 'ip', data: { ip: '8.8.8.8' } }
]);

console.log(batch.batchId); // "batch_1a2b3c4d5e6f"
```

### Python

```bash
pip install browserleaks
```

```python
from browserleaks import BrowserLeaksClient

client = BrowserLeaksClient(api_key='YOUR_API_TOKEN')

# 浏览器指纹检测
result = client.fingerprint.detect(
    include_score=True,
    include_risks=True
)

print(result.privacy_score.total)  # 62

# IP检测
ip_result = client.ip.detect('8.8.8.8')
print(ip_result.geo.country)  # "United States"
```

### Go

```bash
go get github.com/browserleaks/browserleaks-go
```

```go
package main

import (
    "github.com/browserleaks/browserleaks-go"
)

func main() {
    client := browserleaks.NewClient("YOUR_API_TOKEN")

    // 浏览器指纹检测
    result, err := client.Fingerprint.Detect(&browserleaks.FingerprintOptions{
        IncludeScore: true,
        IncludeRisks: true,
    })

    if err != nil {
        panic(err)
    }

    println(result.PrivacyScore.Total) // 62
}
```

---

## 🧪 测试环境

### 测试Token

测试环境使用不同的Base URL和Token：

```
Base URL: https://api-test.browserleaks.io/v1
Test Token: bl_test_1a2b3c4d5e6f7g8h9i0j
```

测试环境特点：
- 无速率限制
- 数据不会永久保存
- 可能返回模拟数据

---

## 📞 技术支持

### API问题反馈

- **Email**: api-support@browserleaks.io
- **Discord**: https://discord.gg/browserleaks
- **GitHub Issues**: https://github.com/browserleaks/api-issues

### 服务状态

实时服务状态：https://status.browserleaks.io

---

## 📄 变更日志

### v1.0 (2025-11-15)
- 初始版本发布
- 支持浏览器指纹检测
- 支持IP/DNS/WebRTC泄露检测
- 批量检测功能
- Webhook回调

---

**文档版本**: 1.0
**最后更新**: 2025-11-15
