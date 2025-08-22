'use client';

import { useState, useEffect } from 'react';

export function RaritySection() {
  const [mounted, setMounted] = useState(false);
  const [hoveredRarity, setHoveredRarity] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rarities = [
    {
      id: 'common',
      name: '普通',
      nameEn: 'Common',
      probability: 60,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'from-gray-500/20 to-gray-600/20',
      borderColor: 'border-gray-500/30',
      icon: '⚙️',
      description: '基础型机甲，适合新手驾驶员',
      features: ['标准装甲', '基础武器系统', '常规机动性'],
      count: 12,
    },
    {
      id: 'rare',
      name: '稀有',
      nameEn: 'Rare',
      probability: 25,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      icon: '🔷',
      description: '强化型机甲，拥有特殊能力',
      features: ['强化装甲', '改良武器', '提升机动性'],
      count: 5,
    },
    {
      id: 'epic',
      name: '史诗',
      nameEn: 'Epic',
      probability: 12,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      icon: '💎',
      description: '精英级机甲，战场上的王者',
      features: ['重型装甲', '高级武器系统', '超级机动性'],
      count: 3,
    },
    {
      id: 'legendary',
      name: '传说',
      nameEn: 'Legendary',
      probability: 3,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/30',
      icon: '👑',
      description: '传奇机甲，宇宙中的终极武器',
      features: ['神话装甲', '毁灭性武器', '瞬移能力'],
      count: 1,
    },
  ];

  if (!mounted) {
    return (
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-16 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              稀有度系统
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            每个Genesis Mecha都有不同的稀有度等级，稀有度越高，机甲的能力和价值就越强大
          </p>
        </div>

        {/* 稀有度卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {rarities.map((rarity) => (
            <div
              key={rarity.id}
              className={`relative group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                hoveredRarity === rarity.id ? 'z-10' : ''
              }`}
              onMouseEnter={() => setHoveredRarity(rarity.id)}
              onMouseLeave={() => setHoveredRarity(null)}
            >
              {/* 卡片背景 */}
              <div className={`
                relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500
                bg-gradient-to-br ${rarity.bgColor} ${rarity.borderColor}
                ${hoveredRarity === rarity.id ? 'shadow-2xl shadow-current/25' : 'shadow-lg'}
              `}>
                {/* 发光效果 */}
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-br ${rarity.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500
                `}></div>

                {/* 内容 */}
                <div className="relative z-10">
                  {/* 图标和概率 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{rarity.icon}</div>
                    <div className={`
                      px-3 py-1 rounded-full text-sm font-bold
                      bg-gradient-to-r ${rarity.color} text-white
                    `}>
                      {rarity.probability}%
                    </div>
                  </div>

                  {/* 名称 */}
                  <div className="mb-3">
                    <h3 className={`
                      text-2xl font-bold mb-1
                      bg-gradient-to-r ${rarity.color} bg-clip-text text-transparent
                    `}>
                      {rarity.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{rarity.nameEn}</p>
                  </div>

                  {/* 描述 */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {rarity.description}
                  </p>

                  {/* 特性列表 */}
                  <div className="space-y-2 mb-4">
                    {rarity.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-400">
                        <div className={`
                          w-2 h-2 rounded-full mr-2
                          bg-gradient-to-r ${rarity.color}
                        `}></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* 数量 */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">预计数量</span>
                    <span className="font-bold text-white">{rarity.count.toLocaleString()}</span>
                  </div>
                </div>

                {/* 悬停时的额外效果 */}
                {hoveredRarity === rarity.id && (
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm -z-10"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 概率分布图 */}
        <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-center mb-8 text-white">
            稀有度分布
          </h3>
          
          <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
            {rarities.map((rarity, index) => {
              const leftOffset = rarities.slice(0, index).reduce((sum, r) => sum + r.probability, 0);
              return (
                <div
                  key={rarity.id}
                  className={`
                    absolute top-0 h-full transition-all duration-1000 delay-${index * 200}
                    bg-gradient-to-r ${rarity.color}
                  `}
                  style={{
                    left: `${leftOffset}%`,
                    width: `${rarity.probability}%`,
                  }}
                  title={`${rarity.name}: ${rarity.probability}%`}
                />
              );
            })}
          </div>
          
          <div className="flex justify-between mt-4 text-sm text-gray-400">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
