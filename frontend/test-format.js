// 简单测试格式化函数
const { formatUnits } = require('viem');

// 模拟测试数据
const testAmount = "98029775"; // 98.029775 GEM (6位小数)
const decimals = 6;

console.log("🧪 测试格式化修复...");
console.log("原始金额:", testAmount);
console.log("小数位数:", decimals);

// 使用viem的formatUnits
const formatted = formatUnits(BigInt(testAmount), decimals);
console.log("格式化结果:", formatted);

// 计算汇率
const ethAmount = 0.01;
const gemAmount = parseFloat(formatted);
const rate = gemAmount / ethAmount;

console.log("ETH金额:", ethAmount);
console.log("GEM金额:", gemAmount);
console.log("汇率:", rate.toLocaleString(), "GEM/ETH");

// 计算滑点
const slippage = 0.5; // 0.5%
const minAmount = gemAmount * (100 - slippage) / 100;
console.log("0.5%滑点最小获得:", minAmount.toFixed(6), "GEM");

console.log("✅ 格式化测试完成!");
