'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

// GraphQL查询
const GET_USER_NFTS = `
  query GetUserNFTs($owner: String!) {
    tokens(where: { owner: $owner }) {
      id
      tokenId
      owner {
        id
      }
      tokenURI
      transfers(orderBy: timestamp, orderDirection: desc, first: 1) {
        timestamp
        from {
          id
        }
        to {
          id
        }
      }
    }
  }
`;

const GET_HOLDERS_LEADERBOARD = `
  query GetHoldersLeaderboard {
    owners(orderBy: tokenCount, orderDirection: desc, first: 100) {
      id
      tokenCount
      tokens {
        tokenId
      }
    }
  }
`;

const GET_RECENT_TRANSFERS = `
  query GetRecentTransfers {
    transfers(orderBy: timestamp, orderDirection: desc, first: 50) {
      id
      tokenId
      from {
        id
      }
      to {
        id
      }
      timestamp
      transactionHash
      token {
        tokenId
        tokenURI
      }
    }
  }
`;

interface GraphNFT {
  id: string;
  tokenId: string;
  owner: {
    id: string;
  };
  tokenURI: string;
  transfers: Array<{
    timestamp: string;
    from: { id: string };
    to: { id: string };
  }>;
}

interface GraphOwner {
  id: string;
  tokenCount: string;
  tokens: Array<{
    tokenId: string;
  }>;
}

interface GraphTransfer {
  id: string;
  tokenId: string;
  from: { id: string };
  to: { id: string };
  timestamp: string;
  transactionHash: string;
  token: {
    tokenId: string;
    tokenURI: string;
  };
}

export function useGraphData() {
  const { address } = useAccount();
  const [userNFTs, setUserNFTs] = useState<GraphNFT[]>([]);
  const [holders, setHolders] = useState<GraphOwner[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<GraphTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The Graph endpoint (需要部署subgraph)
  const GRAPH_ENDPOINT = process.env.NEXT_PUBLIC_GRAPH_ENDPOINT || '';

  const executeQuery = async (query: string, variables: Record<string, unknown> = {}) => {
    if (!GRAPH_ENDPOINT) {
      throw new Error('Graph endpoint not configured');
    }

    const response = await fetch(GRAPH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Graph query failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`Graph query errors: ${result.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    return result.data;
  };

  const fetchUserNFTs = async () => {
    if (!address) {
      setUserNFTs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await executeQuery(GET_USER_NFTS, {
        owner: address.toLowerCase(),
      });

      setUserNFTs(data.tokens || []);
    } catch (err) {
      console.error('Error fetching user NFTs from Graph:', err);
      setError('获取NFT数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchHolders = async () => {
    setLoading(true);
    try {
      const data = await executeQuery(GET_HOLDERS_LEADERBOARD);
      setHolders(data.owners || []);
    } catch (err) {
      console.error('Error fetching holders from Graph:', err);
      setError('获取持有者数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransfers = async () => {
    try {
      const data = await executeQuery(GET_RECENT_TRANSFERS);
      setRecentTransfers(data.transfers || []);
    } catch (err) {
      console.error('Error fetching transfers from Graph:', err);
    }
  };

  useEffect(() => {
    if (address) {
      fetchUserNFTs();
    }
  }, [address]);

  useEffect(() => {
    fetchHolders();
    fetchRecentTransfers();
  }, []);

  return {
    userNFTs,
    holders,
    recentTransfers,
    loading,
    error,
    refreshUserNFTs: fetchUserNFTs,
    refreshHolders: fetchHolders,
    refreshTransfers: fetchRecentTransfers,
  };
}
