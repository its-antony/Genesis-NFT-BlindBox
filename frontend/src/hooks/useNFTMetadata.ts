'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { GENESIS_MECHA_ABI } from '@/config/abis';

// 中文元数据接口
export interface ChineseNFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
    max_value?: number;
  }>;
  properties: {
    版本: string;
    创建日期: string;
    总战力: number;
    等级: string;
    出生地: string;
    驾驶员等级: string;
    世代: string;
  };
}

export interface NFTItem {
  tokenId: string;
  metadata: ChineseNFTMetadata | null;
  loading: boolean;
  error?: string;
}

export function useNFTMetadata() {
  const { address, isConnected } = useAccount();
  const [userTokenIds, setUserTokenIds] = useState<string[]>([]);
  const [loadedMetadata, setLoadedMetadata] = useState<{[tokenId: string]: ChineseNFTMetadata}>({});

  // 获取用户NFT余额
  const { data: userBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.GENESIS_MECHA as `0x${string}`,
    abi: GENESIS_MECHA_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // 获取总供应量
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.GENESIS_MECHA as `0x${string}`,
    abi: GENESIS_MECHA_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!CONTRACT_ADDRESSES.GENESIS_MECHA,
    },
  });

  // 当用户余额变化时，生成tokenId列表
  useEffect(() => {
    if (!address || !isConnected || !userBalance || userBalance === BigInt(0)) {
      setUserTokenIds([]);
      setLoadedMetadata({});
      return;
    }

    console.log('🔍 用户NFT余额:', userBalance.toString());

    // 简化实现：假设用户拥有的NFT的tokenId是连续的，从1开始
    const balance = Number(userBalance);
    const tokenIds: string[] = [];

    for (let i = 0; i < balance; i++) {
      tokenIds.push((i + 1).toString());
    }

    console.log('🎯 用户TokenId列表:', tokenIds);
    setUserTokenIds(tokenIds);

  }, [address, isConnected, userBalance]);

  // 处理单个NFT元数据加载完成
  const handleMetadataLoaded = (tokenId: string, metadata: ChineseNFTMetadata) => {
    setLoadedMetadata(prev => ({
      ...prev,
      [tokenId]: metadata
    }));
  };

  // 获取统计信息
  const getStats = () => {
    const metadataList = Object.values(loadedMetadata);
    const rarityStats = {
      '传说': 0,
      '史诗': 0,
      '稀有': 0,
      '普通': 0
    };

    metadataList.forEach(metadata => {
      const rarity = metadata.attributes.find(attr => attr.trait_type === '稀有度')?.value as string;
      if (rarity && rarityStats.hasOwnProperty(rarity)) {
        rarityStats[rarity as keyof typeof rarityStats]++;
      }
    });

    return { rarityStats };
  };

  return {
    userTokenIds,
    loadedMetadata,
    userBalance: userBalance || BigInt(0),
    totalSupply: totalSupply || BigInt(0),
    loading: false, // 现在由NFTCard组件处理加载状态
    error: null,
    handleMetadataLoaded,
    getStats,
  };
}
