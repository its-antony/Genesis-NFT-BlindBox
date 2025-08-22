'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNFTMetadata, type ChineseNFTMetadata } from '@/hooks/useNFTMetadata';
import { NFTCard } from './NFTCard';

export default function NFTGallery() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | '普通' | '稀有' | '史诗' | '传说'>('all');

  const {
    userTokenIds,
    loadedMetadata,
    userBalance,
    totalSupply,
    loading,
    error,
    handleMetadataLoaded,
    getStats,
  } = useNFTMetadata();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold text-white mb-4">连接钱包查看收藏</h2>
            <p className="text-gray-400 mb-8">
              连接你的钱包以查看你拥有的Genesis Mecha NFT收藏
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 过滤已加载的NFT
  const filteredTokenIds = userTokenIds.filter(tokenId => {
    if (filter === 'all') return true;
    
    const metadata = loadedMetadata[tokenId];
    if (!metadata) return false;
    
    const rarityAttr = metadata.attributes.find(attr => attr.trait_type === '稀有度');
    return rarityAttr?.value === filter;
  });

  const { rarityStats } = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-20">
      <div className="container mx-auto px-4">
        {/* 标题和统计 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              我的机甲收藏
            </span>
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{Number(userBalance)}</div>
              <div className="text-sm text-gray-400">拥有数量</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">{Number(totalSupply)}</div>
              <div className="text-sm text-gray-400">总发行量</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">
                {Number(userBalance) > 0 ? ((Number(userBalance) / Number(totalSupply)) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-sm text-gray-400">收藏率</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-orange-400">{rarityStats.传说 + rarityStats.史诗}</div>
              <div className="text-sm text-gray-400">稀有机甲</div>
            </div>
          </div>
        </div>

        {/* 筛选器 */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gray-800/50 rounded-lg p-2">
            {(['all', '普通', '稀有', '史诗', '传说'] as const).map((rarity) => (
              <button
                key={rarity}
                onClick={() => setFilter(rarity)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === rarity
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {rarity === 'all' ? '全部' : rarity}
                {rarity !== 'all' && rarityStats[rarity] > 0 && (
                  <span className="ml-1 text-xs opacity-75">({rarityStats[rarity]})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* NFT网格 */}
        {userTokenIds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-white mb-2">暂无NFT</h3>
            <p className="text-gray-400">
              你还没有拥有任何Genesis Mecha NFT
            </p>
          </div>
        ) : filteredTokenIds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">没有找到NFT</h3>
            <p className="text-gray-400">
              没有找到符合筛选条件的NFT
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTokenIds.map((tokenId) => (
              <NFTCard
                key={tokenId}
                tokenId={tokenId}
                onMetadataLoaded={handleMetadataLoaded}
              />
            ))}
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              正在加载NFT数据...
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-400">
              ❌ {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
