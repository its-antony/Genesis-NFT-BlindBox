'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { GENESIS_MECHA_ABI } from '@/config/abis';
import type { ChineseNFTMetadata } from '@/hooks/useNFTMetadata';
import { fetchNFTMetadata } from '@/utils/metadata';

interface NFTCardProps {
  tokenId: string;
  onMetadataLoaded?: (tokenId: string, metadata: ChineseNFTMetadata) => void;
}

export function NFTCard({ tokenId, onMetadataLoaded }: NFTCardProps) {
  const [metadata, setMetadata] = useState<ChineseNFTMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 使用ref来跟踪是否已经获取过元数据，避免重复请求
  const fetchedRef = useRef(false);
  const currentTokenURIRef = useRef<string | null>(null);

  // 从合约获取tokenURI
  const { data: tokenURI, isError: tokenURIError, isLoading: tokenURILoading } = useReadContract({
    address: CONTRACT_ADDRESSES.GENESIS_MECHA as `0x${string}`,
    abi: GENESIS_MECHA_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });

  // 使用useCallback来稳定onMetadataLoaded函数引用
  const stableOnMetadataLoaded = useCallback((tokenId: string, metadata: ChineseNFTMetadata) => {
    if (onMetadataLoaded) {
      onMetadataLoaded(tokenId, metadata);
    }
  }, [onMetadataLoaded]);

  // 当tokenURI获取成功后，获取元数据
  useEffect(() => {
    if (!tokenURI || tokenURILoading || tokenURIError) {
      return;
    }

    const currentTokenURI = tokenURI as string;

    // 检查是否已经获取过相同的tokenURI，避免重复请求
    if (fetchedRef.current && currentTokenURIRef.current === currentTokenURI) {
      return;
    }

    const fetchMetadata = async () => {
      try {
        // 标记开始获取
        fetchedRef.current = true;
        currentTokenURIRef.current = currentTokenURI;

        // console.log(`🔍 NFT ${tokenId} tokenURI:`, currentTokenURI);

        // 使用统一的元数据获取工具函数
        const metadataJson = await fetchNFTMetadata(currentTokenURI, {
          timeout: 15000, // 15秒超时
          retries: 2,     // 重试2次
          cache: true     // 启用缓存
        });

        // console.log(`✅ NFT ${tokenId} 元数据获取成功:`, metadataJson.name);

        setMetadata(metadataJson as unknown as ChineseNFTMetadata);
        setLoading(false);

        // 通知父组件元数据已加载
        stableOnMetadataLoaded(tokenId, metadataJson as unknown as ChineseNFTMetadata);

      } catch (err) {
        console.error(`❌ NFT ${tokenId} 元数据获取失败:`, err);
        setError(err instanceof Error ? err.message : '获取元数据失败');
        setLoading(false);
        // 重置标记，允许重试
        fetchedRef.current = false;
        currentTokenURIRef.current = null;
      }
    };

    fetchMetadata();
  }, [tokenURI, tokenURILoading, tokenURIError, tokenId, stableOnMetadataLoaded]);

  // 处理tokenURI获取错误
  useEffect(() => {
    if (tokenURIError) {
      console.error(`❌ NFT ${tokenId} tokenURI获取失败:`, tokenURIError);
      setError('无法从合约获取tokenURI');
      setLoading(false);
    }
  }, [tokenURIError, tokenId]);

  // 获取属性值的辅助函数
  const getAttributeValue = (traitType: string): string | number => {
    if (!metadata) return '';
    const attr = metadata.attributes.find(a => a.trait_type === traitType);
    return attr?.value || '';
  };

  // 获取稀有度颜色
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case '传说': return 'from-red-500 to-red-700';
      case '史诗': return 'from-orange-500 to-orange-700';
      case '稀有': return 'from-purple-500 to-purple-700';
      case '普通': return 'from-blue-500 to-blue-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const rarity = getAttributeValue('稀有度') as string;
  const rarityColor = getRarityColor(rarity);
  const attack = getAttributeValue('攻击力');
  const defense = getAttributeValue('防御力');
  const speed = getAttributeValue('速度');
  const energy = getAttributeValue('能量');

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 animate-pulse">
        <div className="h-1 bg-gray-600"></div>
        <div className="p-6">
          <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-red-700">
        <div className="h-1 bg-red-600"></div>
        <div className="p-6">
          <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-red-400 text-center">
              <div className="text-2xl mb-2">❌</div>
              <div className="text-sm">加载失败</div>
            </div>
          </div>
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
      {/* 稀有度边框 */}
      <div className={`h-1 bg-gradient-to-r ${rarityColor}`}></div>
      
      <div className="p-6">
        {/* NFT图片 */}
        <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
          {metadata.image ? (
            <img 
              src={metadata.image} 
              alt={metadata.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className="text-4xl text-gray-500 hidden">🤖</div>
          
          {/* TokenId标识 */}
          <div className="absolute top-2 left-2">
            <div className="bg-purple-600/90 text-white px-2 py-1 rounded text-xs font-medium">
              #{tokenId}
            </div>
          </div>
          
          {/* 稀有度标识 */}
          <div className="absolute top-2 right-2">
            <div className={`bg-gradient-to-r ${rarityColor} text-white px-2 py-1 rounded text-xs font-bold`}>
              {rarity}
            </div>
          </div>
        </div>

        {/* NFT信息 */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{metadata.name}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">{metadata.description}</p>
          </div>

          {/* 战斗属性 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-red-400">攻击:</span>
              <span className="text-white font-medium">{attack}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">防御:</span>
              <span className="text-white font-medium">{defense}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-400">速度:</span>
              <span className="text-white font-medium">{speed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-400">能量:</span>
              <span className="text-white font-medium">{energy}</span>
            </div>
          </div>

          {/* 总战力 */}
          <div className="pt-2 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-purple-400 font-medium">总战力:</span>
              <span className="text-purple-300 font-bold text-lg">
                {Number(attack) + Number(defense) + Number(speed) + Number(energy)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
