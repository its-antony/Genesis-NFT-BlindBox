// NFT元数据配置
// 这里配置每个tokenId对应的元数据URL

export interface MetadataConfig {
  [tokenId: string]: {
    url: string;
    source: 'ipfs' | 'local';
    description?: string;
  };
}

// 元数据URL配置
export const METADATA_CONFIG: MetadataConfig = {
  // TokenId 1 使用IPFS
  '1': {
    url: 'https://gateway.pinata.cloud/ipfs/bafkreihfejzr5kz7y2rp224tzrh6fc4ykesg2zcn5dnvpbdgpxxslh2nh4',
    source: 'ipfs',
    description: '创世机甲 #001 - 存储在IPFS上的元数据'
  },
  
  // 其他tokenId使用本地文件（可以逐步迁移到IPFS）
  '2': {
    url: '/metadata-examples/2.json',
    source: 'local',
    description: '创世机甲 #002 - 本地元数据文件'
  },
  
  '3': {
    url: '/metadata-examples/3.json',
    source: 'local',
    description: '创世机甲 #003 - 本地元数据文件'
  },
  
  '4': {
    url: '/metadata-examples/4.json',
    source: 'local',
    description: '创世机甲 #004 - 本地元数据文件'
  },
  
  '5': {
    url: '/metadata-examples/5.json',
    source: 'local',
    description: '创世机甲 #005 - 本地元数据文件'
  },
  
  '6': {
    url: '/metadata-examples/6.json',
    source: 'local',
    description: '创世机甲 #006 - 本地元数据文件'
  },
  
  '7': {
    url: '/metadata-examples/7.json',
    source: 'local',
    description: '创世机甲 #007 - 本地元数据文件'
  },
  
  '8': {
    url: '/metadata-examples/8.json',
    source: 'local',
    description: '创世机甲 #008 - 本地元数据文件'
  },
  
  '9': {
    url: '/metadata-examples/9.json',
    source: 'local',
    description: '创世机甲 #009 - 本地元数据文件'
  },
  
  '10': {
    url: '/metadata-examples/10.json',
    source: 'local',
    description: '创世机甲 #010 - 本地元数据文件'
  },
  
  '11': {
    url: '/metadata-examples/11.json',
    source: 'local',
    description: '创世机甲 #011 - 本地元数据文件'
  },
  
  '12': {
    url: '/metadata-examples/12.json',
    source: 'local',
    description: '创世机甲 #012 - 本地元数据文件'
  },
  
  '13': {
    url: '/metadata-examples/13.json',
    source: 'local',
    description: '创世机甲 #013 - 本地元数据文件'
  },
  
  '14': {
    url: '/metadata-examples/14.json',
    source: 'local',
    description: '创世机甲 #014 - 本地元数据文件'
  },
  
  '15': {
    url: '/metadata-examples/15.json',
    source: 'local',
    description: '创世机甲 #015 - 本地元数据文件'
  },
  
  '16': {
    url: '/metadata-examples/16.json',
    source: 'local',
    description: '创世机甲 #016 - 本地元数据文件'
  },
  
  '17': {
    url: '/metadata-examples/17.json',
    source: 'local',
    description: '创世机甲 #017 - 本地元数据文件'
  },
  
  '18': {
    url: '/metadata-examples/18.json',
    source: 'local',
    description: '创世机甲 #018 - 本地元数据文件'
  },
  
  '19': {
    url: '/metadata-examples/19.json',
    source: 'local',
    description: '创世机甲 #019 - 本地元数据文件'
  },
  
  '20': {
    url: '/metadata-examples/20.json',
    source: 'local',
    description: '创世机甲 #020 - 本地元数据文件'
  }
};

// 获取指定tokenId的元数据URL
export function getMetadataUrl(tokenId: string): string {
  const config = METADATA_CONFIG[tokenId];
  if (config) {
    return config.url;
  }
  
  // 如果没有配置，使用默认的本地文件路径
  return `/metadata-examples/${tokenId}.json`;
}

// 获取元数据来源信息
export function getMetadataSource(tokenId: string): 'ipfs' | 'local' {
  const config = METADATA_CONFIG[tokenId];
  return config?.source || 'local';
}

// 获取所有IPFS存储的tokenId列表
export function getIpfsTokenIds(): string[] {
  return Object.keys(METADATA_CONFIG).filter(
    tokenId => METADATA_CONFIG[tokenId].source === 'ipfs'
  );
}

// 获取所有本地存储的tokenId列表
export function getLocalTokenIds(): string[] {
  return Object.keys(METADATA_CONFIG).filter(
    tokenId => METADATA_CONFIG[tokenId].source === 'local'
  );
}

// 统计信息
export function getMetadataStats() {
  const ipfsCount = getIpfsTokenIds().length;
  const localCount = getLocalTokenIds().length;
  const totalCount = Object.keys(METADATA_CONFIG).length;
  
  return {
    total: totalCount,
    ipfs: ipfsCount,
    local: localCount,
    ipfsPercentage: Math.round((ipfsCount / totalCount) * 100),
    localPercentage: Math.round((localCount / totalCount) * 100)
  };
}
