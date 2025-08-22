'use client';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message = '加载中...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4`}></div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

export function ErrorDisplay({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-600/30 rounded-lg">
      <div className="text-4xl mb-4">❌</div>
      <h3 className="text-lg font-bold text-red-400 mb-2">数据加载失败</h3>
      <p className="text-red-300 text-sm mb-4 text-center">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          重试
        </button>
      )}
    </div>
  );
}
