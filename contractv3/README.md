# Genesis NFT BlindBox - Hardhat v3 项目

## 📋 项目概述

这是一个基于 Hardhat v3 + Ignition 的现代化 Web3 项目，实现了一个完整的 NFT 盲盒系统。

### 🎯 核心功能

- **GemToken (ERC20)**: 游戏代币，用于购买盲盒
- **GenesisMecha (ERC721)**: 创世纪机甲 NFT 合约
- **BlindBox**: 盲盒核心逻辑，处理随机铸造

### 🚀 技术栈

- **Hardhat v3**: 最新的以太坊开发框架
- **Hardhat Ignition**: 声明式部署系统
- **viem v2**: 现代化的以太坊库
- **TypeScript**: 完整的类型安全
- **OpenZeppelin**: 安全的智能合约库

## 📁 项目结构

```
contractv3/
├── contracts/                 # 智能合约
│   ├── GemToken.sol           # ERC20 代币合约
│   ├── GenesisMecha.sol       # ERC721 NFT 合约
│   └── BlindBox.sol           # 盲盒核心合约
├── ignition/modules/          # Ignition 部署模块
│   └── GenesisNFT.ts          # 完整部署配置
├── scripts/                   # 部署和管理脚本
│   ├── deployAndTest.ts       # 完整部署测试脚本
│   ├── setupMetadata.ts       # 元数据设置脚本
│   └── testBlindBox.ts        # 盲盒功能测试
└── test/                      # 测试文件
```

## 🛠️ 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 编译合约

```bash
npx hardhat compile
```

### 3. 运行完整测试

```bash
npx hardhat run scripts/deployAndTest.ts
```

## 🚀 部署指南

### 使用 Ignition 部署（推荐）

```bash
# 部署到本地网络
npx hardhat node                                                    # 终端1
npx hardhat ignition deploy ignition/modules/GenesisNFT.ts --network localhost  # 终端2

# 部署到测试网
npx hardhat ignition deploy ignition/modules/GenesisNFT.ts --network sepolia
```

### 使用脚本部署

```bash
# 完整部署和测试
npx hardhat run scripts/deployAndTest.ts

# 仅设置元数据
npx hardhat run scripts/setupMetadata.ts --network localhost

# 测试盲盒功能
npx hardhat run scripts/testBlindBox.ts --network localhost
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件：

```bash
# 网络配置
SEPOLIA_URL=https://sepolia.infura.io/v3/your-key
PRIVATE_KEY=your-private-key

# 验证配置
ETHERSCAN_API_KEY=your-etherscan-key

# 元数据配置
MECHA_BASE_URI=https://your-cdn.com/metadata/
```

## 📊 合约详情

### GemToken (ERC20)

- **名称**: Gem Token (GEM)
- **小数位**: 6
- **初始供应量**: 10,000,000 GEM
- **功能**: mint, burn, transfer

### GenesisMecha (ERC721)

- **名称**: Genesis Mecha (GMECHA)
- **最大供应量**: 20 NFT
- **功能**: safeMint, setBaseURI, 权限管理

### BlindBox

- **铸造价格**: 100 GEM (可调整)
- **最大单次购买**: 10 个
- **功能**: purchaseBlindBox, 随机元数据分配

## 🎮 使用流程

### 1. 获取 GEM 代币

```typescript
// 部署者铸造代币给用户
await gemToken.write.transfer([userAddress, amount]);
```

### 2. 授权 BlindBox 合约

```typescript
// 用户授权 BlindBox 使用 GEM
await gemToken.write.approve([blindBoxAddress, amount]);
```

### 3. 购买盲盒

```typescript
// 购买指定数量的盲盒
await blindBox.write.purchaseBlindBox([count]);
```

### 4. 查看 NFT

```typescript
// 获取用户的 NFT
const balance = await genesisMecha.read.balanceOf([userAddress]);
const tokenURI = await genesisMecha.read.tokenURI([tokenId]);
```

## 🔍 测试结果示例

```
🎉 部署和测试完成!

📊 最终状态总结:
========================================
📋 合约地址:
   🔹 GemToken: 0x5fbdb2315678afecb367f032d93f642f64180aa3
   🔹 GenesisMecha: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
   🔹 BlindBox: 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0

📊 测试结果:
   ✅ 成功购买了 2 个盲盒
   ✅ 用户获得了 2 个 NFT
   ✅ GEM 代币正确扣除
   ✅ 合约功能正常运行
```

## 🎯 Hardhat v3 优势

### 1. 声明式部署
- **自动依赖管理**: Ignition 自动处理合约间依赖
- **幂等性**: 重复运行不会重复部署
- **状态恢复**: 部署中断后可从中断点继续

### 2. 现代化开发体验
- **类型安全**: 完整的 TypeScript 支持
- **更快编译**: 优化的编译器
- **更好错误提示**: 清晰的错误信息

### 3. viem 集成
- **现代化 API**: 更直观的合约交互
- **更好的性能**: 优化的网络请求
- **类型推导**: 自动的类型推导

## 📝 常用命令

```bash
# 开发命令
npx hardhat compile                    # 编译合约
npx hardhat test                       # 运行测试
npx hardhat node                       # 启动本地网络

# 部署命令
npx hardhat ignition deploy ignition/modules/GenesisNFT.ts
npx hardhat run scripts/deployAndTest.ts

# 管理命令
npx hardhat run scripts/setupMetadata.ts
npx hardhat verify --network sepolia <address>

# 清理命令
npx hardhat clean                      # 清理编译缓存
rm -rf ignition/deployments/           # 清理部署记录
```

## 🆘 故障排除

### 常见问题

1. **编译失败**: 检查 OpenZeppelin 版本兼容性
2. **部署失败**: 确认网络配置和账户余额
3. **Ignition 错误**: 检查部署模块语法
4. **权限错误**: 确认角色分配正确

### 获取帮助

- [Hardhat v3 文档](https://hardhat.org/docs)
- [Hardhat Ignition 指南](https://hardhat.org/ignition)
- [viem 文档](https://viem.sh)

## 📄 许可证

MIT License
