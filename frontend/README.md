# 🎨 Genesis NFT BlindBox - 前端应用

> 创世机甲NFT盲盒前端应用 - 现代化Web3用户界面

## 🎯 应用概述

Genesis NFT BlindBox前端是一个基于Next.js 15的现代化Web3应用，为用户提供完整的NFT盲盒体验。

### ✨ 功能特性

- **🔗 钱包集成**: 支持MetaMask等主流钱包
- **🎲 NFT铸造**: 单个和批量铸造功能
- **💱 代币交换**: Uniswap V2集成的ETH↔GEM交换
- **🖼️ NFT展示**: 高级过滤和排序的收藏展示
- **📱 响应式设计**: 完美适配桌面和移动设备
- **🌐 多网络支持**: 本地、Sepolia测试网

### 🎨 用户界面

- **🏠 首页**: 项目介绍和快速开始
- **🎲 铸造页面**: 实时价格和铸造功能
- **🖼️ 收藏页面**: NFT展示和管理
- **💱 交换页面**: ETH和GEM代币交换
- **📖 故事页面**: 创世机甲背景故事

## 🛠️ 技术栈

### 核心框架
- **Next.js 15**: React全栈框架
- **React 19**: 用户界面库
- **TypeScript**: 类型安全的JavaScript

### Web3集成
- **Wagmi**: React Hooks for Ethereum
- **Viem**: TypeScript Ethereum库
- **RainbowKit**: 钱包连接组件

### 样式和UI
- **Tailwind CSS**: 实用优先的CSS框架
- **Headless UI**: 无样式UI组件
- **React Hot Toast**: 通知组件

### 开发工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **dotenv-cli**: 环境变量管理

## 🚀 开发指南

### 📋 环境要求

- **Node.js**: >= 18.0.0
- **npm/yarn**: 最新版本
- **Git**: 版本控制

### 🔧 安装步骤

```bash
# 进入前端目录
cd frontend

# 安装依赖 (推荐使用yarn)
yarn install --ignore-engines

# 或使用npm
npm install --registry=https://registry.npmmirror.com
```

### 🌐 环境配置

#### 本地开发环境

```bash
# 使用本地环境
yarn dev:local

# 或
npm run dev:local
```

#### Sepolia测试网环境

```bash
# 使用Sepolia测试网
yarn dev:sepolia

# 或
npm run dev:sepolia
```

### 📁 项目结构

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 首页
│   │   ├── mint/              # 铸造页面
│   │   ├── collection/        # 收藏页面
│   │   ├── swap/              # 交换页面
│   │   └── layout.tsx         # 根布局
│   ├── components/            # React组件
│   │   ├── SwapGEMV2.tsx     # V2交换组件
│   │   ├── MintBlindBox.tsx  # 铸造组件
│   │   ├── NFTCard.tsx       # NFT卡片
│   │   └── WalletConnect.tsx # 钱包连接
│   ├── hooks/                 # 自定义Hooks
│   │   ├── useUniswapV2Price.ts # V2价格查询
│   │   ├── useNFTCollection.ts  # NFT收藏
│   │   └── useContractRead.ts   # 合约读取
│   ├── config/               # 配置文件
│   │   ├── wagmi.ts         # Wagmi配置
│   │   ├── contracts.ts     # 合约配置
│   │   └── networks.ts      # 网络配置
│   └── data/                # 静态数据
│       ├── mechaStories.ts  # 机甲故事
│       └── rarityData.ts    # 稀有度数据
├── public/                  # 静态资源
│   ├── images/             # 图片资源
│   └── metadata/           # NFT元数据
├── .env.local              # 本地环境变量
├── .env.sepolia           # Sepolia环境变量
└── package.json           # 项目配置
```

## 🔧 配置说明

### 环境变量

#### .env.sepolia (Sepolia测试网)
```bash
# 合约地址
NEXT_PUBLIC_GEM_TOKEN_ADDRESS=0xe59E7f631DCf9cD76119252c3aAD396bE48F31af
NEXT_PUBLIC_GENESIS_MECHA_ADDRESS=0x81b69A8d41345DBdb9eCee61d0eBB3921db39D66
NEXT_PUBLIC_BLIND_BOX_ADDRESS=0xd7208262e716586661F19893Ab457C5De4a209DF

# Uniswap V2配置
NEXT_PUBLIC_UNISWAP_V2_ROUTER=0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3
NEXT_PUBLIC_UNISWAP_V2_FACTORY=0xF62c03E08ada871A0bEb309762E260a7a6a880E6
NEXT_PUBLIC_WETH_ADDRESS=0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14

# 网络配置
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

#### .env.local (本地开发)
```bash
# 本地合约地址 (部署后自动生成)
NEXT_PUBLIC_GEM_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_GENESIS_MECHA_ADDRESS=0x...
NEXT_PUBLIC_BLIND_BOX_ADDRESS=0x...

# 本地网络
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

### 钱包配置

应用支持以下钱包：
- **MetaMask**: 主要推荐钱包
- **WalletConnect**: 移动端钱包
- **Coinbase Wallet**: 备选钱包
- **Rainbow**: 移动优先钱包

## 📱 功能模块

### 🔗 钱包连接模块

```typescript
// 使用RainbowKit连接钱包
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnect() {
  return <ConnectButton />;
}
```

### 🎲 NFT铸造模块

**特性**:
- 实时价格显示
- 余额和授权检查
- 单个/批量铸造
- 交易状态跟踪
- 错误处理和重试

**使用示例**:
```typescript
import { MintBlindBox } from '@/components/MintBlindBox';

export default function MintPage() {
  return <MintBlindBox />;
}
```

### 💱 代币交换模块

**特性**:
- Uniswap V2集成
- 实时价格计算
- 智能滑点保护
- 交易预览
- 一键交换

**使用示例**:
```typescript
import { SwapGEMV2 } from '@/components/SwapGEMV2';

export default function SwapPage() {
  return <SwapGEMV2 />;
}
```

### 🖼️ NFT收藏模块

**特性**:
- 网格/列表视图
- 稀有度过滤
- 属性排序
- 搜索功能
- 详情弹窗

## 🎨 UI/UX设计

### 设计系统

**颜色方案**:
```css
/* 主色调 */
--primary: #3B82F6;      /* 蓝色 */
--secondary: #8B5CF6;    /* 紫色 */
--accent: #F59E0B;       /* 橙色 */

/* 背景色 */
--bg-primary: #111827;   /* 深灰 */
--bg-secondary: #1F2937; /* 中灰 */
--bg-tertiary: #374151;  /* 浅灰 */

/* 文字色 */
--text-primary: #F9FAFB;   /* 白色 */
--text-secondary: #D1D5DB; /* 浅灰 */
--text-muted: #9CA3AF;     /* 中灰 */
```

**组件库**:
- 按钮: 多种样式和状态
- 卡片: 统一的阴影和圆角
- 表单: 一致的输入框样式
- 模态框: 居中和动画效果

### 响应式设计

```css
/* 断点设置 */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板 */
lg: 1024px  /* 小桌面 */
xl: 1280px  /* 大桌面 */
2xl: 1536px /* 超大屏 */
```

**适配策略**:
- 移动优先设计
- 弹性网格布局
- 自适应图片
- 触摸友好的交互

## 🧪 开发命令

### 开发服务器
```bash
yarn dev:local          # 本地开发
yarn dev:sepolia        # Sepolia测试网
yarn dev                # 默认开发模式
```

### 构建和部署
```bash
yarn build              # 生产构建
yarn start              # 启动生产服务器
yarn lint               # 代码检查
yarn lint:fix           # 自动修复
```

### 类型检查
```bash
yarn type-check         # TypeScript类型检查
```

## 🔍 调试和测试

### 开发者工具

1. **React DevTools**: 组件调试
2. **Redux DevTools**: 状态管理调试
3. **Network Tab**: 网络请求监控
4. **Console**: 错误和日志查看

### 常见问题解决

**钱包连接问题**:
```bash
# 清除浏览器缓存
# 检查网络配置
# 确认钱包已解锁
```

**交易失败**:
```bash
# 检查Gas费设置
# 确认代币余额
# 验证合约地址
```

**页面加载慢**:
```bash
# 检查网络连接
# 优化图片资源
# 使用CDN加速
```

## 🚀 部署指南

### Vercel部署 (推荐)

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到Vercel
vercel --prod
```

### 自定义部署

```bash
# 构建项目
yarn build

# 启动生产服务器
yarn start
```

### 环境变量配置

在部署平台设置以下环境变量：
- `NEXT_PUBLIC_*`: 所有公开的环境变量
- `NEXTAUTH_SECRET`: 认证密钥 (如果使用)
- `DATABASE_URL`: 数据库连接 (如果使用)

## 📊 性能优化

### 代码分割
- 路由级别的代码分割
- 组件懒加载
- 第三方库按需加载

### 图片优化
- Next.js Image组件
- WebP格式支持
- 响应式图片

### 缓存策略
- 静态资源缓存
- API响应缓存
- 浏览器缓存

## 🤝 贡献指南

### 开发规范

**代码风格**:
- 使用TypeScript
- 遵循ESLint规则
- 使用Prettier格式化

**组件规范**:
- 函数式组件
- 自定义Hooks
- Props类型定义

**提交规范**:
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 样式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

## 📞 技术支持

- **文档**: [项目Wiki](../docs)
- **问题**: [GitHub Issues](https://github.com/web3pass-official/genesis-nft-blindbox/issues)
- **社区**: [Discord](https://discord.gg/web3pass)

---

<div align="center">

**🎨 现代化Web3用户体验！**

[🎯 在线演示](https://genesis-nft-blindbox.vercel.app) | [📖 组件文档](./docs/components.md) | [🎨 设计系统](./docs/design-system.md)

</div>
