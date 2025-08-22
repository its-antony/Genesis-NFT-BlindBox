'use client';

import React, { createContext, useContext, useCallback } from 'react';

interface RefreshContextType {
  refreshAll: () => void;
  registerRefreshFunction: (key: string, fn: () => void) => void;
  unregisterRefreshFunction: (key: string) => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const refreshFunctions = React.useRef<Map<string, () => void>>(new Map());

  const registerRefreshFunction = useCallback((key: string, fn: () => void) => {
    refreshFunctions.current.set(key, fn);
  }, []);

  const unregisterRefreshFunction = useCallback((key: string) => {
    refreshFunctions.current.delete(key);
  }, []);

  const refreshAll = useCallback(() => {
    console.log('🔄 刷新所有数据...');
    refreshFunctions.current.forEach((fn, key) => {
      try {
        console.log(`🔄 刷新 ${key}`);
        fn();
      } catch (error) {
        console.error(`❌ 刷新 ${key} 失败:`, error);
      }
    });
  }, []);

  return (
    <RefreshContext.Provider value={{
      refreshAll,
      registerRefreshFunction,
      unregisterRefreshFunction
    }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}
