'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { StorySection } from '@/components/StorySection';
import { RaritySection } from '@/components/RaritySection';
import { ContractInfo } from '@/components/ContractInfo';
import { MintNFT } from '@/components/MintNFT';
import { SwapGEMV2 } from '@/components/SwapGEMV2';
import NFTGallery from '@/components/NFTGallery';
import { Leaderboard } from '@/components/Leaderboard';
import { ClientOnly } from '@/components/ClientOnly';
import { scrollToElementWithOffset } from '@/utils/layout';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);

    // 对于特殊页面，直接切换不滚动
    if (['gallery', 'leaderboard'].includes(sectionId)) {
      return;
    }

    // 使用带偏移的滚动函数
    scrollToElementWithOffset(sectionId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'gallery':
        return <NFTGallery />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'mint':
      case 'swap':
        return (
          <>
            {/* Main Content */}
            <main className="container mx-auto px-4 pt-32 pb-8">
              {/* Contract Information */}
              <section className="mb-16">
                <ClientOnly fallback={
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                }>
                  <ContractInfo />
                </ClientOnly>
              </section>

              {/* Mint and Swap Section */}
              <section id="mint" className="mb-16">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      开始你的机甲之旅
                    </span>
                  </h2>
                  <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                    获取GEM代币并铸造你的专属Genesis Mecha NFT
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ClientOnly fallback={
                    <div className="bg-gray-800 rounded-lg p-8 text-center">
                      <h2 className="text-2xl font-bold text-white mb-4">铸造 Genesis Mecha NFT</h2>
                      <p className="text-gray-400 mb-6">加载中...</p>
                      <div className="w-32 h-32 mx-auto bg-gray-700 rounded-lg flex items-center justify-center text-4xl animate-pulse">
                        ⏳
                      </div>
                    </div>
                  }>
                    <MintNFT />
                  </ClientOnly>

                  <section id="swap">
                    <ClientOnly fallback={
                      <div className="bg-gray-800 rounded-lg p-6">
                        <div className="animate-pulse">
                          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                          <div className="h-20 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    }>
                      <SwapGEMV2 />
                    </ClientOnly>
                  </section>
                </div>
              </section>

              {/* Info Section */}
              <section className="mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      📖 <span>如何使用</span>
                    </h3>
                    <div className="space-y-4 text-gray-300">
                      <div className="flex items-start gap-4">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <span>连接你的钱包（MetaMask等）</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <span>使用ETH兑换GEM代币</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <span>授权合约使用你的GEM代币</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                        <span>选择铸造数量并确认交易</span>
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                        <span>等待交易确认，获得你的NFT！</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      ⚠️ <span>重要提示</span>
                    </h3>
                    <div className="space-y-3 text-gray-300">
                      <p className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>每次铸造最多可以获得10个NFT</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>铸造是随机的，每个NFT都是独特的</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>请确保网络设置为Sepolia测试网</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>交易确认后NFT将自动转入你的钱包</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>铸造完成后可在OpenSea等平台查看</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      🎁 <span>特殊奖励</span>
                    </h3>
                    <div className="space-y-3 text-gray-300">
                      <p className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>前3名铸造者将获得特殊徽章</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>批量铸造可能获得稀有属性加成</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>持有多个NFT可参与未来治理投票</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>稀有机甲拥有独特的视觉效果</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </>
        );
      default:
        return (
          <>
            {/* Hero Section */}
            <section id="home">
              <HeroSection onMintClick={() => scrollToSection('mint')} />
            </section>

            {/* Story Section */}
            <StorySection />

            {/* Rarity Section */}
            <RaritySection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
      {/* Header */}
      <Header
        activeSection={activeSection}
        onSectionChange={scrollToSection}
      />

      {/* Dynamic Content */}
      {renderContent()}



      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-white">G</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Genesis Mecha
                  </h3>
                  <p className="text-xs text-gray-400">NFT BlindBox Collection</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                探索未来世界的机械战士，每个NFT都是独一无二的战斗伙伴。加入Genesis Mecha宇宙，开启你的机甲收藏之旅。
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4">快速链接</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('home')} className="block text-gray-400 hover:text-white transition-colors">首页</button>
                <button onClick={() => scrollToSection('mint')} className="block text-gray-400 hover:text-white transition-colors">铸造</button>
                <button onClick={() => scrollToSection('gallery')} className="block text-gray-400 hover:text-white transition-colors">收藏</button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-white font-bold mb-4">社区</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">GitHub</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 Genesis Mecha. Built with ❤️ using Next.js, RainbowKit, wagmi, and Hardhat
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">Powered by</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Sepolia Testnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}