import { systemPrompts, apiConfig } from '@/config';
import { AIType, AnalysisResult, GeminiRequest, GeminiResponse, ApiError } from '@/types';

// 请求限制管理
class RateLimiter {
  private requests: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    // 清理过期记录
    this.requests = this.requests.filter(time => time > oneHourAgo);

    const recentRequests = this.requests.filter(time => time > oneMinuteAgo);

    if (recentRequests.length >= apiConfig.rateLimit.maxRequestsPerMinute) {
      throw new Error('请求过于频繁，请稍后再试');
    }

    if (this.requests.length >= apiConfig.rateLimit.maxRequestsPerHour) {
      throw new Error('已达到每小时请求限制');
    }

    this.requests.push(now);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// 主要的分析函数
export async function analyzeImage(imageDataUrl: string, aiType: AIType): Promise<AnalysisResult> {
  try {
    rateLimiter.canMakeRequest();

    const systemPrompt = systemPrompts[aiType];
    const base64Data = imageDataUrl.split(',')[1];
    const mimeType = imageDataUrl.split(';')[0].split(':')[1];

    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\n请分析这张图片并决定的：上还是不上？`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    };

    const response = await fetch(apiConfig.endpoints.proxy, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorText = await response.text();
      try {
        const errorJson: ApiError = JSON.parse(errorText);
        errorText = errorJson.error ? errorJson.error.message : errorText;
      } catch (e) {
        // 保持为纯文本
      }
      throw new Error(`API返回错误 (状态 ${response.status}): ${errorText}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0]) {
      throw new Error('API响应格式不正确，缺少必要数据');
    }

    const content = data.candidates[0].content.parts[0].text;

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      try {
        const textParsed = parseTextResponse(content);
        return textParsed;
      } catch (finalError) {
        throw new Error(`JSON解析和文本解析均失败: ${finalError instanceof Error ? finalError.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('分析过程中发生未知错误');
  }
}

// 文本响应解析函数
function parseTextResponse(text: string): AnalysisResult {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      const jsonText = jsonMatch[1];
      const parsed = JSON.parse(jsonText);
      return parsed;
    }
  } catch (e) {
    // 忽略错误，尝试更宽松的解析
  }

  try {
    // 尝试在没有```json标记的情况下查找JSON对象
    const jsonContentMatch = text.match(/{\s*["']verdict["']\s*:/);
    if (jsonContentMatch) {
      const startIndex = jsonContentMatch.index!;
      // 找到匹配的大括号
      let balance = 0;
      let endIndex = -1;
      for (let i = startIndex; i < text.length; i++) {
        if (text[i] === '{') {
          balance++;
        } else if (text[i] === '}') {
          balance--;
          if (balance === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }

      if (endIndex !== -1) {
        const jsonText = text.substring(startIndex, endIndex);
        const parsed = JSON.parse(jsonText);
        return parsed;
      }
    }
  } catch (e) {
    // 忽略错误，继续
  }

  // 尝试不严格的JSON解析
  try {
    const result = flexibleJsonParse(text);
    return result;
  } catch (e) {
    // 最终回退到纯文本解析
  }

  return fallbackToTextParsing(text);
}

function fallbackToTextParsing(text: string): AnalysisResult {
  const result: AnalysisResult = {
    verdict: "PASS",
    rating: 0,
    explanation: text, // 原始文本作为解释
  };

  const verdictMatch = text.match(/["']?verdict["']?\s*:\s*["']?(\w+)["']?/i);
  if (verdictMatch && verdictMatch[1]) {
    result.verdict = verdictMatch[1].toUpperCase() as AnalysisResult['verdict'];
  }

  const ratingMatch = text.match(/["']?rating["']?\s*:\s*(\d+)/i);
  if (ratingMatch && ratingMatch[1]) {
    result.rating = parseInt(ratingMatch[1], 10);
  }

  const explanationMatch = text.match(/["']?explanation["']?\s*:\s*["']([\s\S]*?)["']?/i);
  if (explanationMatch && explanationMatch[1]) {
    result.explanation = explanationMatch[1].trim();
  }

  return result;
}

function flexibleJsonParse(str: string): AnalysisResult {
  try {
    // 尝试直接解析
    return JSON.parse(str);
  } catch (e1) {
    try {
      // 尝试移除代码块标记
      const cleaned = str.replace(/```json\s*|\s*```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e2) {
      try {
        // 尝试修复常见的JSON问题
        const fixed = str
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // 为键添加引号
          .replace(/:\s*([^",{\[\]}\s]+)(?=\s*[,}])/g, ':"$1"') // 为值添加引号
          .replace(/,(\s*[}\]])/g, '$1'); // 移除尾随逗号
        return JSON.parse(fixed);
      } catch (e3) {
        throw new Error('无法解析JSON响应');
      }
    }
  }
} 