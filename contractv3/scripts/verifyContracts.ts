/**
 * 合约验证脚本
 * 自动验证部署在Sepolia网络上的所有合约
 */





/**
 * 显示验证信息
 */
function showVerificationInfo() {
  console.log('🔍 合约验证信息');
  console.log('='.repeat(50));

  const contracts = [
    {
      name: 'GemToken',
      address: '0x4204e2E0c3A05867bC9AD6a82dEF2102237bfCf5',
      args: ['0x705068024721768c93d3da33b48b31de477e3510']
    },
    {
      name: 'GenesisMecha',
      address: '0x0Ce21612c95C914c5f326137f109dd45dCEA7ac5',
      args: ['0x705068024721768c93d3da33b48b31de477e3510', '0x705068024721768c93d3da33b48b31de477e3510']
    },
    {
      name: 'BlindBox',
      address: '0x50B09DEe889E135beb4B370C3b685C0d62fa61A1',
      args: [
        '0x4204e2E0c3A05867bC9AD6a82dEF2102237bfCf5',
        '0x0Ce21612c95C914c5f326137f109dd45dCEA7ac5',
        '1000000',
        '0x705068024721768c93d3da33b48b31de477e3510'
      ]
    }
  ];

  contracts.forEach(contract => {
    console.log(`\n📋 ${contract.name}:`);
    console.log(`   地址: ${contract.address}`);
    console.log(`   参数: ${contract.args.join(' ')}`);
    console.log(`   命令: npx hardhat verify --network sepolia ${contract.address} ${contract.args.join(' ')}`);
    console.log(`   链接: https://sepolia.etherscan.io/address/${contract.address}`);
  });

  console.log('\n💡 使用方法:');
  console.log('1. 确保 ETHERSCAN_API_KEY 已在 .env 文件中设置');
  console.log('2. 运行单个验证命令:');
  console.log('   pnpm run verify:gemtoken');
  console.log('   pnpm run verify:mecha');
  console.log('   pnpm run verify:blindbox');
  console.log('\n3. 或手动运行:');
  console.log('   npx hardhat verify --network sepolia [address] [args...]');
}

/**
 * 主函数
 */
function main() {
  showVerificationInfo();
}

// 执行主函数
main();
