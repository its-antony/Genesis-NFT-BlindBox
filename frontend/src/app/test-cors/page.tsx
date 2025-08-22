'use client';

import { useState } from 'react';
import { fetchNFTMetadata } from '@/utils/metadata';

export default function TestCorsPage() {
  const [testUrl, setTestUrl] = useState('http://47.108.146.210:8889/tmp/1.json');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 测试获取元数据:', testUrl);
      const metadata = await fetchNFTMetadata(testUrl, {
        timeout: 15000,
        retries: 2,
        cache: false // 测试时不使用缓存
      });
      
      setResult(metadata);
      console.log('✅ 测试成功:', metadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('❌ 测试失败:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 直接测试获取元数据 (会遇到CORS错误):', testUrl);
      const response = await fetch(testUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const metadata = await response.json();
      setResult(metadata);
      console.log('✅ 直接测试成功:', metadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('❌ 直接测试失败 (预期的CORS错误):', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🧪 CORS跨域解决方案测试
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">测试配置</h2>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">测试URL:</label>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="输入要测试的元数据URL"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={testFetch}
              disabled={loading || !testUrl}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '测试中...' : '🔄 使用API代理测试'}
            </button>

            <button
              onClick={testDirectFetch}
              disabled={loading || !testUrl}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '测试中...' : '🚫 直接测试 (会失败)'}
            </button>
          </div>
        </div>

        {/* 结果显示 */}
        {loading && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
              <span className="text-yellow-200">正在测试...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 mb-4">
            <h3 className="text-red-200 font-bold mb-2">❌ 错误信息:</h3>
            <pre className="text-red-300 text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 mb-4">
            <h3 className="text-green-200 font-bold mb-2">✅ 成功获取元数据:</h3>
            <pre className="text-green-300 text-sm whitespace-pre-wrap bg-gray-800 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* 说明文档 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">📖 解决方案说明</h2>
          
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-bold text-blue-400 mb-2">🔧 问题描述</h3>
              <p>前端直接访问 <code className="bg-gray-700 px-2 py-1 rounded">http://47.108.146.210:8889/tmp/</code> 时遇到CORS跨域错误。</p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-green-400 mb-2">✅ 解决方案</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>创建了 <code className="bg-gray-700 px-2 py-1 rounded">/api/metadata</code> API路由作为代理</li>
                <li>前端通过代理API获取外部元数据，绕过浏览器CORS限制</li>
                <li>支持超时控制、重试机制和错误处理</li>
                <li>自动检测URL类型，外部URL使用代理，本地URL直接访问</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-purple-400 mb-2">🚀 使用方式</h3>
              <pre className="bg-gray-700 p-3 rounded text-sm">
{`import { fetchNFTMetadata } from '@/utils/metadata';

// 自动处理跨域问题
const metadata = await fetchNFTMetadata(tokenURI, {
  timeout: 15000,  // 15秒超时
  retries: 2,      // 重试2次
  cache: true      // 启用缓存
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
