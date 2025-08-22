import { useReadContract } from 'wagmi';
import { parseEther, formatUnits } from 'viem';

// 自动滑点计算 - 模仿Uniswap的策略
function calculateAutoSlippage(ethAmount: number, gemAmount: number): number {
  // 基于交易金额的滑点策略
  if (ethAmount <= 0.01) {
    return 0.5; // 小额交易: 0.5%
  } else if (ethAmount <= 0.1) {
    return 1.0; // 中等交易: 1.0%
  } else if (ethAmount <= 1.0) {
    return 1.5; // 大额交易: 1.5%
  } else {
    return 2.0; // 超大额交易: 2.0%
  }
}

export interface SwapQuote {
  outputAmount: string;
  formattedOutputAmount: string;
  exchangeRate: string;
  priceImpact: string;
  minimumAmountOut: string;
  formattedMinimumAmountOut: string;
  isLoading: boolean;
  error: string | null;
}

export function useUniswapV2Price(
  ethAmount: string,
  slippageTolerance: number = 0.5
): SwapQuote {
  // Uniswap V2 配置 (从环境变量读取)
  const ROUTER_ADDRESS = (process.env.NEXT_PUBLIC_UNISWAP_V2_ROUTER || "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3") as `0x${string}`;
  const WETH_ADDRESS = (process.env.NEXT_PUBLIC_WETH_ADDRESS || "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14") as `0x${string}`;
  const GEM_ADDRESS = (process.env.NEXT_PUBLIC_GEM_TOKEN_ADDRESS || "0xe59E7f631DCf9cD76119252c3aAD396bE48F31af") as `0x${string}`;

  const inputAmountWei = ethAmount && parseFloat(ethAmount) > 0 ? parseEther(ethAmount) : 0n;

  // 使用Uniswap V2 Router的getAmountsOut函数
  const { data: amountsData, isLoading, error } = useReadContract({
    address: ROUTER_ADDRESS,
    abi: [
      {
        "inputs": [
          {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
          {"internalType": "address[]", "name": "path", "type": "address[]"}
        ],
        "name": "getAmountsOut",
        "outputs": [
          {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getAmountsOut',
    args: [inputAmountWei, [WETH_ADDRESS, GEM_ADDRESS]],
    query: {
      enabled: !!ethAmount && parseFloat(ethAmount) > 0,
    },
  });

  // 处理空输入
  if (!ethAmount || parseFloat(ethAmount) <= 0) {
    return {
      outputAmount: '0',
      formattedOutputAmount: '0',
      exchangeRate: '0',
      priceImpact: '0',
      minimumAmountOut: '0',
      formattedMinimumAmountOut: '0',
      isLoading: false,
      error: null
    };
  }

  // 处理加载状态
  if (isLoading) {
    return {
      outputAmount: '0',
      formattedOutputAmount: '0',
      exchangeRate: '0',
      priceImpact: '0',
      minimumAmountOut: '0',
      formattedMinimumAmountOut: '0',
      isLoading: true,
      error: null
    };
  }

  // 处理错误状态
  if (error || !amountsData) {
    return {
      outputAmount: '0',
      formattedOutputAmount: '0',
      exchangeRate: '0',
      priceImpact: '0',
      minimumAmountOut: '0',
      formattedMinimumAmountOut: '0',
      isLoading: false,
      error: error?.message || '无法获取价格'
    };
  }

  try {
    // amountsData[0] 是输入的ETH数量，amountsData[1] 是输出的GEM数量
    const outputAmountRaw = amountsData[1] as bigint;
    const outputAmount = outputAmountRaw.toString();
    const formattedOutput = formatUnits(outputAmountRaw, 6); // GEM是6位小数

    // 计算汇率
    const ethAmountFloat = parseFloat(ethAmount);
    const gemAmountFloat = parseFloat(formattedOutput);
    const rate = gemAmountFloat / ethAmountFloat;
    const exchangeRate = rate.toFixed(2);

    // 自动滑点计算
    const autoSlippage = calculateAutoSlippage(ethAmountFloat, gemAmountFloat);
    const minAmountFloat = gemAmountFloat * (100 - autoSlippage) / 100;
    const minimumAmountOut = Math.floor(minAmountFloat * Math.pow(10, 6)).toString();
    const formattedMinimumAmountOut = minAmountFloat.toFixed(6);

    console.log('🎯 V2自动滑点:', autoSlippage + '%');
    console.log('📊 V2价格计算结果:', {
      ethAmount,
      formattedOutput,
      exchangeRate,
      formattedMinimumAmountOut
    });

    return {
      outputAmount,
      formattedOutputAmount: formattedOutput,
      exchangeRate,
      priceImpact: '0.30', // V2固定0.3%手续费
      minimumAmountOut,
      formattedMinimumAmountOut,
      isLoading: false,
      error: null
    };

  } catch (error) {
    console.error('❌ V2价格计算失败:', error);
    return {
      outputAmount: '0',
      formattedOutputAmount: '0',
      exchangeRate: '0',
      priceImpact: '0',
      minimumAmountOut: '0',
      formattedMinimumAmountOut: '0',
      isLoading: false,
      error: error instanceof Error ? error.message : '计算失败'
    };
  }
}
