/**
 * 检查部署账户余额和网络连接
 */

import { createPublicClient, createWalletClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

async function main() {
  console.log('🔍 检查部署配置和账户状态');
  console.log('='.repeat(50));

  // ==================== 检查环境变量 ====================
  console.log('📋 环境变量检查:');
  
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
  
  if (!rpcUrl) {
    console.log('❌ SEPOLIA_RPC_URL 未设置');
    console.log('💡 请在 .env 文件中设置 SEPOLIA_RPC_URL');
    process.exit(1);
  }
  console.log('✅ SEPOLIA_RPC_URL:', rpcUrl);
  
  if (!privateKey || privateKey === 'your_private_key_here') {
    console.log('❌ SEPOLIA_PRIVATE_KEY 未设置或使用默认值');
    console.log('💡 请在 .env 文件中设置你的实际私钥');
    process.exit(1);
  }
  console.log('✅ SEPOLIA_PRIVATE_KEY: 已设置 (***隐藏***)');
  console.log('');

  // ==================== 创建客户端 ====================
  console.log('🌐 连接到 Sepolia 网络...');
  
  try {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl)
    });

    // 检查网络连接
    const blockNumber = await publicClient.getBlockNumber();
    console.log('✅ 网络连接成功');
    console.log('📦 当前区块高度:', blockNumber.toString());
    
    const chainId = await publicClient.getChainId();
    console.log('🔗 链 ID:', chainId, '(Sepolia)');
    console.log('');

    // ==================== 检查账户 ====================
    console.log('👤 账户信息检查:');
    
    const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);
    console.log('📍 账户地址:', account.address);
    
    // 获取余额
    const balance = await publicClient.getBalance({ 
      address: account.address 
    });
    
    const balanceInEth = formatEther(balance);
    console.log('💰 账户余额:', balanceInEth, 'ETH');
    
    // 检查余额是否足够
    const minBalance = 0.05; // 最少需要 0.05 ETH
    if (parseFloat(balanceInEth) < minBalance) {
      console.log('⚠️ 余额可能不足以完成部署');
      console.log(`💡 建议至少有 ${minBalance} ETH，当前只有 ${balanceInEth} ETH`);
      console.log('🚰 获取测试 ETH: https://sepoliafaucet.com/');
    } else {
      console.log('✅ 余额充足，可以进行部署');
    }
    
    // 获取 nonce
    const nonce = await publicClient.getTransactionCount({ 
      address: account.address 
    });
    console.log('🔢 账户 Nonce:', nonce);
    console.log('');

    // ==================== 估算 Gas 费用 ====================
    console.log('⛽ Gas 费用估算:');
    
    try {
      const gasPrice = await publicClient.getGasPrice();
      const gasPriceInGwei = Number(gasPrice) / 1e9;
      console.log('💨 当前 Gas 价格:', gasPriceInGwei.toFixed(2), 'Gwei');
      
      // 估算部署成本 (大约需要 3M gas)
      const estimatedGas = 3000000n;
      const estimatedCost = (gasPrice * estimatedGas);
      const estimatedCostInEth = formatEther(estimatedCost);
      
      console.log('📊 预估部署成本:', estimatedCostInEth, 'ETH');
      
      if (parseFloat(balanceInEth) > parseFloat(estimatedCostInEth) * 2) {
        console.log('✅ 余额足够支付 Gas 费用');
      } else {
        console.log('⚠️ 余额可能不足以支付 Gas 费用');
      }
    } catch (error) {
      console.log('⚠️ 无法获取 Gas 价格信息');
    }
    console.log('');

    // ==================== 总结 ====================
    console.log('📋 配置检查总结:');
    console.log('✅ 网络连接: 正常');
    console.log('✅ 账户配置: 正常');
    console.log(`${parseFloat(balanceInEth) >= minBalance ? '✅' : '⚠️'} 账户余额: ${balanceInEth} ETH`);
    console.log('');
    
    if (parseFloat(balanceInEth) >= minBalance) {
      console.log('🎉 所有检查通过，可以开始部署！');
      console.log('');
      console.log('📝 下一步操作:');
      console.log('1. 运行部署命令: pnpm run deploy:sepolia');
      console.log('2. 设置元数据: pnpm run setup:metadata:sepolia');
    } else {
      console.log('⚠️ 请先获取足够的测试 ETH 再进行部署');
      console.log('🚰 Sepolia 水龙头: https://sepoliafaucet.com/');
    }

  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
    console.log('');
    console.log('🔧 可能的解决方案:');
    console.log('1. 检查 SEPOLIA_RPC_URL 是否正确');
    console.log('2. 检查网络连接是否正常');
    console.log('3. 检查私钥格式是否正确 (不要包含0x前缀)');
    process.exit(1);
  }
}

// 执行检查
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
