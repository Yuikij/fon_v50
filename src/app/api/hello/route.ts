import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET(request: NextRequest) {
  try {
    // Get Cloudflare context and environment variables
    const { env } = await getCloudflareContext();
    
    // Get hello message from environment variables
    const hello = env.hello || 'Hello World from Next.js + Workers!';
    
    // Return JSON response
    return NextResponse.json({
      message: hello,
      timestamp: new Date().toISOString(),
      source: 'Next.js API Route + Cloudflare Workers'
    });
  } catch (error) {
    console.error('Error accessing Cloudflare context:', error);
    
    // Fallback response
    return NextResponse.json({
      message: 'Hello World (fallback)',
      timestamp: new Date().toISOString(),
      source: 'Next.js API Route (fallback)',
      error: 'Unable to access Cloudflare environment'
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
} 