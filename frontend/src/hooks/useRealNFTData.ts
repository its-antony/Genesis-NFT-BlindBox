'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { formatEther, getAddress } from 'viem';
import { fetchNFTMetadata } from '@/utils/metadata';

// 完整的ERC721 ABI
const ERC721_FULL_ABI = [
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "index", "type": "uint256"}],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Transfer事件
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": true, "name": "tokenId", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  }
] as const;

interface RealNFTData {
  tokenId: string;
  owner: string;
  tokenURI: string;
  metadata?: any;
}

interface HolderData {
  address: string;
  balance: number;
  tokens: string[];
}

interface TransferEvent {
  from: string;
  to: string;
  tokenId: string;
  blockNumber: bigint;
  transactionHash: string;
  timestamp?: number;
}

export function useRealNFTData() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [userNFTs, setUserNFTs] = useState<RealNFTData[]>([]);
  const [allHolders, setAllHolders] = useState<HolderData[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<TransferEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const GENESIS_MECHA_ADDRESS = process.env.NEXT_PUBLIC_GENESIS_MECHA_ADDRESS as `0x${string}`;

  // 获取用户拥有的NFT数量
  const { data: userBalance } = useReadContract({
    address: GENESIS_MECHA_ADDRESS,
    abi: ERC721_FULL_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!GENESIS_MECHA_ADDRESS,
    },
  });

  // 获取总供应量
  const { data: totalSupply } = useReadContract({
    address: GENESIS_MECHA_ADDRESS,
    abi: ERC721_FULL_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!GENESIS_MECHA_ADDRESS,
    },
  });

  // 获取用户的NFT详情
  const fetchUserNFTs = async () => {
    if (!address || !userBalance || !publicClient || userBalance === 0n) {
      setUserNFTs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nfts: RealNFTData[] = [];
      const balanceNum = Number(userBalance);

      // 获取用户拥有的每个NFT的tokenId
      for (let i = 0; i < balanceNum; i++) {
        try {
          const tokenId = await publicClient.readContract({
            address: GENESIS_MECHA_ADDRESS,
            abi: ERC721_FULL_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, BigInt(i)],
          });

          // 获取tokenURI
          const tokenURI = await publicClient.readContract({
            address: GENESIS_MECHA_ADDRESS,
            abi: ERC721_FULL_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          });

          nfts.push({
            tokenId: tokenId.toString(),
            owner: address,
            tokenURI: tokenURI as string,
          });

          // 尝试获取元数据
          if (tokenURI && typeof tokenURI === 'string') {
            try {
              const metadata = await fetchNFTMetadata(tokenURI, {
                timeout: 10000,
                retries: 1,
                cache: true
              });
              nfts[nfts.length - 1].metadata = metadata;
            } catch (metadataError) {
              console.warn(`Failed to fetch metadata for token ${tokenId}:`, metadataError);
            }
          }
        } catch (tokenError) {
          console.error(`Error fetching token ${i}:`, tokenError);
        }
      }

      setUserNFTs(nfts);
    } catch (err) {
      console.error('Error fetching user NFTs:', err);
      setError('获取NFT数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取所有持有者数据
  const fetchAllHolders = async () => {
    if (!totalSupply || !publicClient) return;

    setLoading(true);
    try {
      const holders = new Map<string, HolderData>();
      const totalNum = Number(totalSupply);

      // 限制查询数量以避免过多请求，但对于总量20的项目，可以检查所有
      const maxTokensToCheck = Math.min(totalNum, 25); // 稍微提高限制以适应20个NFT的项目
      console.log(`正在检查前 ${maxTokensToCheck} 个NFT的持有者...`);

      // 遍历tokenId获取持有者
      for (let tokenId = 1; tokenId <= maxTokensToCheck; tokenId++) {
        try {
          const owner = await publicClient.readContract({
            address: GENESIS_MECHA_ADDRESS,
            abi: ERC721_FULL_ABI,
            functionName: 'ownerOf',
            args: [BigInt(tokenId)],
          });

          const ownerAddress = getAddress(owner as string);

          if (holders.has(ownerAddress)) {
            const holderData = holders.get(ownerAddress)!;
            holderData.balance += 1;
            holderData.tokens.push(tokenId.toString());
          } else {
            holders.set(ownerAddress, {
              address: ownerAddress,
              balance: 1,
              tokens: [tokenId.toString()],
            });
          }
        } catch (tokenError) {
          console.warn(`Error fetching owner for token ${tokenId}:`, tokenError);
          // 如果是因为token不存在，跳过
          if (tokenError instanceof Error && tokenError.message.includes('nonexistent')) {
            continue;
          }
        }
      }

      // 转换为数组并排序
      const holdersArray = Array.from(holders.values())
        .sort((a, b) => b.balance - a.balance);

      console.log(`找到 ${holdersArray.length} 个持有者`);
      setAllHolders(holdersArray);
    } catch (err) {
      console.error('Error fetching holders:', err);
      setError('获取持有者数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取最近的转账事件
  const fetchRecentTransfers = async () => {
    if (!publicClient) return;

    try {
      // 获取最近1000个区块的Transfer事件
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - 1000n;

      const logs = await publicClient.getLogs({
        address: GENESIS_MECHA_ADDRESS,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { name: 'from', type: 'address', indexed: true },
            { name: 'to', type: 'address', indexed: true },
            { name: 'tokenId', type: 'uint256', indexed: true },
          ],
        },
        fromBlock,
        toBlock: currentBlock,
      });

      const transfers: TransferEvent[] = logs.map(log => ({
        from: log.args.from as string,
        to: log.args.to as string,
        tokenId: log.args.tokenId?.toString() || '',
        blockNumber: log.blockNumber || 0n,
        transactionHash: log.transactionHash || '',
      }));

      // 按区块号排序（最新的在前）
      transfers.sort((a, b) => Number(b.blockNumber - a.blockNumber));

      setRecentTransfers(transfers.slice(0, 50)); // 只保留最近50个
    } catch (err) {
      console.error('Error fetching transfers:', err);
    }
  };

  // 当用户地址或余额变化时获取NFT数据
  useEffect(() => {
    if (address && userBalance) {
      fetchUserNFTs();
    }
  }, [address, userBalance]);

  // 获取持有者数据
  useEffect(() => {
    if (totalSupply) {
      fetchAllHolders();
      fetchRecentTransfers();
    }
  }, [totalSupply]);

  return {
    // 用户数据
    userNFTs,
    userBalance: userBalance ? Number(userBalance) : 0,
    
    // 全局数据
    totalSupply: totalSupply ? Number(totalSupply) : 0,
    allHolders,
    recentTransfers,
    
    // 状态
    loading,
    error,
    
    // 刷新函数
    refreshUserNFTs: fetchUserNFTs,
    refreshHolders: fetchAllHolders,
    refreshTransfers: fetchRecentTransfers,
  };
}
