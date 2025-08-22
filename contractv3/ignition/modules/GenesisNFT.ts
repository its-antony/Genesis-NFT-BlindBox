import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseUnits } from "viem";

/**
 * Genesis NFT BlindBox - Hardhat Ignition 部署模块
 * 
 * 这个模块将按顺序部署以下合约：
 * 1. GemToken (ERC20) - 用于购买盲盒的代币
 * 2. GenesisMecha (ERC721) - NFT 合约
 * 3. BlindBox - 盲盒核心合约
 * 
 * 并自动配置权限和初始设置
 */
const GenesisNFTModule = buildModule("GenesisNFTModule", (m) => {
  // 获取部署者账户
  const deployer = m.getAccount(0);

  console.log("🚀 开始部署 Genesis NFT BlindBox 合约...");

  // ==================== 第一步：部署 GemToken ====================
  console.log("📋 部署 GemToken (ERC20)...");
  
  const gemToken = m.contract("GemToken", [deployer], {
    id: "GemToken",
  });

  // ==================== 第二步：部署 GenesisMecha ====================
  console.log("📋 部署 GenesisMecha (ERC721)...");
  
  // 参数：owner, minter (先设置为部署者，后续会更改为 BlindBox)
  const genesisMecha = m.contract("GenesisMecha", [deployer, deployer], {
    id: "GenesisMecha",
  });

  // ==================== 第三步：部署 BlindBox ====================
  console.log("📋 部署 BlindBox 核心合约...");
  
  // 设置初始铸造价格：100 GEM (考虑6位小数)
  const initialMintPrice = parseUnits("100", 6);
  
  const blindBox = m.contract("BlindBox", [
    gemToken,           // GEM 代币合约地址
    genesisMecha,       // NFT 合约地址
    initialMintPrice,   // 铸造价格
    deployer           // 合约拥有者
  ], {
    id: "BlindBox",
    after: [gemToken, genesisMecha], // 确保在前两个合约部署后再部署
  });

  // ==================== 第四步：配置权限 ====================
  console.log("🔧 配置合约权限...");
  
  // GenesisMecha 的 MINTER_ROLE 常量值
  const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
  
  // 授予 BlindBox 合约铸造 NFT 的权限
  m.call(genesisMecha, "grantRole", [MINTER_ROLE, blindBox], {
    id: "grantMinterRole",
    after: [blindBox], // 确保 BlindBox 部署完成后再设置权限
  });

  // ==================== 第五步：初始化设置 ====================
  console.log("⚙️ 初始化合约设置...");

  // 可选：设置默认的元数据 Base URI
  const defaultBaseURI = "http://47.108.146.210:8889/tmp/";
  
  m.call(genesisMecha, "setBaseURI", [defaultBaseURI], {
    id: "setDefaultBaseURI",
    after: [genesisMecha], // 确保 GenesisMecha 部署完成后再设置
  });

  // ==================== 返回部署的合约实例 ====================
  return {
    gemToken,
    genesisMecha,
    blindBox,
  };
});

export default GenesisNFTModule;

/**
 * 使用说明：
 * 
 * 1. 部署到本地网络：
 *    npx hardhat ignition deploy ignition/modules/GenesisNFT.ts
 * 
 * 2. 部署到测试网：
 *    npx hardhat ignition deploy ignition/modules/GenesisNFT.ts --network sepolia
 * 
 * 3. 重新运行部署（Ignition 会自动检测已部署的合约）：
 *    npx hardhat ignition deploy ignition/modules/GenesisNFT.ts --network sepolia
 * 
 * 4. 查看部署状态：
 *    部署信息会保存在 ignition/deployments/ 目录中
 * 
 * 部署完成后的合约状态：
 * - GemToken: 部署者拥有 Totalsupply GEM 代币
 * - GenesisMecha: BlindBox 合约具有铸造权限
 * - BlindBox: 可以接受 GEM 代币并铸造 NFT
 * - 所有合约的 owner 都是部署者账户
 */
