'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRealNFTData } from '@/hooks/useRealNFTData';

interface LeaderboardEntry {
  address: string;
  nftCount: number;
  totalValue: string;
  rank: number;
  legendaryCount: number;
  epicCount: number;
  rareCount: number;
  commonCount: number;
  nfts: string[]; // 持有的NFT tokenId列表
}



export function Leaderboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'holders' | 'stats'>('holders');

  // 使用真实数据hook
  const {
    allHolders,
    totalSupply,
    loading: realDataLoading,
    error: realDataError,
    refreshHolders,
  } = useRealNFTData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 使用useMemo优化数据处理
  const leaderboardData = useMemo((): LeaderboardEntry[] => {
    if (!allHolders.length) return [];

    // 转换并排序持有者数据
    const processedHolders = allHolders
      .map((holder) => {
        const nftCount = holder.balance || holder.tokens?.length || 0;
        const nfts = holder.tokens || [];

        // 根据实际NFT元数据计算稀有度分布
        let legendaryCount = 0;
        let epicCount = 0;
        let rareCount = 0;
        let commonCount = 0;

        // 注意：这里的nfts是tokenId数组，不是NFT对象
        // 在实际应用中，需要根据tokenId获取元数据来判断稀有度
        // 这里简化处理，根据tokenId模拟稀有度分布
        nfts.forEach((tokenId: string) => {
          // 简化的稀有度判断逻辑（基于tokenId）
          const id = parseInt(tokenId);
          let rarity: string;

          if (id === 1) {
            rarity = 'Legendary';
          } else if (id >= 2 && id <= 4) {
            rarity = 'Epic';
          } else if (id >= 5 && id <= 9) {
            rarity = 'Rare';
          } else {
            rarity = 'Common';
          }

          switch (rarity) {
            case 'Legendary':
              legendaryCount++;
              break;
            case 'Epic':
              epicCount++;
              break;
            case 'Rare':
              rareCount++;
              break;
            case 'Common':
            default:
              commonCount++;
              break;
          }
        });

        // 估算总价值（基于稀有度）
        const totalValue = (
          legendaryCount * 2.0 +
          epicCount * 0.8 +
          rareCount * 0.3 +
          commonCount * 0.1
        ).toFixed(2);

        return {
          address: holder.address,
          nftCount,
          totalValue,
          rank: 0, // 将在排序后设置
          legendaryCount,
          epicCount,
          rareCount,
          commonCount,
          nfts,
        };
      })
      .sort((a, b) => {
        // 首先按NFT数量排序，然后按总价值排序
        if (b.nftCount !== a.nftCount) {
          return b.nftCount - a.nftCount;
        }
        return parseFloat(b.totalValue) - parseFloat(a.totalValue);
      })
      .map((holder, index) => ({
        ...holder,
        rank: index + 1,
      }));

    return processedHolders;
  }, [allHolders]);



  // 计算统计数据
  const stats = useMemo(() => {
    const totalHolders = leaderboardData.length;
    const totalNFTs = Number(totalSupply) || 0;
    const averageHolding = totalHolders > 0 ? (totalNFTs / totalHolders).toFixed(1) : '0';
    const maxHolding = leaderboardData.length > 0 ? leaderboardData[0].nftCount : 0;

    // 计算稀有度分布
    const rarityDistribution = leaderboardData.reduce(
      (acc, holder) => {
        acc.legendary += holder.legendaryCount;
        acc.epic += holder.epicCount;
        acc.rare += holder.rareCount;
        acc.common += holder.commonCount;
        return acc;
      },
      { legendary: 0, epic: 0, rare: 0, common: 0 }
    );

    const totalRarityNFTs = Object.values(rarityDistribution).reduce((sum, count) => sum + count, 0);

    return {
      totalHolders,
      totalNFTs,
      averageHolding,
      maxHolding,
      rarityDistribution,
      totalRarityNFTs,
    };
  }, [leaderboardData, totalSupply]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };



  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '⚙️';
      case 'rare': return '🔷';
      case 'epic': return '💎';
      case 'legendary': return '👑';
      default: return '⚙️';
    }
  };



  if (!mounted) {
    return (
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-8"></div>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-700 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* 数据状态显示 */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📊 <span>实时数据</span>
              </h3>
              <button
                onClick={refreshHolders}
                disabled={realDataLoading}
                className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {realDataLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    刷新中
                  </>
                ) : (
                  <>🔄 刷新数据</>
                )}
              </button>
            </div>

            <div className="text-sm text-gray-400">
              {realDataLoading && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  正在从区块链获取数据...
                </div>
              )}
              {realDataError && (
                <div className="text-red-400">
                  ❌ {realDataError}
                  <button
                    onClick={refreshHolders}
                    className="ml-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    重试
                  </button>
                </div>
              )}
              {!realDataLoading && !realDataError && (
                <div className="text-green-400">
                  ✅ 实时区块链数据 ({allHolders.length} 持有者, {totalSupply ? totalSupply.toString() : '0'} NFT总量)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              排行榜
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Genesis Mecha社区数据和活动
          </p>
        </div>

        {/* 标签页 */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gray-800/50 rounded-lg p-2">
            {[
              { id: 'holders', name: '持有者排行', icon: '🏆' },
              { id: 'stats', name: '统计数据', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'holders' | 'stats')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'holders' && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                  <h3 className="text-xl font-bold text-white">持有者排行榜</h3>
                  <p className="text-gray-400 text-sm">按拥有NFT数量排序</p>
                </div>
                
                <div className="divide-y divide-gray-700/50">
                  {leaderboardData.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-4">📊</div>
                      <h3 className="text-lg font-bold text-white mb-2">暂无持有者数据</h3>
                      <p className="text-gray-400 text-sm">
                        {realDataLoading ? '正在加载数据...' : '还没有NFT持有者'}
                      </p>
                    </div>
                  ) : (
                    leaderboardData.slice(0, 10).map((holder) => (
                    <div key={holder.address} className="p-6 hover:bg-gray-700/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                            ${holder.rank <= 3 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                              : 'bg-gray-600'
                            }
                          `}>
                            {holder.rank <= 3 ? ['🥇', '🥈', '🥉'][holder.rank - 1] : holder.rank}
                          </div>
                          
                          <div>
                            <div className="text-white font-medium">{formatAddress(holder.address)}</div>
                            <div className="text-sm text-gray-400">
                              拥有 {holder.nftCount} 个NFT
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-bold">{holder.totalValue} ETH</div>
                          <div className="text-sm text-gray-400 flex space-x-2">
                            {holder.legendaryCount > 0 && (
                              <span className="text-yellow-400">👑{holder.legendaryCount}</span>
                            )}
                            {holder.epicCount > 0 && (
                              <span className="text-purple-400">💎{holder.epicCount}</span>
                            )}
                            {holder.rareCount > 0 && (
                              <span className="text-blue-400">🔷{holder.rareCount}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}



          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 总体统计 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-xl font-bold text-white mb-6">总体统计</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">总发行量</span>
                    <span className="text-white font-bold">{stats.totalNFTs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">持有者数量</span>
                    <span className="text-white font-bold">{stats.totalHolders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">平均持有量</span>
                    <span className="text-white font-bold">{stats.averageHolding}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">最大持有量</span>
                    <span className="text-white font-bold">{stats.maxHolding}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">总价值估算</span>
                    <span className="text-white font-bold">
                      {leaderboardData.reduce((sum, holder) => sum + parseFloat(holder.totalValue), 0).toFixed(2)} ETH
                    </span>
                  </div>
                </div>
              </div>

              {/* 稀有度分布 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-xl font-bold text-white mb-6">稀有度分布</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center space-x-2">
                      <span>👑</span>
                      <span>传说级</span>
                    </span>
                    <div className="text-right">
                      <span className="text-yellow-400 font-bold">{stats.rarityDistribution.legendary}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({stats.totalRarityNFTs > 0 ? ((stats.rarityDistribution.legendary / stats.totalRarityNFTs) * 100).toFixed(1) : '0'}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center space-x-2">
                      <span>💎</span>
                      <span>史诗级</span>
                    </span>
                    <div className="text-right">
                      <span className="text-purple-400 font-bold">{stats.rarityDistribution.epic}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({stats.totalRarityNFTs > 0 ? ((stats.rarityDistribution.epic / stats.totalRarityNFTs) * 100).toFixed(1) : '0'}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center space-x-2">
                      <span>🔷</span>
                      <span>稀有级</span>
                    </span>
                    <div className="text-right">
                      <span className="text-blue-400 font-bold">{stats.rarityDistribution.rare}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({stats.totalRarityNFTs > 0 ? ((stats.rarityDistribution.rare / stats.totalRarityNFTs) * 100).toFixed(1) : '0'}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center space-x-2">
                      <span>⚙️</span>
                      <span>普通级</span>
                    </span>
                    <div className="text-right">
                      <span className="text-gray-400 font-bold">{stats.rarityDistribution.common}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({stats.totalRarityNFTs > 0 ? ((stats.rarityDistribution.common / stats.totalRarityNFTs) * 100).toFixed(1) : '0'}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
