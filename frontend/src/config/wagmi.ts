import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';
import {
  metaMaskWallet,
  walletConnectWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';

// 从环境变量获取项目ID，如果没有则使用默认值
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id';

export const config = getDefaultConfig({
  appName: 'Genesis NFT BlindBox',
  projectId,
  chains: [hardhat, sepolia],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        injectedWallet,
      ],
    },
  ],
  ssr: false, // 禁用SSR以避免hydration错误
});

// 合约地址配置
export const CONTRACT_ADDRESSES = {
  // 这些地址将在部署后更新
  GEM_TOKEN: process.env.NEXT_PUBLIC_GEM_TOKEN_ADDRESS || '',
  GENESIS_MECHA: process.env.NEXT_PUBLIC_GENESIS_MECHA_ADDRESS || '',
  BLIND_BOX: process.env.NEXT_PUBLIC_BLIND_BOX_ADDRESS || '',
} as const;

// 网络配置
export const SUPPORTED_CHAINS = {
  SEPOLIA: sepolia.id,
  HARDHAT: hardhat.id,
} as const;

// 默认网络 - 改为本地Hardhat网络
export const DEFAULT_CHAIN = hardhat;
