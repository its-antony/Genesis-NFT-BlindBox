'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  useBlindBoxInfo,
  useUserInfo,
  useGenesisMechaSupplyInfo,
  useGemTokenInfo,
  formatGemAmount
} from '@/hooks/useContracts';
import { useRefresh } from '@/contexts/RefreshContext';

export function ContractInfo() {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { registerRefreshFunction, unregisterRefreshFunction } = useRefresh();

  // 防止hydration错误
  useEffect(() => {
    setMounted(true);
  }, []);

  const contractInfo = useBlindBoxInfo();
  const userInfo = useUserInfo(mounted ? address : undefined);
  const tokenInfo = useGemTokenInfo();
  const {
    maxSupply,
    totalSupply,
    remainingSupply,
    isSoldOut,
    refetchSupplyInfo
  } = useGenesisMechaSupplyInfo();

  // 注册刷新函数
  useEffect(() => {
    const refreshContractInfo = () => {
      refetchSupplyInfo();
      if (userInfo?.refetchUserInfo) {
        userInfo.refetchUserInfo();
      }
    };

    registerRefreshFunction('contractInfo', refreshContractInfo);

    return () => {
      unregisterRefreshFunction('contractInfo');
    };
  }, [registerRefreshFunction, unregisterRefreshFunction, refetchSupplyInfo, userInfo?.refetchUserInfo]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 合约状态信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          title="铸造价格"
          value={contractInfo?.mintPrice?.data ? `${formatGemAmount(contractInfo.mintPrice.data)} GEM` : '加载中...'}
          icon="💎"
          className="bg-gradient-to-br from-purple-600 to-purple-800"
        />

        <InfoCard
          title="已铸造"
          value={totalSupply?.data ? `${totalSupply.data.toString()}` : '0'}
          subtitle={`/ ${maxSupply?.data ? maxSupply.data.toString() : '20'}`}
          icon="🎯"
          className="bg-gradient-to-br from-blue-600 to-blue-800"
        />
        
        <InfoCard
          title="剩余数量"
          value={remainingSupply !== undefined ? remainingSupply.toString() : '0'}
          icon="📦"
          className="bg-gradient-to-br from-green-600 to-green-800"
        />

        <InfoCard
          title="状态"
          value={isSoldOut ? "已售罄" : "可铸造"}
          icon={isSoldOut ? "🔴" : "🟢"}
          className={`bg-gradient-to-br ${
            isSoldOut
              ? 'from-red-600 to-red-800'
              : 'from-emerald-600 to-emerald-800'
          }`}
        />
      </div>

      {/* 用户信息 */}
      {address && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            👤 我的信息
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">GEM 余额</p>
              <p className="text-2xl font-bold text-yellow-400">
                {userInfo?.gemBalance ? formatGemAmount(userInfo.gemBalance) : '0'}
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">GEM 授权额度</p>
              <p className="text-2xl font-bold text-blue-400">
                {userInfo?.allowance ? formatGemAmount(userInfo.allowance) : '0'}
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm">拥有 NFT</p>
              <p className="text-2xl font-bold text-purple-400">
                {userInfo?.nftBalance ? userInfo.nftBalance.toString() : '0'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">已铸造次数</p>
              <p className="text-2xl font-bold text-green-400">
                {/* 暂时显示0，因为当前useUserInfo没有返回铸造次数 */}
                0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 代币信息 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          🪙 GEM 代币信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">代币名称</p>
            <p className="text-lg font-bold text-white">
              {tokenInfo?.name?.data ? tokenInfo.name.data : 'Gem Token'}
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">代币符号</p>
            <p className="text-lg font-bold text-white">
              {tokenInfo?.symbol?.data ? tokenInfo.symbol.data : 'GEM'}
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">小数位数</p>
            <p className="text-lg font-bold text-white">
              {tokenInfo?.decimals?.data ? tokenInfo.decimals.data.toString() : '6'}
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">总供应量</p>
            <p className="text-lg font-bold text-white">
              {tokenInfo?.totalSupply?.data ? `${formatGemAmount(tokenInfo.totalSupply.data)} GEM` : '10,000,000 GEM'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  className?: string;
}

function InfoCard({ title, value, subtitle, icon, className }: InfoCardProps) {
  return (
    <div className={`rounded-lg p-6 text-white ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium opacity-90">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <span className="text-sm opacity-75">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
