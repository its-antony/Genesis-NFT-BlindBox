'use client';

import { Leaderboard } from '@/components/Leaderboard';

export default function TestLeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🧪 排行榜测试页面
          </h1>
          <p className="text-gray-400">
            测试重构后的排行榜组件，使用真实区块链数据
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">✅ 简化完成的功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-green-400">功能简化</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• 移除活动记录功能</li>
                <li>• 专注核心排行榜功能</li>
                <li>• 简化标签页结构</li>
                <li>• 优化数据处理逻辑</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-blue-400">保留核心功能</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• 持有者排行榜</li>
                <li>• 真实稀有度统计</li>
                <li>• 价值估算展示</li>
                <li>• 实时数据刷新</li>
              </ul>
            </div>
          </div>
        </div>

        <Leaderboard />
      </div>
    </div>
  );
}
