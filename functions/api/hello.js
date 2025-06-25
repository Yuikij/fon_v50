// 简化的 Cloudflare Workers 函数
// 从环境变量获取 hello 并返回给前端

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    
    // API 路由处理
    if (url.pathname === '/api/hello') {
      const hello = env.hello || 'Hello World from Workers!';
      
      return new Response(JSON.stringify({ 
        message: hello,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 静态文件服务
    return env.ASSETS.fetch(request);
  }
}; 