# 简化模板 - Cloudflare Workers

这是一个简化的 Cloudflare Workers 模板，演示如何从 Workers 调用接口获取环境变量并显示在前端。

## 功能特性

- ✅ 简洁的前端界面
- ✅ Cloudflare Workers API
- ✅ 环境变量读取
- ✅ CORS 支持
- ✅ 现代 JavaScript

## 项目结构

```
├── index.html              # 前端页面
├── functions/api/hello.js   # Workers 函数
├── wrangler.jsonc          # Cloudflare 配置
├── .dev.vars               # 开发环境变量
├── package.json            # 项目配置
└── README.md               # 文档
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.dev.vars` 文件并修改其中的 `hello` 变量值。

### 3. 本地开发

```bash
npm run dev
```

访问本地开发服务器，点击按钮测试 API 调用。

### 4. 部署到 Cloudflare

```bash
npm run deploy
```

部署前请确保：
- 已安装 Wrangler CLI
- 已登录 Cloudflare 账户
- 在 Cloudflare Dashboard 中配置了生产环境的 `hello` 变量

## API 接口

### GET /api/hello

返回环境变量 `hello` 的值。

**响应示例：**

```json
{
  "message": "Hello from Cloudflare Workers!",
  "timestamp": "2025-01-28T10:30:00.000Z"
}
```

## 环境变量配置

### 开发环境

在 `.dev.vars` 文件中配置：

```
hello = "你的开发环境消息"
```

### 生产环境

在 Cloudflare Dashboard 中的 Workers & Pages > 你的项目 > Settings > Environment variables 添加：

- `hello`: 你的生产环境消息

## 技术栈

- **前端**: 原生 HTML/CSS/JavaScript
- **后端**: Cloudflare Workers
- **部署**: Cloudflare Workers Platform

## 开发说明

1. 修改 `functions/api/hello.js` 来更改 API 逻辑
2. 修改 `index.html` 来更改前端界面
3. 在 `wrangler.jsonc` 中配置 Workers 选项
4. 使用 `.dev.vars` 管理开发环境变量

## 许可证

MIT License 