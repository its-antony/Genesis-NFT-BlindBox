'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface AlchemyNFT {
  tokenId: string;
  tokenType: string;
  name?: string;
  description?: string;
  image?: string;
  tokenUri?: string;
  metadata?: any;
  timeLastUpdated: string;
}

interface AlchemyOwner {
  ownerAddress: string;
  tokenBalances: Array<{
    tokenId: string;
    balance: string;
  }>;
}

export function useAlchemyData() {
  const { address } = useAccount();
  const [userNFTs, setUserNFTs] = useState<AlchemyNFT[]>([]);
  const [owners, setOwners] = useState<AlchemyOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const GENESIS_MECHA_ADDRESS = process.env.NEXT_PUBLIC_GENESIS_MECHA_ADDRESS;
  const NETWORK = 'eth-sepolia'; // 或者 'eth-mainnet'

  const alchemyBaseUrl = `https://${NETWORK}.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;

  const fetchUserNFTs = async () => {
    if (!address || !ALCHEMY_API_KEY || !GENESIS_MECHA_ADDRESS) {
      setUserNFTs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 获取用户拥有的特定合约NFT
      const response = await fetch(
        `${alchemyBaseUrl}/getNFTsForOwner?owner=${address}&contractAddresses[]=${GENESIS_MECHA_ADDRESS}&withMetadata=true&pageSize=100`
      );

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const nfts: AlchemyNFT[] = data.ownedNfts.map((nft: any) => ({
        tokenId: nft.tokenId,
        tokenType: nft.tokenType,
        name: nft.name || nft.metadata?.name,
        description: nft.description || nft.metadata?.description,
        image: nft.image?.originalUrl || nft.metadata?.image,
        tokenUri: nft.tokenUri,
        metadata: nft.metadata,
        timeLastUpdated: nft.timeLastUpdated,
      }));

      setUserNFTs(nfts);
    } catch (err) {
      console.error('Error fetching NFTs from Alchemy:', err);
      setError('获取NFT数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    if (!ALCHEMY_API_KEY || !GENESIS_MECHA_ADDRESS) return;

    setLoading(true);
    try {
      // 获取合约的所有持有者
      const response = await fetch(
        `${alchemyBaseUrl}/getOwnersForContract?contractAddress=${GENESIS_MECHA_ADDRESS}&withTokenBalances=true`
      );

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const ownersData: AlchemyOwner[] = data.owners.map((owner: any) => ({
        ownerAddress: owner.ownerAddress,
        tokenBalances: owner.tokenBalances || [],
      }));

      // 按持有数量排序
      ownersData.sort((a, b) => b.tokenBalances.length - a.tokenBalances.length);

      setOwners(ownersData);
    } catch (err) {
      console.error('Error fetching owners from Alchemy:', err);
      setError('获取持有者数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTMetadata = async (tokenId: string) => {
    if (!ALCHEMY_API_KEY || !GENESIS_MECHA_ADDRESS) return null;

    try {
      const response = await fetch(
        `${alchemyBaseUrl}/getNFTMetadata?contractAddress=${GENESIS_MECHA_ADDRESS}&tokenId=${tokenId}&refreshCache=false`
      );

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching metadata for token ${tokenId}:`, err);
      return null;
    }
  };

  const fetchTransfers = async () => {
    if (!ALCHEMY_API_KEY || !GENESIS_MECHA_ADDRESS) return;

    try {
      // 获取最近的转账记录
      const response = await fetch(
        `${alchemyBaseUrl}/getTransfersForContract?contractAddress=${GENESIS_MECHA_ADDRESS}&fromBlock=latest&toBlock=latest&maxCount=50&order=desc`
      );

      if (!response.ok) {
        throw new Error(`Alchemy API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transfers || [];
    } catch (err) {
      console.error('Error fetching transfers from Alchemy:', err);
      return [];
    }
  };

  useEffect(() => {
    if (address) {
      fetchUserNFTs();
    }
  }, [address]);

  useEffect(() => {
    fetchOwners();
  }, []);

  return {
    userNFTs,
    owners,
    loading,
    error,
    refreshUserNFTs: fetchUserNFTs,
    refreshOwners: fetchOwners,
    fetchNFTMetadata,
    fetchTransfers,
  };
}
