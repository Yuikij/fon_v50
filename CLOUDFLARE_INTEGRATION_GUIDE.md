# Cloudflare Pages 整合部署指南

本指南介绍如何将原有的Workers代理服务整合到Cloudflare Pages项目中。

## 整合概述

- ✅ **原有Workers代码** → **Pages Functions** (`functions/api/chat.js`)
- ✅ **前端代码修改** → 使用相对路径 `/api/chat`
- ✅ **统一部署** → 单个Cloudflare Pages项目

## 项目结构

```
fon_v50/
├── functions/
│   └── api/
│       └── chat.js          # Pages Functions API代理
├── dist/                    # 构建输出目录
├── wrangler.toml           # Cloudflare配置
├── .dev.vars.example       # 本地环境变量示例
└── ... (其他前端文件)
```

## 部署步骤

### 1. 准备环境变量

在Cloudflare Pages控制台设置以下环境变量：

**生产环境变量：**
```
GEMINI_API_KEY=AIza_your_gemini_api_key_here
ALLOWED_ORIGINS=https://你的域名.pages.dev,https://你的自定义域名
```

**可选变量：**
```
API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
RATE_LIMIT=your_kv_namespace_id
```

### 2. 本地开发

1. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 复制环境变量文件：
```bash
cp .dev.vars.example .dev.vars
```

3. 编辑 `.dev.vars` 填入真实值

4. 启动本地开发：
```bash
# 启动前端开发服务器
npm run dev

# 在另一个终端启动Pages Functions
npx wrangler pages dev dist/prod --port 8080
```

### 3. 部署到Cloudflare Pages

#### 方法A：通过Git连接（推荐）

1. 将代码推送到GitHub/GitLab仓库
2. 在Cloudflare Dashboard创建Pages项目
3. 连接你的Git仓库
4. 设置构建命令：`npm run build:prod`
5. 设置输出目录：`dist/prod`
6. 在环境变量页面设置上述变量

#### 方法B：使用Wrangler CLI

```bash
# 构建项目
npm run build:prod

# 部署
npx wrangler pages deploy dist/prod --project-name=fon-v50-app
```

### 4. 验证部署

部署完成后访问：
- `https://你的域名.pages.dev` - 前端应用
- `https://你的域名.pages.dev/api/chat` - API端点（应返回404或OPTIONS成功）

## 环境变量说明

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `GEMINI_API_KEY` | ✅ | Gemini API密钥 | `AIza...` |
| `ALLOWED_ORIGINS` | ✅ | 允许的域名（逗号分隔） | `https://app.pages.dev,https://mydomain.com` |
| `API_ENDPOINT` | ❌ | Gemini API端点 | 默认值已内置 |
| `RATE_LIMIT` | ❌ | KV存储命名空间ID | 用于频率限制 |

## 安全特性

整合后的解决方案包含以下安全特性：

1. **域名白名单** - 只允许指定域名访问API
2. **CORS保护** - 动态CORS头设置
3. **频率限制** - 基于IP的请求频率限制
4. **API密钥隐藏** - 前端无法访问真实API密钥

## 故障排除

### API调用失败
- 检查环境变量是否正确设置
- 确认 `ALLOWED_ORIGINS` 包含当前域名
- 查看浏览器控制台网络请求

### CORS错误
- 确认请求来源域名在白名单中
- 检查是否包含正确的Origin头

### 频率限制
- 检查KV存储配置
- 可以临时禁用频率限制进行调试

## 迁移优势

相比独立Workers部署，整合方案具有以下优势：

1. **统一管理** - 前端和API在同一项目中
2. **简化部署** - 单次部署包含所有组件
3. **成本优化** - 减少多个服务的管理开销
4. **开发体验** - 本地开发更容易调试

## 注意事项

1. **Functions限制** - Pages Functions有执行时间和内存限制
2. **冷启动** - 首次请求可能有轻微延迟
3. **KV存储** - 频率限制功能需要配置KV命名空间

部署完成后，你的应用将拥有与原Workers相同的功能，但管理更简单。 