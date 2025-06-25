# 🚀 Cloudflare Pages 部署指南

本指南将帮助你将智能图像评分系统部署到Cloudflare Pages。

## 📋 部署前准备

### 1. 环境要求
- ✅ **Gemini API Key** - 从[Google AI Studio](https://makersuite.google.com/app/apikey)获取
- ✅ **Git仓库** - 代码托管在GitHub/GitLab
- ✅ **Cloudflare账户** - 免费账户即可

### 2. 项目架构
```
fon_v50/
├── functions/
│   └── api/
│       └── chat.js          # Cloudflare Pages Functions (API代理)
├── src/                     # Next.js前端源码
├── out/                     # Next.js静态构建输出
├── wrangler.toml           # Cloudflare配置
└── .dev.vars.example       # 环境变量模板
```

## 🔧 部署方法

### 方法A：Git连接部署（推荐）

#### 步骤1：推送代码到Git仓库
```bash
# 如果还没有初始化git
git init
git add .
git commit -m "Initial commit"

# 推送到GitHub/GitLab
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

#### 步骤2：创建Cloudflare Pages项目
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击左侧菜单 **Pages** → **Create a project**
3. 选择 **Connect to Git**
4. 选择你的Git提供商（GitHub/GitLab）
5. 授权并选择仓库

#### 步骤3：配置构建设置
```
项目名称: fon-v50-app (或自定义)
生产分支: main
构建命令: npm run build
构建输出目录: out
```

#### 步骤4：设置环境变量
在项目设置 → 环境变量中添加：

**生产环境变量：**
```
GEMINI_API_KEY = AIza_你的真实Gemini_API密钥
ALLOWED_ORIGINS = https://你的项目名.pages.dev
NODE_VERSION = 18
```

**可选变量：**
```
API_ENDPOINT = https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

#### 步骤5：部署
点击 **Save and Deploy**，等待构建完成。

### 方法B：Wrangler CLI部署

#### 步骤1：安装Wrangler
```bash
npm install -g wrangler
```

#### 步骤2：登录Cloudflare
```bash
wrangler login
```

#### 步骤3：构建项目
```bash
npm run build
```

#### 步骤4：部署
```bash
npm run deploy
```

## 🔧 本地开发

### 1. 设置本地环境变量
```bash
# 复制环境变量模板
copy .dev.vars.example .dev.vars

# 编辑 .dev.vars 填入真实值
```

`.dev.vars` 内容示例：
```env
GEMINI_API_KEY=AIza_你的真实密钥
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 2. 启动开发服务器
```bash
# 启动Next.js开发服务器
npm run dev

# 或启动完整的Cloudflare环境
npm run dev:full
```

## 🌐 访问和验证

### 部署成功后访问：
- **前端应用**: `https://你的项目名.pages.dev`
- **API端点**: `https://你的项目名.pages.dev/api/chat`

### 验证检查清单：
- ✅ 前端页面正常加载
- ✅ 图片上传功能正常
- ✅ AI分析按钮可以点击
- ✅ 分析结果正常显示
- ✅ 保存功能正常工作

## 🔒 安全配置

### 1. 更新ALLOWED_ORIGINS
部署后务必更新环境变量：
```
ALLOWED_ORIGINS = https://你的实际域名.pages.dev,https://你的自定义域名
```

### 2. 自定义域名（可选）
1. 在Cloudflare Pages项目设置中
2. 点击 **Custom domains**
3. 添加你的域名
4. 更新DNS记录

## 📊 监控和日志

### 查看部署日志：
1. Cloudflare Dashboard → Pages → 你的项目
2. 点击最新部署查看构建日志

### 查看Functions日志：
1. 项目设置 → Functions
2. 查看实时日志和错误信息

### 性能监控：
- 访问 Analytics 查看流量和性能数据
- 设置告警监控异常情况

## 🛠️ 故障排除

### 常见问题：

#### 1. 构建失败
```
解决方案：
- 检查Node.js版本（需要>=18）
- 确认package.json中的依赖版本
- 查看构建日志定位具体错误
```

#### 2. API调用失败
```
解决方案：
- 检查GEMINI_API_KEY是否正确设置
- 确认ALLOWED_ORIGINS包含当前域名
- 查看浏览器控制台网络请求
```

#### 3. CORS错误
```
解决方案：
- 确认请求来源域名在白名单中
- 检查是否有正确的Origin头
- 更新ALLOWED_ORIGINS环境变量
```

#### 4. Functions超时
```
解决方案：
- Cloudflare Pages Functions有CPU时间限制
- 优化API请求逻辑
- 考虑使用Workers替代复杂逻辑
```

## 🔄 更新部署

### Git连接项目：
```bash
# 更新代码
git add .
git commit -m "Update: 你的更新说明"
git push

# Cloudflare会自动检测并重新部署
```

### Wrangler CLI项目：
```bash
# 重新构建和部署
npm run build
npm run deploy
```

## 💰 成本说明

### Cloudflare Pages免费额度：
- ✅ **构建**: 500次/月
- ✅ **流量**: 100GB/月
- ✅ **Functions请求**: 100,000次/月
- ✅ **Functions CPU时间**: 30秒/请求

对于个人项目和小型应用，免费额度通常足够使用。

## 🎯 最佳实践

1. **分支保护**: 设置main分支保护，通过PR合并
2. **环境分离**: 使用preview分支进行测试
3. **监控告警**: 设置异常情况告警
4. **性能优化**: 定期检查Core Web Vitals
5. **安全更新**: 定期更新依赖包版本

完成部署后，你的智能图像评分系统就可以在全球CDN网络上运行了！🎉 