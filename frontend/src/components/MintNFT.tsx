'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { toast } from 'react-hot-toast';
import { 
  useMintNFT, 
  useMintBatchNFT, 
  useApproveGemToken,
  useMintPrice,
  useUserInfo,
  formatGemAmount,
  parseGemAmount
} from '@/hooks/useContracts';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { GEM_TOKEN_ABI, BLIND_BOX_ABI } from '@/config/abis';
import { useRefresh } from '@/contexts/RefreshContext';
import { showErrorToast, showSuccessToast, showLoadingToast, dismissToast, isUserRejectedError } from '@/utils/errorHandler';

export function MintNFT() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { refreshAll } = useRefresh();
  const [mintAmount, setMintAmount] = useState(1);
  const [isApproving, setIsApproving] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>();
  const [mintHash, setMintHash] = useState<`0x${string}` | undefined>();

  // 防止hydration错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 合约数据
  const { data: mintPrice } = useMintPrice();
  const { refetchUserInfo, ...userInfo } = useUserInfo(mounted ? address : undefined);
  
  // 合约写入函数 - 使用统一的writeContract
  const { writeContract, isPending: isWritePending } = useWriteContract({
    mutation: {
      onSuccess: (hash, variables) => {
        console.log('✅ 交易成功发送:', hash);
        if (variables.functionName === 'approve') {
          setApproveHash(hash);
          showLoadingToast('等待授权确认...', 'approve');
        } else {
          setMintHash(hash);
          showLoadingToast('等待铸造确认...', 'mint');
        }
      },
      onError: (error, variables) => {
        console.error('❌ 交易失败:', error);
        if (variables.functionName === 'approve') {
          setIsApproving(false);
          if (!isUserRejectedError(error)) {
            showErrorToast(error, '授权失败');
          }
        } else {
          setIsMinting(false);
          if (!isUserRejectedError(error)) {
            showErrorToast(error, '铸造失败');
          }
        }
      },
    },
  });

  // 交易状态监听
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess, isError: isApproveError } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isMintLoading, isSuccess: isMintSuccess, isError: isMintError } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  // 计算总价格
  const totalPrice = mintPrice ? mintPrice * BigInt(mintAmount) : 0n;
  
  // 检查用户余额和授权
  const hasEnoughBalance = userInfo?.gemBalance && userInfo.gemBalance >= totalPrice;
  const hasEnoughAllowance = userInfo?.allowance && userInfo.allowance >= totalPrice;
  const needsApproval = hasEnoughBalance && !hasEnoughAllowance;

  // 监听交易完成
  useEffect(() => {
    if (isApproveSuccess) {
      setIsApproving(false);
      setApproveHash(undefined);
      dismissToast('approve');
      showSuccessToast('授权成功！现在可以铸造NFT了', approveHash);
      refetchUserInfo();
    }
    if (isApproveError) {
      setIsApproving(false);
      setApproveHash(undefined);
      dismissToast('approve');
      showErrorToast(new Error('授权交易失败'), '授权失败');
    }
  }, [isApproveSuccess, isApproveError, refetchUserInfo, approveHash]);

  useEffect(() => {
    if (isMintSuccess) {
      setIsMinting(false);
      setMintHash(undefined);
      dismissToast('mint');
      showSuccessToast(`成功铸造 ${mintAmount} 个NFT！`, mintHash);
      refetchUserInfo();
      // 刷新所有统计信息
      refreshAll();
    }
    if (isMintError) {
      setIsMinting(false);
      setMintHash(undefined);
      dismissToast('mint');
      showErrorToast(new Error('铸造交易失败'), '铸造失败');
    }
  }, [isMintSuccess, isMintError, mintAmount, refetchUserInfo, refreshAll, mintHash]);

  // 授权GEM代币
  const handleApprove = async () => {
    if (!mintPrice) return;

    try {
      setIsApproving(true);
      await writeContract({
        address: CONTRACT_ADDRESSES.GEM_TOKEN as `0x${string}`,
        abi: GEM_TOKEN_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.BLIND_BOX as `0x${string}`, totalPrice],
      });
    } catch (error) {
      setIsApproving(false);
      console.error('授权失败:', error);
      if (!isUserRejectedError(error)) {
        showErrorToast(error, '授权失败');
      }
    }
  };

  // 铸造NFT
  const handleMint = async () => {
    try {
      setIsMinting(true);

      console.log('🎯 开始铸造:', {
        mintAmount,
        address,
        contractAddress: CONTRACT_ADDRESSES.BLIND_BOX,
        userBalance: userInfo?.gemBalance,
        userAllowance: userInfo?.allowance,
        mintPrice: mintPrice?.toString(),
        totalCost: totalPrice.toString()
      });

      console.log('📝 调用 purchaseBlindBox() 函数，参数:', mintAmount);
      await writeContract({
        address: CONTRACT_ADDRESSES.BLIND_BOX as `0x${string}`,
        abi: BLIND_BOX_ABI,
        functionName: 'purchaseBlindBox',
        args: [BigInt(mintAmount)],
      });
    } catch (error) {
      setIsMinting(false);
      console.error('❌ 铸造失败详细信息:', {
        error,
        message: error?.message,
        cause: error?.cause,
        stack: error?.stack
      });

      // 如果不是用户取消，则显示错误信息
      if (!isUserRejectedError(error)) {
        showErrorToast(error, '铸造失败');
      }
    }
  };

  if (!mounted) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">铸造 Genesis Mecha NFT</h2>
        <p className="text-gray-400 mb-6">加载中...</p>
        <div className="w-32 h-32 mx-auto bg-gray-700 rounded-lg flex items-center justify-center text-4xl animate-pulse">
          ⏳
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">铸造 Genesis Mecha NFT</h2>
        <p className="text-gray-400 mb-6">加载中...</p>
        <div className="w-32 h-32 mx-auto bg-gray-700 rounded-lg flex items-center justify-center text-4xl animate-pulse">
          ⏳
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">铸造 Genesis Mecha NFT</h2>
        <p className="text-gray-400 mb-6">请先连接钱包以开始铸造</p>
        <div className="w-32 h-32 mx-auto bg-gray-700 rounded-lg flex items-center justify-center text-4xl">
          🔗
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        🎲 铸造 Genesis Mecha NFT
      </h2>

      {/* 铸造数量选择 */}
      <div className="mb-6">
        <label className="block text-white text-sm font-medium mb-2">
          铸造数量 (1-5)
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMintAmount(Math.max(1, mintAmount - 1))}
            disabled={mintAmount <= 1}
            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold"
          >
            -
          </button>

          <div className="flex-1 text-center">
            <input
              type="number"
              min="1"
              max="5"
              value={mintAmount}
              onChange={(e) => setMintAmount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20 h-10 bg-gray-700 text-white text-center rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setMintAmount(Math.min(5, mintAmount + 1))}
            disabled={mintAmount >= 5}
            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* 价格信息 */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">单价:</span>
          <span className="text-white font-bold">
            {mintPrice ? `${formatGemAmount(mintPrice)} GEM` : '加载中...'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">总价:</span>
          <span className="text-yellow-400 font-bold text-lg">
            {formatGemAmount(totalPrice)} GEM
          </span>
        </div>
      </div>

      {/* 余额检查 */}
      {userInfo && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">我的GEM余额:</span>
            <span className={`font-bold ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
              {userInfo?.gemBalance ? formatGemAmount(userInfo.gemBalance) : '0'} GEM
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">已授权额度:</span>
            <span className={`font-bold ${hasEnoughAllowance ? 'text-green-400' : 'text-yellow-400'}`}>
              {userInfo?.allowance ? formatGemAmount(userInfo.allowance) : '0'} GEM
            </span>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="space-y-4">
        {!hasEnoughBalance && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-center">
            <p className="text-red-300">GEM余额不足，无法铸造</p>
          </div>
        )}

        {hasEnoughBalance && needsApproval && (
          <button
            onClick={handleApprove}
            disabled={isApproving || isApproveLoading || isWritePending}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
          >
            {(isApproving || isApproveLoading || isWritePending) ? '授权中...' : `授权 ${formatGemAmount(totalPrice)} GEM`}
          </button>
        )}

        {hasEnoughBalance && hasEnoughAllowance && (
          <button
            onClick={handleMint}
            disabled={isMinting || isMintLoading || isWritePending}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {(isMinting || isMintLoading || isWritePending) ? '铸造中...' : `铸造 ${mintAmount} 个NFT`}
          </button>
        )}
      </div>

      {/* 快捷数量按钮 */}
      <div className="mt-6">
        <p className="text-gray-400 text-sm mb-2">快捷选择:</p>
        <div className="flex gap-2">
          {[1, 3, 5, 10].map((amount) => (
            <button
              key={amount}
              onClick={() => setMintAmount(amount)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                mintAmount === amount
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
