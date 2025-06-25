'use client';

import { useState } from 'react';
import Image from "next/image";

interface ApiResponse {
  message: string;
  timestamp: string;
  source: string;
  error?: string;
}

export default function Home() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using relative path to call our API
      const res = await fetch('/api/hello', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data: ApiResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Next.js + Cloudflare Workers 演示
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              点击按钮调用 Cloudflare Workers API 获取环境变量 <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">env.hello</code>
            </p>
            
            <div className="text-center mb-6">
              <button
                onClick={callApi}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {loading ? '调用中...' : '调用 API'}
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
                <p className="text-red-600 dark:text-red-300">
                  <strong>错误:</strong> {error}
                </p>
              </div>
            )}
            
            {response && (
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                  API 响应:
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-green-700 dark:text-green-300">消息:</span>
                    <span className="ml-2 text-green-600 dark:text-green-400">{response.message}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-700 dark:text-green-300">时间:</span>
                    <span className="ml-2 text-green-600 dark:text-green-400">{response.timestamp}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-700 dark:text-green-300">来源:</span>
                    <span className="ml-2 text-green-600 dark:text-green-400">{response.source}</span>
                  </div>
                  {response.error && (
                    <div>
                      <span className="font-medium text-red-700 dark:text-red-300">错误:</span>
                      <span className="ml-2 text-red-600 dark:text-red-400">{response.error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                这是一个简化的模板，展示了 Next.js 前端与 Cloudflare Workers 后端的集成
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
