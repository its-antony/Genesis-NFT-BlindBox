# 🚀 Vercel部署指南

本文档详细介绍如何将Genesis NFT BlindBox前端应用部署到Vercel平台。

## 📋 部署前准备

### 环境要求
- Node.js >= 22.0.0
- Yarn 包管理器
- GitHub账户
- Vercel账户

### 合约部署
确保智能合约已部署到Sepolia测试网，并获得以下合约地址：
- GEM Token合约地址
- Genesis Mecha NFT合约地址  
- BlindBox合约地址
- Uniswap V2相关合约地址

## 🌐 方法一：Vercel CLI部署

### 1. 安装Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录Vercel
```bash
vercel login
```

### 3. 进入前端目录
```bash
cd frontend
```

### 4. 执行部署
```bash
vercel --prod
```

### 5. 配置构建设置
在部署过程中，按提示配置：

```
? Set up and deploy "frontend"? [Y/n] Y
? Which scope do you want to deploy to? [选择您的账户]
? Link to existing project? [N/y] N
? What's your project's name? genesis-nft-blindbox
? In which directory is your code located? ./
? Want to modify these settings? [y/N] Y
```

**重要配置项：**
- **Build Command**: `yarn build:sepolia`
- **Output Directory**: `.next`
- **Install Command**: `yarn install --ignore-engines`

## 🖥️ 方法二：Vercel Dashboard部署

### 1. 连接GitHub仓库

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **"New Project"**
3. 选择 **"Import Git Repository"**
4. 选择您的 `Genesis-NFT-BlindBox` 仓库
5. 点击 **"Import"**

### 2. 配置项目设置

在项目配置页面设置：

```yaml
Framework Preset: Next.js
Root Directory: frontend
Build Command: yarn build:sepolia
Output Directory: .next
Install Command: yarn install --ignore-engines
Node.js Version: 22.x
```

### 3. 设置环境变量

在 **Project Settings** → **Environment Variables** 中添加：

```bash
# 合约地址 (Sepolia测试网)
NEXT_PUBLIC_GEM_TOKEN_ADDRESS=0xe59E7f631DCf9cD76119252c3aAD396bE48F31af
NEXT_PUBLIC_GENESIS_MECHA_ADDRESS=0x81b69A8d41345DBdb9eCee61d0eBB3921db39D66
NEXT_PUBLIC_BLIND_BOX_ADDRESS=0xd7208262e716586661F19893Ab457C5De4a209DF

# Uniswap V2合约地址 (Sepolia)
NEXT_PUBLIC_UNISWAP_V2_ROUTER=0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3
NEXT_PUBLIC_UNISWAP_V2_FACTORY=0xF62c03E08ada871A0bEb309762E260a7a6a880E6
NEXT_PUBLIC_WETH_ADDRESS=0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14

# 网络配置
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

**⚠️ 注意事项：**
- 所有环境变量必须以 `NEXT_PUBLIC_` 开头
- 替换 `YOUR_INFURA_PROJECT_ID` 为您的实际Infura项目ID
- 确保合约地址正确无误

### 4. 开始部署

1. 点击 **"Deploy"** 按钮
2. 等待构建完成（通常需要2-3分钟）
3. 部署成功后会显示访问URL

## 📊 配置详解

### 构建配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Framework Preset** | Next.js | 自动检测Next.js项目 |
| **Root Directory** | `frontend` | 指定前端代码所在目录 |
| **Build Command** | `yarn build:sepolia` | 使用Sepolia环境配置构建 |
| **Output Directory** | `.next` | Next.js默认构建输出目录 |
| **Install Command** | `yarn install --ignore-engines` | 忽略Node.js引擎版本检查 |
| **Node.js Version** | 22.x | Hardhat v3要求的Node.js版本 |

### 环境变量详解

| 变量名 | 用途 | 获取方式 |
|--------|------|----------|
| `NEXT_PUBLIC_GEM_TOKEN_ADDRESS` | GEM代币合约地址 | 合约部署后获得 |
| `NEXT_PUBLIC_GENESIS_MECHA_ADDRESS` | NFT合约地址 | 合约部署后获得 |
| `NEXT_PUBLIC_BLIND_BOX_ADDRESS` | 盲盒合约地址 | 合约部署后获得 |
| `NEXT_PUBLIC_UNISWAP_V2_ROUTER` | Uniswap V2路由合约 | Sepolia网络固定地址 |
| `NEXT_PUBLIC_UNISWAP_V2_FACTORY` | Uniswap V2工厂合约 | Sepolia网络固定地址 |
| `NEXT_PUBLIC_WETH_ADDRESS` | WETH代币地址 | Sepolia网络固定地址 |
| `NEXT_PUBLIC_CHAIN_ID` | 网络链ID | Sepolia: 11155111 |
| `NEXT_PUBLIC_RPC_URL` | RPC节点URL | Infura/Alchemy等服务商 |

## ✅ 部署验证

部署完成后，访问Vercel提供的URL，验证以下功能：

### 基础功能检查
- [ ] 页面正常加载，无404错误
- [ ] 样式和布局显示正确
- [ ] 控制台无严重错误信息

### Web3功能检查
- [ ] 钱包连接按钮正常显示
- [ ] 能够连接MetaMask等钱包
- [ ] 网络自动切换到Sepolia
- [ ] 合约地址显示正确

### 核心功能检查
- [ ] NFT展示功能正常
- [ ] 盲盒购买流程可用
- [ ] GEM代币交换功能正常
- [ ] 排行榜数据加载正常

## 🔄 自动部署

配置完成后，Vercel会自动监听GitHub仓库的变化：

- **主分支推送** → 自动触发生产环境部署
- **其他分支推送** → 创建预览部署
- **Pull Request** → 创建预览部署供测试

## 🛠️ 故障排除

### 常见问题及解决方案

#### 1. 构建失败 - TypeScript错误
```bash
# 本地测试构建
cd frontend
yarn build:sepolia

# 检查TypeScript错误
yarn type-check
```

#### 2. 环境变量未生效
- 确保变量名以 `NEXT_PUBLIC_` 开头
- 检查Vercel Dashboard中的环境变量设置
- 重新部署项目使变量生效

#### 3. 钱包连接失败
- 检查 `NEXT_PUBLIC_CHAIN_ID` 是否为 `11155111`
- 确认RPC URL可正常访问
- 验证钱包已添加Sepolia网络

#### 4. 合约交互失败
- 验证所有合约地址是否正确
- 确认合约已成功部署到Sepolia
- 检查合约ABI是否匹配

#### 5. 页面加载缓慢
- 检查RPC节点响应速度
- 考虑使用更快的RPC服务商
- 优化图片和资源加载

### 调试技巧

1. **查看构建日志**
   - 在Vercel Dashboard的Deployments页面查看详细日志

2. **本地复现问题**
   ```bash
   cd frontend
   yarn build:sepolia
   yarn start
   ```

3. **检查环境变量**
   ```bash
   # 在浏览器控制台执行
   console.log(process.env.NEXT_PUBLIC_CHAIN_ID)
   ```

## 🎯 性能优化建议

1. **启用Vercel Analytics**
   - 在项目设置中启用Analytics
   - 监控页面性能和用户行为

2. **配置自定义域名**
   - 在Project Settings → Domains中添加
   - 提升品牌形象和用户体验

3. **启用Edge Functions**
   - 利用Vercel的边缘计算能力
   - 提升全球访问速度

## 📞 获取支持

如果遇到部署问题，可以：

1. 查看 [Vercel官方文档](https://vercel.com/docs)
2. 检查项目的GitHub Issues
3. 联系项目维护者

---

🎉 **恭喜！您已成功将Genesis NFT BlindBox部署到Vercel！**
