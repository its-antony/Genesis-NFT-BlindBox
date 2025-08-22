import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { GEM_TOKEN_ABI, GENESIS_MECHA_ABI, BLIND_BOX_ABI } from '@/config/abis';

// GEM代币精度常量
const GEM_DECIMALS = 6;

// GemToken 合约 hooks
export function useGemTokenBalance(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
    abi: GEM_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.GEM_TOKEN,
    },
  });
}

export function useGemTokenAllowance(owner?: `0x${string}`, spender?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
    abi: GEM_TOKEN_ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender && !!CONTRACT_ADDRESSES.GEM_TOKEN,
    },
  });
}

export function useGemTokenInfo() {
  const name = useReadContract({
    address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
    abi: GEM_TOKEN_ABI,
    functionName: 'name',
    query: {
      enabled: !!CONTRACT_ADDRESSES.GEM_TOKEN,
    },
  });

  const symbol = useReadContract({
    address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
    abi: GEM_TOKEN_ABI,
    functionName: 'symbol',
    query: {
      enabled: !!CONTRACT_ADDRESSES.GEM_TOKEN,
    },
  });

  const decimals = useReadContract({
    address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
    abi: GEM_TOKEN_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!CONTRACT_ADDRESSES.GEM_TOKEN,
    },
  });

  const totalSupply = useReadContract({
    address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
    abi: GEM_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!CONTRACT_ADDRESSES.GEM_TOKEN,
    },
  });

  return {
    name,
    symbol,
    decimals,
    totalSupply,
  };
}

export function useApproveGemToken() {
  return useWriteContract();
}

// GenesisMecha 合约 hooks
export function useGenesisMechaBalance(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.GENESIS_MECHA as `0x${string}`,
    abi: GENESIS_MECHA_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.GENESIS_MECHA,
    },
  });
}

export function useGenesisMechaSupplyInfo() {
  const maxSupply = useReadContract({
    address: CONTRACT_ADDRESSES.GENESIS_MECHA as `0x${string}`,
    abi: GENESIS_MECHA_ABI,
    functionName: 'MAX_SUPPLY',
    query: {
      enabled: !!CONTRACT_ADDRESSES.GENESIS_MECHA,
    },
  });

  const totalSupply = useReadContract({
    address: CONTRACT_ADDRESSES.GENESIS_MECHA as `0x${string}`,
    abi: GENESIS_MECHA_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!CONTRACT_ADDRESSES.GENESIS_MECHA,
    },
  });

  // 计算剩余供应量和是否售罄
  const remainingSupply = maxSupply.data && totalSupply.data
    ? maxSupply.data - totalSupply.data
    : undefined;

  const isSoldOut = maxSupply.data && totalSupply.data
    ? totalSupply.data >= maxSupply.data
    : false;

  const refetchSupplyInfo = () => {
    maxSupply.refetch();
    totalSupply.refetch();
  };

  return {
    maxSupply,
    totalSupply,
    remainingSupply,
    isSoldOut,
    refetchSupplyInfo,
  };
}

// BlindBox 合约 hooks
export function useBlindBoxInfo() {
  const mintPrice = useReadContract({
    address: CONTRACT_ADDRESSES.BLIND_BOX as `0x${string}`,
    abi: BLIND_BOX_ABI,
    functionName: 'mintPrice',
    query: {
      enabled: !!CONTRACT_ADDRESSES.BLIND_BOX,
    },
  });

  // Note: BlindBox contract doesn't have a paused function in the current ABI
  // const paused = useReadContract({
  //   address: CONTRACT_ADDRESSES.BLIND_BOX as `0x${string}`,
  //   abi: BLIND_BOX_ABI,
  //   functionName: 'paused',
  //   query: {
  //     enabled: !!CONTRACT_ADDRESSES.BLIND_BOX,
  //   },
  // });

  return {
    mintPrice,
    // paused: undefined, // Not available in current ABI
  };
}

export function useUserInfo(address?: `0x${string}`) {
  // 获取用户的GEM余额和NFT余额
  const gemBalance = useGemTokenBalance(address);
  const nftBalance = useGenesisMechaBalance(address);
  const allowance = useGemTokenAllowance(address, CONTRACT_ADDRESSES.BLIND_BOX as `0x${string}`);

  const refetchUserInfo = () => {
    gemBalance.refetch();
    nftBalance.refetch();
    allowance.refetch();
  };

  return {
    gemBalance: gemBalance.data,
    nftBalance: nftBalance.data,
    allowance: allowance.data,
    refetchUserInfo,
  };
}

export function useMintPrice() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.BLIND_BOX as `0x${string}`,
    abi: BLIND_BOX_ABI,
    functionName: 'mintPrice',
    query: {
      enabled: !!CONTRACT_ADDRESSES.BLIND_BOX,
    },
  });
}

export function useMintNFT() {
  return useWriteContract();
}

export function useMintBatchNFT() {
  return useWriteContract();
}

// 交易状态 hook
export function useTransactionStatus(hash?: `0x${string}`) {
  return useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });
}

// 工具函数
export const formatGemAmount = (amount: bigint | undefined) => {
  if (!amount) return '0';
  return formatUnits(amount, GEM_DECIMALS);
};

export const parseGemAmount = (amount: string) => {
  return parseUnits(amount, GEM_DECIMALS);
};
