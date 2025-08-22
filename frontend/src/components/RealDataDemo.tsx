'use client';

import { useState, useEffect } from 'react';
import { useRealNFTData } from '@/hooks/useRealNFTData';
import { LoadingSpinner, ErrorDisplay } from './LoadingSpinner';

export function RealDataDemo() {
  const [mounted, setMounted] = useState(false);
  const {
    userNFTs,
    userBalance,
    totalSupply,
    allHolders,
    recentTransfers,
    loading,
    error,
    refreshUserNFTs,
    refreshHolders,
    refreshTransfers,
  } = useRealNFTData();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner message="初始化中..." />;
  }

  return (
    <div className="space-y-8">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          🔗 真实区块链数据演示
        </h2>
        <p className="text-gray-400">
          直接从区块链获取的真实NFT数据
        </p>
      </div>

      {/* 错误显示 */}
      {error && (
        <ErrorDisplay 
          error={error} 
          onRetry={() => {
            refreshUserNFTs();
            refreshHolders();
            refreshTransfers();
          }} 
        />
      )}

      {/* 加载状态 */}
      {loading && <LoadingSpinner message="正在从区块链获取数据..." />}

      {/* 数据展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 用户NFT数据 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            👤 <span>用户数据</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">拥有NFT数量:</span>
              <span className="text-white font-bold">{userBalance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">NFT详情:</span>
              <span className="text-white font-bold">{userNFTs.length} 个</span>
            </div>
            <button
              onClick={refreshUserNFTs}
              disabled={loading}
              className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              刷新用户数据
            </button>
          </div>
        </div>

        {/* 全局统计 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📊 <span>全局统计</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">总供应量:</span>
              <span className="text-white font-bold">{totalSupply}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">持有者数量:</span>
              <span className="text-white font-bold">{allHolders.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">转账记录:</span>
              <span className="text-white font-bold">{recentTransfers.length}</span>
            </div>
            <button
              onClick={refreshHolders}
              disabled={loading}
              className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              刷新持有者数据
            </button>
          </div>
        </div>

        {/* 数据质量 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            ✅ <span>数据质量</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${totalSupply > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-gray-400">合约连接</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${allHolders.length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-gray-400">持有者数据</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${recentTransfers.length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-gray-400">转账数据</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${userNFTs.length > 0 ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-gray-400">用户NFT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 详细数据展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 持有者列表 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4">🏆 持有者排行</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allHolders.slice(0, 10).map((holder, index) => (
              <div key={holder.address} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">#{index + 1}</span>
                  <span className="text-gray-300 font-mono text-sm">
                    {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                  </span>
                </div>
                <span className="text-white font-bold">{holder.balance} NFT</span>
              </div>
            ))}
            {allHolders.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                暂无持有者数据
              </div>
            )}
          </div>
        </div>

        {/* 最近转账 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4">📝 最近转账</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentTransfers.slice(0, 10).map((transfer, index) => (
              <div key={`${transfer.transactionHash}-${index}`} className="p-2 bg-gray-700/30 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-blue-400 text-sm">Token #{transfer.tokenId}</span>
                  <span className="text-gray-400 text-xs">
                    Block #{transfer.blockNumber.toString()}
                  </span>
                </div>
                <div className="text-xs text-gray-300">
                  {transfer.from === '0x0000000000000000000000000000000000000000' ? (
                    <span className="text-green-400">🎉 铸造给 {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}</span>
                  ) : (
                    <span>
                      📤 {transfer.from.slice(0, 6)}...{transfer.from.slice(-4)} → {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {recentTransfers.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                暂无转账记录
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3">💡 关于真实数据</h3>
        <div className="text-sm text-blue-200 space-y-2">
          <p>• <strong>真实性</strong>: 所有数据都直接从区块链获取，确保100%真实可靠</p>
          <p>• <strong>实时性</strong>: 数据会根据最新的区块链状态更新</p>
          <p>• <strong>限制</strong>: 为了避免过多RPC请求，我们限制了查询的NFT数量</p>
          <p>• <strong>性能</strong>: 区块链查询可能较慢，请耐心等待</p>
          <p>• <strong>错误处理</strong>: 如果遇到网络问题，可以点击重试按钮</p>
        </div>
      </div>
    </div>
  );
}
