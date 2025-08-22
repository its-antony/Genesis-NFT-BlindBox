'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnection() {
  const [mounted, setMounted] = useState(false);

  // 防止hydration错误
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg">
          连接钱包
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ConnectButton
        chainStatus="icon"
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
        showBalance={{
          smallScreen: false,
          largeScreen: true,
        }}
      />
    </div>
  );
}
