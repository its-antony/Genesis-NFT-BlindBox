'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientOnly组件 - 确保组件只在客户端渲染
 * 使用Next.js的dynamic导入来避免SSR
 */
function ClientOnlyComponent({ children, fallback = null }: ClientOnlyProps) {
  return <>{children}</>;
}

// 使用dynamic导入，禁用SSR
export const ClientOnly = dynamic(() => Promise.resolve(ClientOnlyComponent), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-700 rounded h-10 w-32"></div>,
});

export default ClientOnly;
