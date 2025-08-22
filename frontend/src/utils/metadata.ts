/**
 * 元数据获取工具函数
 * 统一处理NFT元数据的获取，自动处理CORS跨域问题
 */

export interface MetadataFetchOptions {
  timeout?: number; // 超时时间，默认10秒
  retries?: number; // 重试次数，默认2次
  cache?: boolean;  // 是否缓存，默认true
}

/**
 * 获取NFT元数据，自动处理跨域问题
 * @param tokenURI - NFT的tokenURI
 * @param options - 获取选项
 * @returns Promise<any> - 元数据对象
 */
export async function fetchNFTMetadata(
  tokenURI: string, 
  options: MetadataFetchOptions = {}
): Promise<Record<string, unknown>> {
  const { timeout = 10000, retries = 2, cache = true } = options;

  if (!tokenURI) {
    throw new Error('TokenURI不能为空');
  }

  // console.log('🔍 获取NFT元数据:', tokenURI); // 减少日志输出

  let lastError: Error | null = null;

  // 重试逻辑
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let fetchUrl: string;
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      };

      // 添加超时控制
      if (timeout > 0) {
        fetchOptions.signal = AbortSignal.timeout(timeout);
      }

      // 判断是否需要使用代理
      if (tokenURI.startsWith('http://') || tokenURI.startsWith('https://')) {
        // 外部URL，使用API代理避免CORS问题
        fetchUrl = `/api/metadata?url=${encodeURIComponent(tokenURI)}`;
        // console.log(`🔄 使用API代理 (尝试 ${attempt + 1}/${retries + 1}):`, fetchUrl);
      } else {
        // 本地URL或相对路径，直接获取
        fetchUrl = tokenURI;
        // console.log(`📁 直接获取本地元数据 (尝试 ${attempt + 1}/${retries + 1}):`, fetchUrl);
      }

      // 添加缓存控制
      if (!cache) {
        fetchOptions.cache = 'no-cache';
      }

      const response = await fetch(fetchUrl, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.warn('⚠️ 响应不是JSON格式:', contentType);
      }

      const metadata = await response.json();
      
      // console.log('✅ 元数据获取成功:', metadata.name || 'Unknown NFT');
      return metadata;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`⏰ 请求超时 (尝试 ${attempt + 1}/${retries + 1}):`, tokenURI);
      } else {
        console.warn(`❌ 获取失败 (尝试 ${attempt + 1}/${retries + 1}):`, lastError.message);
      }

      // 如果不是最后一次尝试，等待一段时间后重试
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // 指数退避，最大5秒
        console.log(`⏳ ${delay}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 所有重试都失败了
  throw new Error(`获取元数据失败 (${retries + 1}次尝试): ${lastError?.message || '未知错误'}`);
}

/**
 * 批量获取NFT元数据
 * @param tokenURIs - tokenURI数组
 * @param options - 获取选项
 * @param concurrency - 并发数，默认3
 * @returns Promise<Array<{tokenURI: string, metadata: any | null, error?: string}>>
 */
export async function fetchNFTMetadataBatch(
  tokenURIs: string[],
  options: MetadataFetchOptions = {},
  concurrency: number = 3
): Promise<Array<{tokenURI: string, metadata: Record<string, unknown> | null, error?: string}>> {
  const results: Array<{tokenURI: string, metadata: Record<string, unknown> | null, error?: string}> = [];
  
  // 分批处理，控制并发数
  for (let i = 0; i < tokenURIs.length; i += concurrency) {
    const batch = tokenURIs.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (tokenURI) => {
      try {
        const metadata = await fetchNFTMetadata(tokenURI, options);
        return { tokenURI, metadata, error: undefined };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { tokenURI, metadata: null, error: errorMessage };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

/**
 * 验证元数据格式是否正确
 * @param metadata - 元数据对象
 * @returns boolean - 是否有效
 */
export function validateNFTMetadata(metadata: Record<string, unknown>): boolean {
  if (!metadata || typeof metadata !== 'object') {
    return false;
  }

  // 检查必需字段
  const requiredFields = ['name', 'description'];
  for (const field of requiredFields) {
    if (!metadata[field] || typeof metadata[field] !== 'string') {
      return false;
    }
  }

  // 检查attributes字段
  if (metadata.attributes && !Array.isArray(metadata.attributes)) {
    return false;
  }

  return true;
}

/**
 * 从tokenURI提取文件名或ID
 * @param tokenURI - tokenURI
 * @returns string - 提取的标识符
 */
export function extractTokenIdentifier(tokenURI: string): string {
  try {
    const url = new URL(tokenURI);
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || '';
    return filename.replace(/\.[^/.]+$/, ''); // 移除文件扩展名
  } catch {
    // 如果不是有效URL，直接返回原字符串
    return tokenURI;
  }
}
