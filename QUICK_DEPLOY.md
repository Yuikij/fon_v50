# ⚡ 快速部署指南

## 🎯 一分钟部署到Cloudflare Pages

### 准备工作
1. **获取Gemini API Key**: 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **准备Git仓库**: 代码上传到GitHub/GitLab

### 部署步骤

#### 1️⃣ 推送代码到Git
```bash
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

#### 2️⃣ 创建Cloudflare Pages项目
- 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/pages)
- 点击 **"Create a project"** → **"Connect to Git"**
- 选择你的仓库

#### 3️⃣ 配置构建设置
```
构建命令: npm run build
构建输出目录: out
根目录: / (默认)
```

#### 4️⃣ 设置环境变量
在项目设置中添加：
```
GEMINI_API_KEY = AIza_你的真实API密钥
ALLOWED_ORIGINS = https://你的项目名.pages.dev
NODE_VERSION = 18
```

#### 5️⃣ 部署完成 🎉
- 等待构建完成（约2-5分钟）
- 访问 `https://你的项目名.pages.dev`

## 🔧 CLI部署（可选）

### 使用Wrangler CLI
```bash
# 安装Wrangler
npm install -g wrangler

# 登录Cloudflare
wrangler login

# 构建项目
npm run build

# 部署
npm run deploy
```

## ⚠️ 常见问题

### 构建失败
- 确保 `NODE_VERSION=18` 环境变量已设置
- 检查 `package.json` 中的依赖版本

### API调用失败
- 检查 `GEMINI_API_KEY` 是否正确
- 确认 `ALLOWED_ORIGINS` 包含你的域名

### CORS错误
- 更新 `ALLOWED_ORIGINS` 包含实际部署域名
- 格式：`https://项目名.pages.dev`

## 📁 项目结构
```
fon_v50/
├── functions/api/chat.js    # API代理 (Cloudflare Pages Functions)
├── src/                     # Next.js源码
├── out/                     # 构建输出 (部署此目录)
├── wrangler.toml           # Cloudflare配置
└── package.json
```

## 🔄 更新部署
```bash
git add .
git commit -m "Update: 描述你的更改"
git push
# Cloudflare自动重新部署
```

## 💡 小贴士
- 免费版支持：500次构建/月，100GB流量/月
- 支持自定义域名
- 全球CDN加速
- 自动HTTPS

完成后访问你的应用：`https://项目名.pages.dev` 🚀 