# 多语言开发快速指南

本文档是 [I18N.md](./I18N.md) 的精简版，专为开发者快速上手。

---

## 🚀 3分钟快速开始

### 1. 理解URL规则

```
✅ 英文（默认）: /about          (无前缀)
✅ 中文:         /zh/about       (有前缀)
✅ 日文:         /ja/about       (有前缀)
```

**关键**: 默认语言（英文）URL最简洁，符合SEO最佳实践。

---

### 2. 核心配置（已完成）

以下文件已经创建完毕，**无需修改**：

| 文件 | 作用 |
|-----|------|
| `apps/web/middleware.ts` | URL路由控制 |
| `apps/web/i18n.ts` | 翻译加载配置 |
| `apps/web/locales/en.json` | 英文翻译 |
| `apps/web/locales/zh.json` | 中文翻译 |

---

### 3. 创建多语言页面（3行代码）

```typescript
// app/[locale]/page.tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');  // 1. 获取翻译函数

  return (
    <main>
      <h1>{t('hero.title')}</h1>       // 2. 使用翻译
      <p>{t('hero.subtitle')}</p>
    </main>
  );
}
```

**就这么简单！** 英文访问 `/`，中文访问 `/zh` 即可看到对应翻译。

---

### 4. 创建多语言链接

```typescript
// components/Navigation.tsx
import { Link } from 'next-intl';  // ✅ 使用 next-intl 的 Link

export function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/tests">Tests</Link>
      <Link href="/docs">Docs</Link>
    </nav>
  );
}
```

**自动魔法**:
- 英文下 `<Link href="/tests">` → `/tests`
- 中文下 `<Link href="/tests">` → `/zh/tests`

---

### 5. 语言切换器

```typescript
// components/LanguageSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPath = newLocale === 'en'
      ? pathWithoutLocale || '/'
      : `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <select value={locale} onChange={(e) => switchLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="zh">简体中文</option>
      <option value="ja">日本語</option>
    </select>
  );
}
```

---

## 📝 添加新翻译（2步）

### 步骤1: 在翻译文件中添加key

```json
// locales/en.json
{
  "home": {
    "newFeature": "This is a new feature"  // ← 新增
  }
}

// locales/zh.json
{
  "home": {
    "newFeature": "这是一个新功能"  // ← 新增
  }
}
```

### 步骤2: 在组件中使用

```typescript
const t = useTranslations('home');
<p>{t('newFeature')}</p>
```

---

## 🌍 添加新语言（3步）

### 步骤1: 创建翻译文件

```bash
cp locales/en.json locales/fr.json
# 然后翻译 fr.json 的内容
```

### 步骤2: 注册语言

```typescript
// middleware.ts 和 i18n.ts 中同步添加
locales: ['en', 'zh', 'ja', 'fr']  // ← 添加 'fr'
```

### 步骤3: 更新语言切换器

```typescript
<option value="fr">Français</option>
```

**完成！** 访问 `/fr` 即可看到法文版本。

---

## ❌ 常见错误

| 错误 | 后果 |
|-----|------|
| `import Link from 'next/link'` | 链接不会自动添加语言前缀 |
| 硬编码文本 `<h1>Hello</h1>` | 无法翻译 |
| 在 `app/` 根目录创建 `page.tsx` | 路由冲突 |
| 手动拼接 URL `/${locale}/about` | 维护困难 |

---

## ✅ 开发检查清单

```
☑ 所有页面都在 app/[locale]/ 目录下
☑ 使用 next-intl 的 Link 组件
☑ 所有文本使用 t() 函数
☑ 翻译文件 JSON 格式正确
☑ 英文 URL 无前缀（/about）
☑ 其他语言 URL 有前缀（/zh/about）
```

---

## 📚 完整文档

详细文档请参考: [I18N.md](./I18N.md)

---

**开始开发吧！** 🚀
