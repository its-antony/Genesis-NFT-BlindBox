# 🎮 Genesis NFT BlindBox

> 创世纪机甲NFT盲盒系统 - 完整的Web3盲盒解决方案

## 📋 项目概述

Genesis NFT BlindBox是一个完整的NFT盲盒系统，包含智能合约、前端应用和完整的用户交互流程。用户可以使用GEM代币购买盲盒，随机获得不同稀有度的创世纪机甲NFT。

### ✨ 核心功能

- **🎲 NFT盲盒系统**: 随机铸造不同稀有度的机甲NFT
- **💎 GEM代币经济**: ERC20代币作为盲盒购买货币
- **💱 代币交换**: 集成Uniswap V2，支持ETH↔GEM交换
- **🎨 现代化前端**: 基于Next.js 15的响应式Web3应用
- **🔐 钱包集成**: 支持MetaMask等主流钱包连接

### 🎯 稀有度系统

| 稀有度 | 数量 | 比例 | 特点 |
|--------|------|------|------|
| **Legendary** | 1个 | 5% | 独一无二，最高属性，特殊动画 |
| **Epic** | 3个 | 15% | 高属性值，动画效果 |
| **Rare** | 5个 | 25% | 中等属性，特殊效果 |
| **Common** | 11个 | 55% | 基础属性，标准机甲 |

## 📁 项目结构

```
genesis-nft-blindbox/
├── contractv3/                    # 智能合约 (Hardhat v3)
│   ├── contracts/                 # Solidity合约文件
│   │   ├── GemToken.sol          # ERC20代币合约
│   │   ├── GenesisMecha.sol      # ERC721 NFT合约
│   │   └── BlindBox.sol          # 盲盒核心逻辑
│   ├── ignition/modules/         # Ignition部署配置
│   ├── scripts/                  # 部署和管理脚本
│   └── test/                     # 合约测试文件
├── frontend/                     # 前端应用 (Next.js 15)
│   ├── src/app/                  # App Router页面
│   ├── src/components/           # React组件
│   ├── src/hooks/                # 自定义Hooks
│   └── src/config/               # 配置文件
├── doc/                          # 项目文档
│   ├── 用户交互流程图.md         # 用户操作流程
│   └── 合约交互时需图.md         # 合约交互序列图
├── metadata-examples/            # NFT元数据示例
│   ├── 1.json - 20.json         # 20个NFT元数据
│   └── README.md                # 元数据说明
└── README.md                     # 项目主文档
```

## 🚀 快速开始

### 📋 环境要求

- **Node.js**: >= 22.0.0 (Hardhat v3 要求)
- **pnpm/yarn/npm**: 包管理器
- **Git**: 版本控制

### 🔧 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd genesis-nft-blindbox

# 安装合约依赖
cd contractv3
pnpm install

# 安装前端依赖
cd ../frontend
yarn install --ignore-engines
```

### ⚡ 本地开发

#### 1. 启动本地区块链网络

```bash
cd contractv3
npx hardhat node
```

#### 2. 部署智能合约

```bash
# 新终端窗口
cd contractv3
npx hardhat ignition deploy ignition/modules/GenesisNFT.ts --network localhost
```

#### 3. 启动前端应用

```bash
cd frontend
yarn dev:local
```

#### 4. 访问应用

打开浏览器访问: `http://localhost:3000`

## 🎮 用户交互流程

```mermaid
graph TD
    A[👤 用户开始] --> B{💰 检查 GEM 余额}
    
    B -->|余额不足| C[🔄 通过 Uniswap 获取 GEM]
    B -->|余额充足| F[✅ 授权 GEM 代币]
    
    C --> D[💱 ETH → GEM 交换]
    D --> E[✅ 获得 GEM 代币]
    E --> F
    
    F --> G[📝 调用 approve 函数]
    G --> H[⏳ 等待授权确认]
    H --> I{🔍 授权是否成功?}
    
    I -->|失败| J[❌ 授权失败提示]
    I -->|成功| K[🎁 调用 BlindBox 合约]
    
    J --> F
    
    K --> L[📞 purchaseBlindBox 函数]
    L --> M[💸 扣除 GEM 代币]
    M --> N[🎲 生成随机元数据索引]
    N --> O[📞 调用 GenesisMecha.mint]
    O --> P[🎨 铸造 NFT]
    P --> Q[🏷️ 设置随机元数据]
    Q --> R[✨ NFT 铸造完成]
    R --> S[🎉 用户获得 NFT]
```

## 🔄 合约交互时序图

以下是完整的合约交互流程，展示了用户、前端、钱包和各个智能合约之间的详细交互：

```mermaid
sequenceDiagram
    participant U as 👤 用户
    participant UI as 📱 前端
    participant W as 🔐 钱包
    participant UNI as 🦄 Uniswap
    participant GEM as 💎 GemToken
    participant BB as 🎁 BlindBox
    participant NFT as 🎨 GenesisMecha

    Note over U,NFT: 🚀 开盲盒完整流程

    %% 1. 获取 GEM 代币
    rect rgb(255, 240, 200)
        Note over U,UNI: 💰 获取 GEM 代币 (如果余额不足)
        U->>UI: 点击"获取 GEM"
        UI->>W: 发起 Uniswap 交换
        W->>UNI: swapExactETHForTokens()
        UNI-->>W: 返回 GEM 代币
        W-->>U: 余额更新
    end

    %% 2. 授权 GEM 代币
    rect rgb(230, 255, 230)
        Note over U,GEM: ✅ 授权 GEM 代币
        U->>UI: 点击"授权"
        UI->>W: 发起授权交易
        W->>GEM: approve(BlindBox, amount)
        GEM-->>W: 授权成功
        W-->>UI: 交易确认
        UI-->>U: 显示授权成功
    end

    %% 3. 购买盲盒
    rect rgb(240, 230, 255)
        Note over U,NFT: 🎁 购买盲盒并铸造 NFT
        U->>UI: 点击"购买盲盒"
        UI->>W: 发起购买交易
        W->>BB: purchaseBlindBox(amount)

        BB->>GEM: transferFrom(user, contract, price)
        GEM-->>BB: 转账成功

        BB->>BB: 生成随机元数据索引

        BB->>NFT: mint(user, tokenId)
        NFT-->>BB: 铸造成功

        BB->>NFT: setTokenURI(tokenId, metadataURI)
        NFT-->>BB: 元数据设置成功

        BB-->>W: 发送 BlindBoxPurchased 事件
        W-->>UI: 交易确认
        UI-->>U: 显示 NFT 获得成功
    end

    %% 4. 查看结果
    rect rgb(255, 245, 245)
        Note over U,NFT: 🎉 查看获得的 NFT
        U->>UI: 查看我的 NFT
        UI->>NFT: tokenURI(tokenId)
        NFT-->>UI: 返回元数据 URI
        UI->>UI: 获取元数据内容
        UI-->>U: 显示 NFT 详情
    end
```

## 🛠️ 部署指南

### 🏠 本地部署

详见[快速开始](#-快速开始)部分

### 🌐 测试网部署 (Sepolia)

#### 1. 配置环境变量

```bash
# contractv3/.env
SEPOLIA_URL=https://sepolia.infura.io/v3/your-key
PRIVATE_KEY=your-private-key
ETHERSCAN_API_KEY=your-etherscan-key
MECHA_BASE_URI=https://your-cdn.com/metadata/
```

#### 2. 部署合约

```bash
cd contractv3
npx hardhat ignition deploy ignition/modules/GenesisNFT.ts --network sepolia
```

#### 3. 配置前端

```bash
# frontend/.env.sepolia
NEXT_PUBLIC_GEM_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_GENESIS_MECHA_ADDRESS=0x...
NEXT_PUBLIC_BLIND_BOX_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
```

#### 4. 启动前端

```bash
cd frontend
yarn dev:sepolia
```

### 🚀 生产部署

#### 合约部署
- 使用主网RPC配置
- 确保充足的ETH余额支付Gas费
- 验证合约代码

#### 前端部署
- 推荐使用Vercel部署
- 配置生产环境变量
- 设置自定义域名

## 📊 技术栈

### 🔗 智能合约
- **Hardhat v3**: 现代化以太坊开发框架
- **Hardhat Ignition**: 声明式部署系统
- **OpenZeppelin**: 安全的智能合约库
- **viem v2**: TypeScript以太坊库

### 🎨 前端应用
- **Next.js 15**: React全栈框架
- **React 19**: 用户界面库
- **Wagmi**: React Hooks for Ethereum
- **RainbowKit**: 钱包连接组件
- **Tailwind CSS**: 实用优先的CSS框架

## 📖 详细文档

- **[合约文档](./contractv3/README.md)**: 智能合约详细说明
- **[前端文档](./frontend/README.md)**: 前端应用开发指南
- **[元数据文档](./metadata-examples/README.md)**: NFT元数据规范
- **[交互流程图](./doc/用户交互流程图.md)**: 用户操作流程
- **[合约交互图](./doc/合约交互时序图.md)**: 合约调用序列

## 🆘 故障排除

### 常见问题

1. **合约部署失败**: 检查网络配置和账户余额
2. **前端连接失败**: 确认合约地址配置正确
3. **钱包连接问题**: 检查网络ID是否匹配
4. **交易失败**: 确认Gas费设置和代币余额

### 获取帮助

- 查看详细文档
- 检查控制台错误信息
- 验证环境变量配置
- 确认网络连接状态

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

**🎮 开启你的创世纪机甲之旅！**

[🎯 在线演示](https://genesis-nft-blindbox.vercel.app) | [📖 详细流程图](./doc/) | [🎨 NFT元数据](./metadata-examples/)

</div>
