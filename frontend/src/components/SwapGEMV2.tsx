'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import { useUniswapV2Price } from '../hooks/useUniswapV2Price';
import { showErrorToast, showSuccessToast, isUserRejectedError } from '../utils/errorHandler';

// Uniswap V2 Router ABI - 只包含必要的函数
const UNISWAP_V2_ROUTER_ABI = [
  {
    "inputs": [
      {"name": "amountOutMin", "type": "uint256"},
      {"name": "path", "type": "address[]"},
      {"name": "to", "type": "address"},
      {"name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactETHForTokens",
    "outputs": [{"name": "amounts", "type": "uint256[]"}],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export function SwapGEMV2() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [ethAmount, setEthAmount] = useState('0.01');
  const [isSwapping, setIsSwapping] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Uniswap V2 配置 (从环境变量读取)
  const V2_ROUTER = (process.env.NEXT_PUBLIC_UNISWAP_V2_ROUTER || "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3") as `0x${string}`;
  const WETH_ADDRESS = (process.env.NEXT_PUBLIC_WETH_ADDRESS || "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14") as `0x${string}`;
  const GEM_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_GEM_TOKEN_ADDRESS || "0xe59E7f631DCf9cD76119252c3aAD396bE48F31af") as `0x${string}`;

  // 避免SSR水合问题
  useEffect(() => {
    setIsMounted(true);
    setMounted(true);
  }, []);

  // 使用Uniswap V2价格计算
  const swapQuote = useUniswapV2Price(ethAmount);

  const { writeContract, isPending } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        console.log('✅ V2交换交易发送成功:', hash);
        showSuccessToast('交换交易已发送！', hash);
        setIsSwapping(false);
      },
      onError: (error) => {
        console.error('❌ V2交换失败:', error);
        setIsSwapping(false);
        if (!isUserRejectedError(error)) {
          showErrorToast(error, '交换失败');
        }
      },
    },
  });

  // 配置日志
  useEffect(() => {
    if (mounted) {
      console.log('🔍 SwapGEMV2 配置:', {
        V2_ROUTER,
        WETH_ADDRESS,
        GEM_TOKEN_ADDRESS
      });
    }
  }, [V2_ROUTER, WETH_ADDRESS, GEM_TOKEN_ADDRESS, mounted]);

  // 条件渲染
  if (!mounted || !isMounted) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-12 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">🔗 连接钱包</h2>
        <p className="text-gray-400 mb-6">请先连接钱包以开始交换</p>
        <div className="text-yellow-400">
          点击右上角的"连接钱包"按钮
        </div>
      </div>
    );
  }

  const handleSwap = async () => {
    if (!address || !WETH_ADDRESS || !GEM_TOKEN_ADDRESS) {
      toast.error('请先连接钱包');
      return;
    }

    if (parseFloat(ethAmount) <= 0) {
      toast.error('请输入有效的ETH数量');
      return;
    }

    if (!swapQuote.outputAmount || parseFloat(swapQuote.formattedOutputAmount) <= 0) {
      toast.error('无法获取价格信息');
      return;
    }

    try {
      setIsSwapping(true);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20分钟后过期
      
      // 使用自动滑点计算的最小输出
      const minAmountOut = BigInt(swapQuote.minimumAmountOut);
      
      // 交换路径: ETH -> WETH -> GEM
      const path = [WETH_ADDRESS, GEM_TOKEN_ADDRESS];

      console.log('🔄 执行V2交换:', {
        ethAmount,
        expectedGEM: swapQuote.formattedOutputAmount,
        minAmountOut: swapQuote.formattedMinimumAmountOut,
        path,
        deadline
      });

      await writeContract({
        address: V2_ROUTER,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [
          minAmountOut,
          path,
          address,
          BigInt(deadline)
        ],
        value: parseEther(ethAmount),
      });
    } catch (error) {
      console.error('V2交换失败:', error);
      setIsSwapping(false);
      if (!isUserRejectedError(error)) {
        showErrorToast(error, '交换失败');
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        💱 通过Uniswap V2获取GEM
        <span className="text-xs bg-blue-600 px-2 py-1 rounded">V2版本</span>
      </h3>
      
      <div className="space-y-4">
        {/* ETH输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            支付 ETH
          </label>
          <div className="relative">
            <input
              type="number"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              placeholder="0.01"
              step="0.001"
              min="0"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-3 text-gray-400 font-medium">
              ETH
            </div>
          </div>
        </div>

        {/* 交换箭头 */}
        <div className="flex justify-center">
          <div className="bg-gray-700 rounded-full p-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* GEM输出 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            获得 GEM (估算)
          </label>
          <div className="relative">
            <input
              type="text"
              value={swapQuote.isLoading ? '计算中...' : swapQuote.formattedOutputAmount}
              readOnly
              placeholder="0"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 cursor-not-allowed"
            />
            <div className="absolute right-3 top-3 text-gray-400 font-medium">
              GEM
            </div>
          </div>
        </div>

        {/* V2特性说明 */}
        <div className="bg-gray-700 rounded-lg p-3 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🔄</span>
            <span>Uniswap V2 自动做市商</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            固定0.3%手续费，简单可靠的AMM模型
          </div>
        </div>

        {/* 交换信息 */}
        {parseFloat(swapQuote.formattedOutputAmount) > 0 && !swapQuote.isLoading && (
          <div className="bg-gray-700 rounded-lg p-3 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>汇率:</span>
              <span>1 ETH = {swapQuote.exchangeRate} GEM</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>手续费:</span>
              <span>0.30%</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>智能滑点:</span>
              <span className="text-green-400">自动调整</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>最小获得:</span>
              <span>{swapQuote.formattedMinimumAmountOut} GEM</span>
            </div>
            {swapQuote.error && (
              <div className="text-xs text-yellow-400 mt-2">
                ⚠️ {swapQuote.error}
              </div>
            )}
          </div>
        )}

        {/* 交换按钮 */}
        <button
          onClick={handleSwap}
          disabled={isSwapping || isPending || parseFloat(ethAmount) <= 0 || !swapQuote.outputAmount || swapQuote.isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
        >
          {isSwapping || isPending
            ? '交换中...'
            : swapQuote.isLoading
              ? '计算价格中...'
              : swapQuote.outputAmount
                ? `交换 ${ethAmount} ETH → ${parseFloat(swapQuote.formattedOutputAmount).toFixed(2)} GEM`
                : `交换 ${ethAmount} ETH`
          }
        </button>

        {/* Uniswap链接 */}
        <div className="text-center">
          <a
            href={`https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=${GEM_TOKEN_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            在Uniswap V2上查看 ↗
          </a>
        </div>
      </div>
    </div>
  );
}
