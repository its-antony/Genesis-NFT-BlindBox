'use client';

import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';

interface HeroSectionProps {
  onMintClick?: () => void;
}

export function HeroSection({ onMintClick }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // 自动轮播
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  // 获取合约统计数据
  const { data: totalSupply } = useReadContract({
    address: process.env.NEXT_PUBLIC_GENESIS_MECHA_ADDRESS as `0x${string}`,
    abi: [
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'totalSupply',
    query: {
      enabled: !!process.env.NEXT_PUBLIC_GENESIS_MECHA_ADDRESS,
    },
  });

  const { data: maxSupply } = useReadContract({
    address: process.env.NEXT_PUBLIC_GENESIS_MECHA_ADDRESS as `0x${string}`,
    abi: [
      {
        "inputs": [],
        "name": "MAX_SUPPLY",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'MAX_SUPPLY',
    query: {
      enabled: !!process.env.NEXT_PUBLIC_GENESIS_MECHA_ADDRESS,
    },
  });

  // 获取铸造价格
  const { data: mintPrice } = useReadContract({
    address: process.env.NEXT_PUBLIC_BLIND_BOX_ADDRESS as `0x${string}`,
    abi: [
      {
        "inputs": [],
        "name": "mintPrice",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'mintPrice',
    query: {
      enabled: !!process.env.NEXT_PUBLIC_BLIND_BOX_ADDRESS,
    },
  });

  const slides = [
    {
      title: "Genesis Mecha",
      subtitle: "机甲纪元的开端",
      description: "探索未来世界的机械战士，每个NFT都是独一无二的战斗伙伴",
      image: "🤖",
    },
    {
      title: "稀有收藏",
      subtitle: "传说级机甲等你发现",
      description: "从普通到传说，四种稀有度等级，每次开盒都是惊喜",
      image: "⚡",
    },
    {
      title: "盲盒机制",
      subtitle: "神秘的开盒体验",
      description: "使用GEM代币开启神秘盲盒，获得随机稀有度的机甲NFT",
      image: "📦",
    },
  ];

  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 animate-pulse"></div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900"></div>
      
      {/* 动态背景粒子 */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左侧内容 */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-4">
                🚀 Genesis Collection
              </span>
              
              <h1 className="text-5xl lg:text-7xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {slides[currentSlide].title}
                </span>
              </h1>
              
              <h2 className="text-2xl lg:text-3xl text-gray-300 mb-6 font-light">
                {slides[currentSlide].subtitle}
              </h2>
              
              <p className="text-lg text-gray-400 mb-8 max-w-2xl">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {totalSupply ? totalSupply.toString() : '0'}
                </div>
                <div className="text-sm text-gray-400">已铸造</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {maxSupply ? maxSupply.toString() : '20'}
                </div>
                <div className="text-sm text-gray-400">总供应量</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {mintPrice ? (Number(mintPrice) / 1000000).toString() : '100'}
                </div>
                <div className="text-sm text-gray-400">GEM价格</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">4</div>
                <div className="text-sm text-gray-400">稀有度</div>
              </div>
            </div>

            {/* CTA按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onMintClick}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                🎲 开始铸造
              </button>
              
              <button className="px-8 py-4 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium rounded-xl transition-all duration-300 hover:bg-gray-800/50">
                📖 了解更多
              </button>
            </div>
          </div>

          {/* 右侧视觉 */}
          <div className="relative">
            <div className="relative w-full max-w-md mx-auto">
              {/* 主要图标 */}
              <div className="text-center">
                <div className="text-9xl mb-4 animate-bounce">
                  {slides[currentSlide].image}
                </div>
              </div>

              {/* 环绕效果 */}
              <div className="absolute inset-0 -m-8">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    style={{
                      left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                      top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                      animation: `spin ${8 + i}s linear infinite`,
                    }}
                  />
                ))}
              </div>

              {/* 发光效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>

        {/* 轮播指示器 */}
        <div className="flex justify-center mt-12 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 底部渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
    </section>
  );
}
