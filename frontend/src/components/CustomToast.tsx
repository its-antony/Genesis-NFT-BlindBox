'use client';

import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

/**
 * 自定义 Toast 组件
 * 提供更好的样式控制和错误信息显示
 */

interface CustomToastProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export function CustomToaster({ position = 'top-right' }: CustomToastProps) {
  return (
    <Toaster
      position={position}
      containerClassName="toast-container"
      toastOptions={{
        duration: 4000,
        className: 'custom-toast',
        style: {
          background: '#374151',
          color: '#fff',
          maxWidth: '420px',
          minWidth: '300px',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          fontSize: '14px',
          lineHeight: '1.5',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        success: {
          duration: 5000,
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            border: '1px solid #10B981',
            color: '#fff',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.3)',
          },
        },
        error: {
          duration: 8000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
            border: '1px solid #EF4444',
            color: '#fff',
            maxWidth: '480px',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(239, 68, 68, 0.3)',
          },
        },
        loading: {
          duration: Infinity,
          iconTheme: {
            primary: '#3B82F6',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
            border: '1px solid #3B82F6',
            color: '#fff',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.3)',
          },
        },
      }}
    />
  );
}

/**
 * 错误 Toast 组件
 */
interface ErrorToastContentProps {
  title: string;
  message: string;
  details?: string;
  action?: string;
  txHash?: string;
}

export function ErrorToastContent({ title, message, details, action, txHash }: ErrorToastContentProps) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-red-100">{title}</div>
      <div className="text-red-200">{message}</div>
      
      {details && (
        <div className="text-xs text-red-300 bg-red-900/30 p-2 rounded border border-red-700/50">
          <div className="font-medium mb-1">详细信息:</div>
          <div className="font-mono break-all">{details}</div>
        </div>
      )}
      
      {txHash && (
        <div className="text-xs text-red-300">
          <div className="font-medium">交易哈希:</div>
          <div className="font-mono break-all">{txHash}</div>
        </div>
      )}
      
      {action && (
        <div className="text-xs text-red-200 bg-red-900/20 p-2 rounded border border-red-700/30">
          <div className="font-medium">💡 建议:</div>
          <div>{action}</div>
        </div>
      )}
    </div>
  );
}

/**
 * 成功 Toast 组件
 */
interface SuccessToastContentProps {
  message: string;
  txHash?: string;
  details?: string;
}

export function SuccessToastContent({ message, txHash, details }: SuccessToastContentProps) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-green-100">{message}</div>
      
      {details && (
        <div className="text-green-200 text-sm">{details}</div>
      )}
      
      {txHash && (
        <div className="text-xs text-green-300">
          <div className="font-medium">交易哈希:</div>
          <div className="font-mono break-all">{txHash.slice(0, 8)}...{txHash.slice(-6)}</div>
        </div>
      )}
    </div>
  );
}

/**
 * 加载 Toast 组件
 */
interface LoadingToastContentProps {
  message: string;
  details?: string;
}

export function LoadingToastContent({ message, details }: LoadingToastContentProps) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-blue-100">{message}</div>
      
      {details && (
        <div className="text-blue-200 text-sm">{details}</div>
      )}
      
      <div className="flex items-center space-x-2 text-blue-300 text-xs">
        <div className="animate-spin rounded-full h-3 w-3 border border-blue-400 border-t-transparent"></div>
        <span>请在钱包中确认交易...</span>
      </div>
    </div>
  );
}

/**
 * 自定义 Toast 工具函数
 */
export const customToast = {
  success: (message: string, options?: { txHash?: string; details?: string }) => {
    return toast.success(
      <SuccessToastContent 
        message={message} 
        txHash={options?.txHash}
        details={options?.details}
      />,
      {
        duration: 5000,
      }
    );
  },

  error: (title: string, options?: { message?: string; details?: string; action?: string; txHash?: string }) => {
    return toast.error(
      <ErrorToastContent 
        title={title}
        message={options?.message || '操作失败，请重试'}
        details={options?.details}
        action={options?.action}
        txHash={options?.txHash}
      />,
      {
        duration: 8000,
      }
    );
  },

  loading: (message: string, options?: { details?: string; id?: string }) => {
    return toast.loading(
      <LoadingToastContent 
        message={message}
        details={options?.details}
      />,
      {
        id: options?.id,
      }
    );
  },

  dismiss: (id?: string) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  },
};

/**
 * 地址格式化工具
 */
export function formatAddress(address: string, length: number = 6): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, length)}...${address.slice(-4)}`;
}

/**
 * 交易哈希格式化工具
 */
export function formatTxHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}
