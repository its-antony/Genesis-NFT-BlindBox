'use client';

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { GEM_TOKEN_ABI } from '@/config/abis';
import { parseEther } from 'viem';

export function SimpleTest() {
  const { address, isConnected, chain } = useAccount();
  
  // 读取GEM代币余额
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useReadContract({
    address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
    abi: GEM_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.GEM_TOKEN,
    },
  });

  // 读取代币信息
  const { data: tokenInfo, isLoading: tokenLoading, error: tokenError } = useReadContract({
    address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
    abi: GEM_TOKEN_ABI,
    functionName: 'name',
    query: {
      enabled: !!CONTRACT_ADDRESSES.GEM_TOKEN,
    },
  });

  const { writeContract, isPending, error: writeError } = useWriteContract();

  const handleTestApprove = async () => {
    if (!address) return;
    
    console.log('🧪 测试授权参数:');
    console.log('- 合约地址:', CONTRACT_ADDRESSES.GEM_TOKEN);
    console.log('- 用户地址:', address);
    console.log('- 链信息:', chain);
    
    try {
      const result = await writeContract({
        address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
        abi: GEM_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.BLIND_BOX as `0x${string}`, parseEther('100')],
      });
      
      console.log('✅ 写入结果:', result);
    } catch (error) {
      console.error('❌ 写入错误:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-white">请先连接钱包</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">🧪 简单测试</h3>
      
      <div className="space-y-4 text-sm">
        <div className="bg-gray-700 rounded p-4">
          <h4 className="text-white font-bold mb-2">连接信息</h4>
          <p className="text-gray-300">地址: {address}</p>
          <p className="text-gray-300">网络: {chain?.name} (ID: {chain?.id})</p>
          <p className="text-gray-300">连接状态: {isConnected ? '已连接' : '未连接'}</p>
        </div>

        <div className="bg-gray-700 rounded p-4">
          <h4 className="text-white font-bold mb-2">合约地址</h4>
          <p className="text-gray-300 break-all">GEM: {CONTRACT_ADDRESSES.GEM_TOKEN}</p>
          <p className="text-gray-300 break-all">BlindBox: {CONTRACT_ADDRESSES.BLIND_BOX}</p>
        </div>

        <div className="bg-gray-700 rounded p-4">
          <h4 className="text-white font-bold mb-2">代币信息</h4>
          {tokenLoading && <p className="text-gray-300">加载中...</p>}
          {tokenError && <p className="text-red-300">错误: {tokenError.message}</p>}
          {tokenInfo && <p className="text-gray-300">代币名称: {tokenInfo}</p>}
        </div>

        <div className="bg-gray-700 rounded p-4">
          <h4 className="text-white font-bold mb-2">余额信息</h4>
          {balanceLoading && <p className="text-gray-300">加载中...</p>}
          {balanceError && <p className="text-red-300">错误: {balanceError.message}</p>}
          {balance && <p className="text-gray-300">GEM余额: {(Number(balance) / 1e18).toLocaleString()}</p>}
        </div>

        {writeError && (
          <div className="bg-red-900 rounded p-4">
            <h4 className="text-white font-bold mb-2">写入错误</h4>
            <p className="text-red-300">{writeError.message}</p>
          </div>
        )}

        <button
          onClick={handleTestApprove}
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
        >
          {isPending ? '处理中...' : '测试授权 100 GEM'}
        </button>
      </div>
    </div>
  );
}
