/**
 * 检查前端配置是否正确
 */

const fs = require('fs');
const path = require('path');

// 读取环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// 读取部署地址
const deployedAddressesPath = path.join(__dirname, '../../contractv3/ignition/deployments/chain-11155111/deployed_addresses.json');

function checkConfig() {
  console.log('🔍 检查前端配置...\n');

  // 检查环境变量
  const envVars = {
    'GEM_TOKEN': process.env.NEXT_PUBLIC_GEM_TOKEN_ADDRESS,
    'GENESIS_MECHA': process.env.NEXT_PUBLIC_GENESIS_MECHA_ADDRESS,
    'BLIND_BOX': process.env.NEXT_PUBLIC_BLIND_BOX_ADDRESS,
    'CHAIN_ID': process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID,
  };

  console.log('📋 环境变量配置:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`   ${key}: ${value || '❌ 未设置'}`);
  });

  // 检查部署地址
  if (fs.existsSync(deployedAddressesPath)) {
    console.log('\n📋 Sepolia部署地址:');
    const deployedAddresses = JSON.parse(fs.readFileSync(deployedAddressesPath, 'utf8'));
    
    const contractMapping = {
      'GenesisNFTModule#GemToken': 'GEM_TOKEN',
      'GenesisNFTModule#GenesisMecha': 'GENESIS_MECHA', 
      'GenesisNFTModule#BlindBox': 'BLIND_BOX'
    };

    let allMatch = true;
    
    Object.entries(deployedAddresses).forEach(([contractName, address]) => {
      const envKey = contractMapping[contractName];
      const envValue = envVars[envKey];
      const matches = envValue?.toLowerCase() === address.toLowerCase();
      
      console.log(`   ${contractName}: ${address}`);
      console.log(`   环境变量匹配: ${matches ? '✅' : '❌'}`);
      
      if (!matches) allMatch = false;
    });

    console.log('\n📊 配置检查结果:');
    if (allMatch) {
      console.log('✅ 所有合约地址配置正确！');
    } else {
      console.log('❌ 合约地址配置不匹配，请更新 .env.local 文件');
      console.log('\n🔧 建议的配置:');
      Object.entries(deployedAddresses).forEach(([contractName, address]) => {
        const envKey = contractMapping[contractName];
        console.log(`NEXT_PUBLIC_${envKey}_ADDRESS=${address}`);
      });
    }

    // 检查网络配置
    console.log('\n🌐 网络配置:');
    const chainId = envVars.CHAIN_ID;
    if (chainId === '11155111') {
      console.log('✅ 默认网络设置为 Sepolia (11155111)');
    } else if (chainId === '31337') {
      console.log('⚠️ 默认网络设置为 Hardhat (31337)');
      console.log('💡 如需使用Sepolia，请设置: NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155111');
    } else {
      console.log(`❌ 未知的链ID: ${chainId}`);
    }

  } else {
    console.log('\n❌ 未找到Sepolia部署地址文件');
    console.log('💡 请先部署合约到Sepolia网络');
  }
}

checkConfig();
