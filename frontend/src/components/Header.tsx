'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WalletConnection } from './WalletConnection';
import { ClientOnly } from './ClientOnly';

interface HeaderProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function Header({ activeSection = 'home', onSectionChange }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { id: 'home', name: '首页', icon: '🏠' },
    { id: 'mint', name: '铸造', icon: '⚡' },
    { id: 'swap', name: '交换', icon: '💱' },
    { id: 'gallery', name: '收藏', icon: '🖼️' },
    { id: 'leaderboard', name: '排行榜', icon: '🏆' },
  ];

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-md shadow-lg shadow-purple-500/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">G</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Genesis Mecha
              </h1>
              <p className="text-xs text-gray-400 -mt-1">NFT BlindBox</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300">Sepolia</span>
            </div>

            {/* Wallet */}
            <ClientOnly fallback={
              <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg animate-pulse">
                连接钱包
              </div>
            }>
              <WalletConnection />
            </ClientOnly>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex items-center justify-center space-x-1 overflow-x-auto">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange?.(item.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 whitespace-nowrap ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
    </header>
  );
}
