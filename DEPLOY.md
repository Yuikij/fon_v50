# 部署说明

## 本地开发

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量（编辑 `.dev.vars` 文件）：
```
hello = "Hello from local development!"
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 访问 `http://localhost:8787` 测试功能

## 部署到 Cloudflare

### 前提条件

1. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录 Cloudflare：
```bash
wrangler auth login
```

### 部署步骤

1. 构建项目：
```bash
npm run build
```

2. 部署到 Cloudflare：
```bash
npm run deploy
```

### 环境变量配置

在 Cloudflare Dashboard 中配置生产环境变量：

1. 进入 Workers & Pages
2. 选择你的项目
3. 进入 Settings > Environment variables
4. 添加变量：
   - 名称：`hello`
   - 值：`Hello from Cloudflare Workers!`

## 项目结构

```
├── index.html              # 前端页面
├── functions/api/hello.js   # Workers API 函数
├── wrangler.jsonc          # Cloudflare Workers 配置
├── .dev.vars               # 开发环境变量
├── package.json            # 项目配置
└── README.md               # 项目说明
```

## API 测试

部署后，你可以通过以下方式测试 API：

```bash
curl https://your-worker.your-subdomain.workers.dev/api/hello
```

预期响应：
```json
{
  "message": "Hello from Cloudflare Workers!",
  "timestamp": "2025-01-28T10:30:00.000Z"
}
``` 