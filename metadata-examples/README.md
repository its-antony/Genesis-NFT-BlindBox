# Genesis NFT BlindBox - 示例元数据

## 📋 文件概览

本目录包含20个Genesis Mecha NFT的示例元数据JSON文件，按照公平揭示系统的要求准备。

### 📁 文件结构
```
metadata-examples/
├── 1.json - 20.json     # 20个NFT的元数据文件
├── common/              # 旧的按稀有度分类示例（可删除）
├── rare/                # 旧的按稀有度分类示例（可删除）
├── legendary/           # 旧的按稀有度分类示例（可删除）
└── README.md           # 本说明文件
```

## 🎯 稀有度分布

### 总计20个NFT，稀有度分布如下：

| 稀有度 | 数量 | 文件编号 | 比例 |
|--------|------|----------|------|
| **Legendary** | 1个 | #1 | 5% |
| **Epic** | 3个 | #2, #3, #4 | 15% |
| **Rare** | 5个 | #5, #6, #7, #8, #9 | 25% |
| **Common** | 11个 | #10-#20 | 55% |

## 🎨 元数据特点

### Legendary (#1) - Omega Prime
- 最高稀有度，独一无二
- 包含动画URL和特殊效果
- 最高属性值 (Power Level: 100)
- 特殊能力：Dimensional Phase

### Epic (#2-#4)
- **#2 Crimson Destroyer**: 破坏型，实验性等离子武器
- **#3 Azure Tempest**: 风暴控制，电磁场操控
- **#4 Void Stalker**: 隐形刺客，维度斗篷
- 包含动画和特殊效果
- 高属性值 (Power Level: 85-92)

### Rare (#5-#9)
- **#5 Iron Guardian**: 防御型，能量护盾
- **#6 Flame Striker**: 火焰攻击，热能武器
- **#7 Frost Warden**: 冰霜控制，冰墙防护
- **#8 Wind Dancer**: 高速机动，音速冲刺
- **#9 Earth Shaker**: 地震操控，震动锤
- 中等属性值 (Power Level: 70-78)
- 包含特殊效果

### Common (#10-#20)
- 标准生产线机甲
- 基础属性值 (Power Level: 49-58)
- 可靠的战斗性能
- 无特殊效果

## 📝 JSON格式说明

每个JSON文件包含以下标准字段：

```json
{
  "name": "NFT名称",
  "description": "详细描述",
  "image": "图片URL",
  "external_url": "外部链接",
  "attributes": [
    {"trait_type": "Rarity", "value": "稀有度"},
    {"trait_type": "Power Level", "value": 数值},
    // ... 其他属性
  ],
  "properties": {
    "category": "Mecha",
    "rarity_rank": 稀有度等级,
    "total_supply": 20
  }
}
```

## 🚀 使用方法

### 1. 上传到IPFS或CDN
```bash
# 上传整个目录到IPFS
ipfs add -r metadata-examples/

# 或上传到你的CDN
# 确保文件可通过 https://your-cdn.com/metadata/1.json 访问
```

### 2. 设置合约BaseURI
```bash
export GENESIS_MECHA_ADDRESS="0x..."
export MECHA_BASE_URI="https://your-cdn.com/metadata/"
npx hardhat run scripts/setupMetadata.js --network sepolia
```

### 3. 验证访问
```bash
# 测试URL是否可访问
curl https://your-cdn.com/metadata/1.json
curl https://your-cdn.com/metadata/20.json
```

## 🎭 公平揭示流程

1. **铸造阶段**: 用户铸造时看到占位URI
2. **售罄后**: 管理员调用 `reveal()` 生成随机偏移
3. **揭示后**: tokenURI 按随机映射返回真实元数据
   - 例如：Token #5 可能映射到 14.json
   - 映射公式：`index = ((tokenId + startingIndex - 2) % 20) + 1`

## 📊 属性说明

### 核心属性
- **Rarity**: 稀有度等级
- **Power Level**: 综合战力 (49-100)
- **Speed**: 速度 (45-98)
- **Defense**: 防御 (45-98)
- **Attack**: 攻击 (45-100)

### 装备属性
- **Type**: 机甲类型 (Standard/Guardian/Assault等)
- **Armor**: 装甲类型
- **Weapon**: 武器系统
- **Special Ability**: 特殊能力 (仅Rare以上)

### 视觉效果
- **Color Scheme**: 配色方案
- **Special Effects**: 特殊效果 (仅Rare以上)
- **Animation**: 动画效果 (仅Epic以上)

## ⚠️ 注意事项

1. **图片资源**: 需要单独准备20张机甲图片，命名为1.png-20.png
2. **动画资源**: Epic和Legendary需要准备MP4动画文件
3. **URL一致性**: 确保image和animation_url的域名与baseURI一致
4. **CORS设置**: 如果使用CDN，确保设置正确的CORS头
5. **备份**: 保留元数据文件的备份，避免丢失

## 🔗 相关链接

- [OpenSea元数据标准](https://docs.opensea.io/docs/metadata-standards)
- [ERC721元数据扩展](https://eips.ethereum.org/EIPS/eip-721)
- [IPFS文档](https://docs.ipfs.io/)

现在你有了完整的20个NFT元数据文件，可以直接用于生产环境！🎮✨
