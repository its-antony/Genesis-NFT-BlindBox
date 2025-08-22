import { NextRequest, NextResponse } from 'next/server';

/**
 * API路由：代理NFT元数据请求，解决CORS跨域问题
 * 
 * 使用方式：
 * GET /api/metadata?url=http://47.108.146.210:8889/tmp/1.json
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metadataUrl = searchParams.get('url');

    if (!metadataUrl) {
      return NextResponse.json(
        { error: '缺少url参数' },
        { status: 400 }
      );
    }

    // 验证URL格式
    try {
      new URL(metadataUrl);
    } catch {
      return NextResponse.json(
        { error: '无效的URL格式' },
        { status: 400 }
      );
    }

    console.log('🔍 代理获取元数据:', metadataUrl);

    // 发起请求获取元数据
    const response = await fetch(metadataUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Genesis-NFT-Frontend/1.0',
      },
      // 设置超时时间
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    if (!response.ok) {
      console.error('❌ 元数据获取失败:', response.status, response.statusText);
      return NextResponse.json(
        { 
          error: `获取元数据失败: ${response.status} ${response.statusText}`,
          url: metadataUrl 
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.warn('⚠️ 响应不是JSON格式:', contentType);
    }

    const metadata = await response.json();
    console.log('✅ 元数据获取成功:', metadata.name || 'Unknown NFT');

    // 返回元数据，并设置适当的缓存头
    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 缓存5分钟
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ API代理错误:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: '请求超时，请稍后重试' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { 
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
