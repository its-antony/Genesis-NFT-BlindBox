import { network } from "hardhat";
import fs from "fs";
import path from "path";
import { formatEther, formatUnits } from "viem";

/**
 * Genesis NFT BlindBox - 元数据设置脚本 (Hardhat v3 + Ignition)
 * 
 * 功能：
 * 1. 自动读取 Ignition 部署信息
 * 2. 设置 NFT 元数据 Base URI
 * 3. 验证设置结果
 * 4. 支持批量操作
 */

interface DeploymentAddresses {
  [key: string]: string;
}

async function main() {
  console.log("🎨 Genesis NFT BlindBox - 元数据设置脚本");
  console.log("=" .repeat(50));

  const { viem } = await network.connect();
  
  // 获取网络信息
  const networkName = process.env.HARDHAT_NETWORK || "hardhat";
  console.log("🌐 当前网络:", networkName);

  // 获取部署者信息
  const [deployer] = await viem.getWalletClients();
  console.log("👤 操作账户:", deployer.account.address);

  const publicClient = await viem.getPublicClient();
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("💰 账户余额:", formatEther(balance), "ETH");
  console.log("");

  // ==================== 读取部署信息 ====================
  console.log("📋 读取 Ignition 部署信息...");
  
  const deploymentInfo = await readIgnitionDeployment(networkName);
  if (!deploymentInfo) {
    console.error("❌ 无法读取部署信息，请先部署合约:");
    console.log(`   npx hardhat ignition deploy ignition/modules/GenesisNFT.ts --network ${networkName}`);
    process.exit(1);
  }

  const GENESIS_MECHA_ADDRESS = deploymentInfo["GenesisNFTModule#GenesisMecha"];
  const GEM_TOKEN_ADDRESS = deploymentInfo["GenesisNFTModule#GemToken"];
  const BLIND_BOX_ADDRESS = deploymentInfo["GenesisNFTModule#BlindBox"];

  console.log("📋 合约地址信息:");
  console.log("   🔹 GenesisMecha:", GENESIS_MECHA_ADDRESS);
  console.log("   🔹 GemToken:", GEM_TOKEN_ADDRESS);
  console.log("   🔹 BlindBox:", BLIND_BOX_ADDRESS);
  console.log("");

  // ==================== 获取元数据配置 ====================
  const metadataConfig = await getMetadataConfig();
  console.log("🔗 元数据配置:");
  console.log("   📁 Base URI:", metadataConfig.baseURI);
  console.log("   🎨 示例 URI:", `${metadataConfig.baseURI}1.json`);
  console.log("");

  // ==================== 连接合约 ====================
  console.log("🔗 连接到合约...");
  
  const genesisMecha = await viem.getContractAt("GenesisMecha", GENESIS_MECHA_ADDRESS);
  const gemToken = await viem.getContractAt("GemToken", GEM_TOKEN_ADDRESS);
  const blindBox = await viem.getContractAt("BlindBox", BLIND_BOX_ADDRESS);

  // ==================== 检查当前状态 ====================
  console.log("🔍 检查当前合约状态...");
  
  try {
    const currentBaseURI = await genesisMecha.read.getBaseURI();
    console.log("   📁 当前 Base URI:", currentBaseURI || "(未设置)");
    
    const totalSupply = await genesisMecha.read.totalSupply();
    console.log("   📊 当前 NFT 总量:", totalSupply.toString());
    
    const maxSupply = await genesisMecha.read.MAX_SUPPLY();
    console.log("   📊 最大供应量:", maxSupply.toString());
    
    const gemBalance = await gemToken.read.balanceOf([deployer.account.address]);
    console.log("   💎 GEM 余额:", formatUnits(gemBalance, 6), "GEM");
  } catch (error: any) {
    console.log("   ⚠️ 无法读取某些状态信息:", error.message);
  }
  console.log("");

  // ==================== 设置元数据 URI ====================
  console.log("⚙️ 设置元数据 Base URI...");
  
  try {
    console.log("⏳ 发送交易...");
    
    const hash = await genesisMecha.write.setBaseURI([metadataConfig.baseURI]);
    console.log("   📝 交易哈希:", hash);
    
    console.log("⏳ 等待交易确认...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log("✅ Base URI 设置成功!");
    console.log("   🔗 新的 Base URI:", metadataConfig.baseURI);
    console.log("   📦 区块号:", receipt.blockNumber);
    console.log("   ⛽ Gas 使用:", receipt.gasUsed.toString());
  } catch (error: any) {
    console.error("❌ 设置失败:", error.message);
    process.exit(1);
  }
  console.log("");

  // ==================== 验证设置结果 ====================
  console.log("🔍 验证设置结果...");
  
  try {
    const newBaseURI = await genesisMecha.read.getBaseURI();
    console.log("   📁 验证 Base URI:", newBaseURI);
    
    // 尝试获取示例 token URI
    try {
      const tokenURI1 = await genesisMecha.read.tokenURI([1n]);
      console.log("   🎨 示例 tokenURI(#1):", tokenURI1);
    } catch {
      console.log("   🎨 示例 tokenURI(#1): (Token #1 尚未铸造)");
    }
    
    // 检查是否与预期一致
    if (newBaseURI === metadataConfig.baseURI) {
      console.log("✅ 元数据 URI 设置验证成功!");
    } else {
      console.log("⚠️ 元数据 URI 设置可能有问题");
    }
  } catch (error: any) {
    console.log("⚠️ 验证过程中出现错误:", error.message);
  }
  console.log("");

  // ==================== 完成 ====================
  console.log("🎉 元数据设置完成!");
  console.log("");
  console.log("📝 下一步操作:");
  console.log("1. 确保元数据文件已上传到:", metadataConfig.baseURI);
  console.log("2. 测试盲盒铸造功能");
  console.log("3. 验证 NFT 元数据显示正常");
}

/**
 * 读取 Ignition 部署信息
 */
async function readIgnitionDeployment(networkName: string): Promise<DeploymentAddresses | null> {
  try {
    // Ignition 部署文件路径可能因网络而异
    const possiblePaths = [
      path.join(process.cwd(), "ignition", "deployments", `chain-${networkName}`, "deployed_addresses.json"),
      path.join(process.cwd(), "ignition", "deployments", networkName, "deployed_addresses.json"),
      path.join(process.cwd(), "ignition", "deployments", "chain-31337", "deployed_addresses.json"), // hardhat 默认
    ];

    for (const deploymentPath of possiblePaths) {
      if (fs.existsSync(deploymentPath)) {
        const deploymentData = fs.readFileSync(deploymentPath, 'utf8');
        const addresses: DeploymentAddresses = JSON.parse(deploymentData);
        console.log("✅ 读取部署信息成功:", deploymentPath);
        return addresses;
      }
    }

    console.log("⚠️ 未找到部署文件，尝试的路径:");
    possiblePaths.forEach(p => console.log(`   - ${p}`));
    return null;
  } catch (error: any) {
    console.error("❌ 读取部署信息失败:", error.message);
    return null;
  }
}

/**
 * 获取元数据配置
 */
async function getMetadataConfig() {
  // 尝试从多个来源获取 Base URI
  let baseURI: string | undefined;
  let source: string = "默认配置";

  // 1. 尝试从 .env 文件读取
  try {
    // 手动读取 .env 文件 (ES 模块方式)
    const fs = await import('fs');
    const path = await import('path');
    const envPath = path.join(process.cwd(), '.env');

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envLines = envContent.split('\n');

      for (const line of envLines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('MECHA_BASE_URI=')) {
          baseURI = trimmedLine.split('=')[1].trim();
          source = ".env 文件";
          break;
        }
      }
    }
  } catch (error) {
    console.log("⚠️ 读取 .env 文件失败:", error);
  }

  // 2. 如果没有找到，尝试环境变量
  if (!baseURI && process.env.MECHA_BASE_URI) {
    baseURI = process.env.MECHA_BASE_URI;
    source = "环境变量";
  }

  // 3. 使用默认值
  if (!baseURI) {
    baseURI = "http://47.108.146.210:8889/tmp/";
    source = "默认配置";
  }

  console.log(`🔧 使用 ${source} 中的 Base URI: ${baseURI}`);

  if (source === "默认配置") {
    console.log("💡 提示: 可通过以下方式自定义:");
    console.log("   1. 在 .env 文件中设置: MECHA_BASE_URI=https://your-cdn.com/metadata/");
    console.log("   2. 或使用环境变量: MECHA_BASE_URI=https://your-cdn.com/metadata/ npx hardhat run scripts/setupMetadata.ts");
  }

  return {
    baseURI,
  };
}

// 执行主函数
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  });
