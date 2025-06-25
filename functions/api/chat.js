// Cloudflare Pages Functions - Gemini API 代理服务
// 将原有的Workers代码整合到Pages Functions中

export async function onRequestPost(context) {
  const { request, env } = context;

  // 域名白名单检查
  if (!isAllowedOrigin(request, env)) {
    return createErrorResponse('Access denied: Origin not allowed', 403);
  }

  // 检查请求路径
  const url = new URL(request.url);
  if (url.pathname !== '/api/chat') {
    return createErrorResponse('Not found', 404);
  }

  try {
    // 从环境变量获取 API Key
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return createErrorResponse('API key not configured', 500);
    }

    // 获取 API 端点
    const apiEndpoint = env.API_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    // 解析请求体
    const requestBody = await request.json();
    
    // 验证请求体格式
    if (!requestBody.contents || !Array.isArray(requestBody.contents)) {
      return createErrorResponse('Invalid request format', 400);
    }

    // 可选：添加请求频率限制（根据 IP）
    const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For');
    if (clientIP && !(await checkRateLimit(clientIP, env))) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    // 构建发送到 Gemini API 的请求
    const geminiRequest = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare-Pages-Functions/1.0'
      },
      body: JSON.stringify({
        contents: requestBody.contents,
        generationConfig: {
          maxOutputTokens: requestBody.generationConfig?.maxOutputTokens || 1000,
          temperature: requestBody.generationConfig?.temperature || 0.7,
          topP: requestBody.generationConfig?.topP || 0.8,
          topK: requestBody.generationConfig?.topK || 40,
          ...requestBody.generationConfig
        },
        safetySettings: requestBody.safetySettings || []
      })
    };

    // 调用 Gemini API
    const geminiResponse = await fetch(`${apiEndpoint}?key=${apiKey}`, geminiRequest);
    
    // 获取响应数据
    const responseData = await geminiResponse.json();

    // 检查 API 响应状态
    if (!geminiResponse.ok) {
      console.error('Gemini API Error:', responseData);
      return createErrorResponse(
        responseData.error?.message || 'API request failed', 
        geminiResponse.status
      );
    }

    // 返回成功响应（使用动态 CORS 头）
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(request, env),
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Functions Error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// OPTIONS 预检请求处理
export async function onRequestOptions(context) {
  const { request, env } = context;
  return handleCors(request, env);
}

// 域名白名单检查函数
function isAllowedOrigin(request, env) {
  // 从环境变量获取允许的域名列表
  const allowedOrigins = env.ALLOWED_ORIGINS;
  
  if (!allowedOrigins) {
    // 如果没有设置白名单，默认拒绝所有请求
    console.warn('ALLOWED_ORIGINS not configured, denying all requests');
    return false;
  }

  // 解析允许的域名（支持多个域名，用逗号分隔）
  const allowedList = allowedOrigins.split(',').map(origin => origin.trim().toLowerCase());
  
  // 获取请求来源
  const origin = request.headers.get('Origin');
  const referer = request.headers.get('Referer');
  
  // 检查 Origin 头（优先）
  if (origin) {
    const originLower = origin.toLowerCase();
    if (allowedList.includes(originLower)) {
      return true;
    }
    
    // 检查是否包含通配符域名
    for (const allowed of allowedList) {
      if (allowed.startsWith('*.')) {
        const domain = allowed.substring(2);
        if (originLower.endsWith('.' + domain) || originLower === domain) {
          return true;
        }
      }
    }
  }
  
  // 如果没有 Origin，检查 Referer
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin.toLowerCase();
      
      if (allowedList.includes(refererOrigin)) {
        return true;
      }
      
      // 检查通配符域名
      for (const allowed of allowedList) {
        if (allowed.startsWith('*.')) {
          const domain = allowed.substring(2);
          if (refererOrigin.endsWith('.' + domain) || refererOrigin === `https://${domain}` || refererOrigin === `http://${domain}`) {
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Invalid referer URL:', referer);
    }
  }
  
  return false;
}

// 获取 CORS 头函数
function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  
  // 如果来源在白名单中，返回具体的 Origin
  if (origin && isAllowedOrigin(request, env)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true'
    };
  }
  
  // 否则返回限制性的头
  return {
    'Access-Control-Allow-Origin': 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// CORS 处理函数
function handleCors(request, env) {
  return new Response(null, {
    status: 200,
    headers: {
      ...getCorsHeaders(request, env),
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 错误响应创建函数
function createErrorResponse(message, status = 400) {
  return new Response(JSON.stringify({ 
    error: { 
      message,
      status 
    } 
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

// 简单的频率限制检查（可选功能）
async function checkRateLimit(clientIP, env) {
  try {
    // 使用 Cloudflare KV 存储进行频率限制
    // 这里是一个简单的实现，每分钟最多 10 次请求
    const key = `rate_limit:${clientIP}`;
    const current = await env.RATE_LIMIT?.get(key);
    const now = Date.now();
    const windowStart = Math.floor(now / 60000) * 60000; // 1分钟窗口
    
    if (current) {
      const data = JSON.parse(current);
      if (data.windowStart === windowStart && data.count >= 10) {
        return false; // 超过限制
      }
      
      if (data.windowStart === windowStart) {
        await env.RATE_LIMIT?.put(key, JSON.stringify({
          windowStart,
          count: data.count + 1
        }), { expirationTtl: 120 });
      } else {
        await env.RATE_LIMIT?.put(key, JSON.stringify({
          windowStart,
          count: 1
        }), { expirationTtl: 120 });
      }
    } else {
      await env.RATE_LIMIT?.put(key, JSON.stringify({
        windowStart,
        count: 1
      }), { expirationTtl: 120 });
    }
    
    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return true; // 如果检查失败，允许请求通过
  }
} 