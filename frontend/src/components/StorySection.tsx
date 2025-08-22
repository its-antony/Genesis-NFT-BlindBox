'use client';

import { useState, useEffect } from 'react';
import { storyData, quotes } from '@/data/story';

export function StorySection() {
  const [mounted, setMounted] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [activeTab, setActiveTab] = useState('story');

  useEffect(() => {
    setMounted(true);
    
    // 轮播名言
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const tabs = [
    { id: 'story', name: '背景故事', icon: '📖' },
    { id: 'world', name: '世界设定', icon: '🌍' },
    { id: 'mechas', name: '机甲类型', icon: '🤖' },
    { id: 'rarity', name: '稀有度', icon: '💎' }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* 标题和名言 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {storyData.title}
            </span>
          </h2>
          
          {/* 轮播名言 */}
          <div className="relative h-16 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000">
              <p className="text-xl text-gray-300 italic max-w-2xl">
                {quotes[currentQuote]}
              </p>
            </div>
          </div>
        </div>

        {/* 选项卡导航 */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="max-w-6xl mx-auto">
          {/* 背景故事 */}
          {activeTab === 'story' && (
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                📖 <span>{storyData.mainStory.title}</span>
              </h3>
              <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                {storyData.mainStory.content}
              </div>
            </div>
          )}

          {/* 世界设定 */}
          {activeTab === 'world' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                🌍 <span>{storyData.worldSetting.title}</span>
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {storyData.worldSetting.locations.map((location, index) => (
                  <div key={index} className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h4 className="text-xl font-bold text-blue-400 mb-3">{location.name}</h4>
                    <p className="text-gray-300 leading-relaxed">{location.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 机甲类型 */}
          {activeTab === 'mechas' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                🤖 <span>{storyData.mechaTypes.title}</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {storyData.mechaTypes.types.map((type, index) => (
                  <div key={index} className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{type.icon}</span>
                      <div>
                        <h4 className="text-xl font-bold text-purple-400">{type.name}</h4>
                        <span className="text-sm text-gray-400">{type.specialty}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 稀有度 */}
          {activeTab === 'rarity' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                💎 <span>{storyData.rarityLore.title}</span>
              </h3>
              <div className="space-y-4">
                {storyData.rarityLore.rarities.map((rarity, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: rarity.color }}
                        ></div>
                        <h4 className="text-xl font-bold text-white">{rarity.name}</h4>
                        <span className="text-sm text-gray-400">({rarity.count}个)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">稀有度</div>
                        <div className="text-lg font-bold" style={{ color: rarity.color }}>
                          {rarity.name}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{rarity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 核心特性 */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
            ⭐ <span>{storyData.features.title}</span>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storyData.features.items.map((feature, index) => (
              <div key={index} className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 text-center hover:border-gray-600/50 transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
