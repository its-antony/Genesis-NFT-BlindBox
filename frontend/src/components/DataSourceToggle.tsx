'use client';

import { useState, useEffect } from 'react';

type DataSource = 'mock' | 'blockchain' | 'alchemy' | 'graph';

interface DataSourceToggleProps {
  onSourceChange: (source: DataSource) => void;
  currentSource: DataSource;
}

export function DataSourceToggle({ onSourceChange, currentSource }: DataSourceToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sources: Array<{ id: DataSource; name: string; description: string; available: boolean }> = [
    {
      id: 'mock',
      name: '模拟数据',
      description: '用于演示的假数据',
      available: true,
    },
    {
      id: 'blockchain',
      name: '区块链直查',
      description: '直接从区块链读取',
      available: true,
    },
    {
      id: 'alchemy',
      name: 'Alchemy API',
      description: '使用Alchemy服务',
      available: !!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    },
    {
      id: 'graph',
      name: 'The Graph',
      description: '使用Graph协议',
      available: !!process.env.NEXT_PUBLIC_GRAPH_ENDPOINT,
    },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 mb-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🔧 <span>数据源选择</span>
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => source.available && onSourceChange(source.id)}
            disabled={!source.available}
            className={`
              p-3 rounded-lg text-sm font-medium transition-all duration-200 text-left
              ${currentSource === source.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : source.available
                ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <div className="font-bold">{source.name}</div>
            <div className="text-xs opacity-80">{source.description}</div>
            {!source.available && (
              <div className="text-xs text-red-400 mt-1">未配置</div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>💡 提示：</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li><strong>模拟数据</strong>：用于演示，数据是随机生成的</li>
          <li><strong>区块链直查</strong>：真实数据，但查询较慢</li>
          <li><strong>Alchemy API</strong>：真实数据，查询快速，需要API密钥</li>
          <li><strong>The Graph</strong>：真实数据，最快查询，需要部署subgraph</li>
        </ul>
      </div>
    </div>
  );
}
