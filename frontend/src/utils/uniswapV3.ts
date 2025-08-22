import { Token, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { Pool, Route, Trade, SwapQuoter } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';

// Sepolia网络配置
export const SEPOLIA_CHAIN_ID = 11155111;

// 代币配置
export const WETH_TOKEN = new Token(
  SEPOLIA_CHAIN_ID,
  '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH
  18,
  'WETH',
  'Wrapped Ether'
);

export const GEM_TOKEN = new Token(
  SEPOLIA_CHAIN_ID,
  '0x2453Ea27AfE2abB6FB365dbface85ca0Ca4d9dC2', // GEM代币地址
  6,
  'GEM',
  'GEM Token'
);

// 池子配置
export const POOL_FEE = 100; // 0.01%

// 创建Pool实例的接口
export interface PoolData {
  sqrtPriceX96: string;
  liquidity: string;
  tick: number;
}

// 创建Pool实例
export function createPool(poolData: PoolData): Pool {
  return new Pool(
    GEM_TOKEN,
    WETH_TOKEN,
    POOL_FEE,
    poolData.sqrtPriceX96,
    poolData.liquidity,
    poolData.tick
  );
}

// 计算交换价格
export function calculateSwapPrice(
  pool: Pool,
  inputAmount: string,
  isExactIn: boolean = true
): {
  outputAmount: string;
  priceImpact: string;
  route: Route<Token, Token>;
} | null {
  try {
    // 创建输入金额
    const inputCurrencyAmount = CurrencyAmount.fromRawAmount(
      WETH_TOKEN,
      JSBI.BigInt(inputAmount)
    );

    // 创建路由
    const route = new Route([pool], WETH_TOKEN, GEM_TOKEN);

    // 创建交易
    const trade = Trade.createUncheckedTrade({
      route,
      inputAmount: inputCurrencyAmount,
      outputAmount: CurrencyAmount.fromRawAmount(
        GEM_TOKEN,
        JSBI.BigInt('1') // 临时值，会被重新计算
      ),
      tradeType: TradeType.EXACT_INPUT,
    });

    // 计算输出金额
    const outputAmount = trade.outputAmount;
    
    // 计算价格影响
    const priceImpact = trade.priceImpact;

    return {
      outputAmount: outputAmount.quotient.toString(),
      priceImpact: priceImpact.toFixed(2),
      route
    };
  } catch (error) {
    console.error('计算交换价格失败:', error);
    return null;
  }
}

// 计算滑点保护的最小输出
export function calculateMinimumAmountOut(
  outputAmount: string,
  slippageTolerance: number // 百分比，例如 0.5 表示 0.5%
): string {
  try {
    // 创建滑点百分比对象
    const slippagePercent = new Percent(
      JSBI.BigInt(Math.floor(slippageTolerance * 100)), // 转换为基点
      JSBI.BigInt(10000) // 10000 基点 = 100%
    );

    const outputCurrencyAmount = CurrencyAmount.fromRawAmount(
      GEM_TOKEN,
      JSBI.BigInt(outputAmount)
    );

    // 使用SDK的滑点计算
    const minimumAmount = outputCurrencyAmount.multiply(
      new Percent(
        JSBI.subtract(JSBI.BigInt(10000), slippagePercent.numerator),
        JSBI.BigInt(10000)
      )
    );

    return minimumAmount.quotient.toString();
  } catch (error) {
    console.error('计算最小输出失败:', error);
    // 简单的后备计算
    const outputBigInt = JSBI.BigInt(outputAmount);
    const slippageMultiplier = JSBI.BigInt(Math.floor((100 - slippageTolerance) * 100));
    const minimumAmount = JSBI.divide(
      JSBI.multiply(outputBigInt, slippageMultiplier),
      JSBI.BigInt(10000)
    );
    return minimumAmount.toString();
  }
}

// 计算价格影响
export function calculatePriceImpact(
  inputAmount: string,
  outputAmount: string,
  pool: Pool
): string {
  try {
    const inputCurrencyAmount = CurrencyAmount.fromRawAmount(WETH_TOKEN, JSBI.BigInt(inputAmount));
    const outputCurrencyAmount = CurrencyAmount.fromRawAmount(GEM_TOKEN, JSBI.BigInt(outputAmount));

    // 获取池子的当前价格
    const poolPrice = pool.token0Price;

    // 计算执行价格
    const executionPrice = inputCurrencyAmount.divide(outputCurrencyAmount);

    // 计算价格影响百分比
    const priceImpact = poolPrice.subtract(executionPrice).divide(poolPrice).multiply(100);

    return Math.abs(parseFloat(priceImpact.toSignificant(4))).toFixed(2);
  } catch (error) {
    console.error('计算价格影响失败:', error);
    return '0.00';
  }
}

// 验证滑点设置
export function validateSlippageTolerance(slippage: number): boolean {
  return slippage >= 0.01 && slippage <= 50; // 0.01% 到 50%
}

// 获取推荐的滑点设置
export function getRecommendedSlippage(priceImpact: number): number {
  if (priceImpact < 0.1) return 0.1;
  if (priceImpact < 1) return 0.5;
  if (priceImpact < 3) return 1.0;
  return 2.0; // 高价格影响时使用更高滑点
}

// 格式化金额显示
export function formatTokenAmount(
  amount: string | bigint,
  token: Token,
  significantDigits: number = 6
): string {
  try {
    // 处理不同类型的输入
    let amountStr: string;
    if (typeof amount === 'bigint') {
      amountStr = amount.toString();
    } else {
      amountStr = amount;
    }

    const currencyAmount = CurrencyAmount.fromRawAmount(token, JSBI.BigInt(amountStr));
    return currencyAmount.toSignificant(significantDigits);
  } catch (error) {
    console.error('格式化金额失败:', error);
    // 简单的后备格式化
    try {
      const amountStr = typeof amount === 'bigint' ? amount.toString() : amount;
      const decimals = token.decimals;
      const divisor = Math.pow(10, decimals);
      const formatted = (parseFloat(amountStr) / divisor).toFixed(significantDigits);
      return parseFloat(formatted).toString();
    } catch (fallbackError) {
      console.error('后备格式化也失败:', fallbackError);
      return '0';
    }
  }
}

// 计算汇率
export function calculateExchangeRate(
  inputAmount: string,
  outputAmount: string,
  inputToken: Token,
  outputToken: Token
): string {
  try {
    const inputCurrencyAmount = CurrencyAmount.fromRawAmount(inputToken, JSBI.BigInt(inputAmount));
    const outputCurrencyAmount = CurrencyAmount.fromRawAmount(outputToken, JSBI.BigInt(outputAmount));
    
    // 计算 1 个输入代币能换多少输出代币
    const oneInputToken = CurrencyAmount.fromRawAmount(
      inputToken,
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(inputToken.decimals))
    );
    
    const rate = JSBI.divide(
      JSBI.multiply(outputCurrencyAmount.quotient, oneInputToken.quotient),
      inputCurrencyAmount.quotient
    );
    
    return formatTokenAmount(rate.toString(), outputToken);
  } catch (error) {
    console.error('计算汇率失败:', error);
    return '0';
  }
}

// 验证池子数据
export function validatePoolData(poolData: PoolData): boolean {
  try {
    return (
      poolData.sqrtPriceX96 && 
      poolData.liquidity && 
      typeof poolData.tick === 'number' &&
      JSBI.greaterThan(JSBI.BigInt(poolData.liquidity), JSBI.BigInt(0))
    );
  } catch (error) {
    console.error('验证池子数据失败:', error);
    return false;
  }
}
