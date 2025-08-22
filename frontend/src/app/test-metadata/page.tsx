'use client';

import { useState, useEffect } from 'react';
import { getMetadataUrl, getMetadataSource, getMetadataStats } from '@/config/metadata';

interface TestMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export default function TestMetadataPage() {
  const [mounted, setMounted] = useState(false);
  const [testResults, setTestResults] = useState<{
    [tokenId: string]: {
      success: boolean;
      metadata?: TestMetadata;
      error?: string;
      source: 'ipfs' | 'local';
      url: string;
    };
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const testMetadata = async (tokenId: string) => {
    const url = getMetadataUrl(tokenId);
    const source = getMetadataSource(tokenId);
    
    try {
      console.log(`🔍 测试 TokenId ${tokenId}:`, { url, source });
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const metadata = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [tokenId]: {
          success: true,
          metadata,
          source,
          url
        }
      }));
      
      console.log(`✅ TokenId ${tokenId} 成功:`, metadata);
      
    } catch (error) {
      console.error(`❌ TokenId ${tokenId} 失败:`, error);
      
      setTestResults(prev => ({
        ...prev,
        [tokenId]: {
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
          source,
          url
        }
      }));
    }
  };

  const testAllMetadata = async () => {
    setLoading(true);
    setTestResults({});
    
    // 测试前5个tokenId
    const tokenIds = ['1', '2', '3', '4', '5'];
    
    for (const tokenId of tokenIds) {
      await testMetadata(tokenId);
      // 添加小延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setLoading(false);
  };

  const stats = getMetadataStats();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                元数据测试页面
              </span>
            </h1>
            <p className="text-gray-400">测试IPFS和本地元数据的加载情况</p>
          </div>

          {/* 统计信息 */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">📊 元数据配置统计</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.ipfs}</div>
                <div className="text-sm text-gray-400">IPFS存储</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.local}</div>
                <div className="text-sm text-gray-400">本地存储</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.total}</div>
                <div className="text-sm text-gray-400">总计</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.ipfsPercentage}%</div>
                <div className="text-sm text-gray-400">IPFS比例</div>
              </div>
            </div>
          </div>

          {/* 测试按钮 */}
          <div className="text-center mb-8">
            <button
              onClick={testAllMetadata}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
            >
              {loading ? '测试中...' : '🧪 测试元数据加载'}
            </button>
          </div>

          {/* 测试结果 */}
          <div className="space-y-4">
            {Object.entries(testResults).map(([tokenId, result]) => (
              <div
                key={tokenId}
                className={`bg-gray-800/50 rounded-xl p-6 border ${
                  result.success ? 'border-green-700' : 'border-red-700'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    创世机甲 #{tokenId.padStart(3, '0')}
                  </h3>
                  <div className="flex items-center gap-2">
                    {result.source === 'ipfs' ? (
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        🌐 IPFS
                      </span>
                    ) : (
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                        📁 Local
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {result.success ? '✅ 成功' : '❌ 失败'}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-3">
                  <strong>URL:</strong> {result.url}
                </div>

                {result.success && result.metadata ? (
                  <div className="space-y-3">
                    <div>
                      <strong className="text-white">名称:</strong>
                      <span className="text-gray-300 ml-2">{result.metadata.name}</span>
                    </div>
                    <div>
                      <strong className="text-white">描述:</strong>
                      <p className="text-gray-300 mt-1">{result.metadata.description}</p>
                    </div>
                    <div>
                      <strong className="text-white">属性数量:</strong>
                      <span className="text-gray-300 ml-2">{result.metadata.attributes.length}</span>
                    </div>
                    <div>
                      <strong className="text-white">主要属性:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.metadata.attributes.slice(0, 5).map((attr, index) => (
                          <span
                            key={index}
                            className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            {attr.trait_type}: {attr.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : result.error ? (
                  <div className="text-red-400">
                    <strong>错误:</strong> {result.error}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* 返回按钮 */}
          <div className="text-center mt-12">
            <button
              onClick={() => window.location.href = '/gallery'}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              ← 返回收藏页面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
