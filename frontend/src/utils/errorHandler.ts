import { toast } from 'react-hot-toast';

/**
 * 错误处理工具函数
 * 用于格式化和显示用户友好的错误信息
 */

interface ErrorDetails {
  title: string;
  message: string;
  details?: string;
  action?: string;
}

/**
 * 格式化地址显示
 * @param address 完整地址
 * @returns 格式化后的地址
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * 格式化交易哈希
 * @param hash 交易哈希
 * @returns 格式化后的哈希
 */
export function formatTxHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

/**
 * 解析钱包错误信息
 * @param error 错误对象
 * @returns 格式化的错误详情
 */
export function parseWalletError(error: any): ErrorDetails {
  const errorMessage = error?.message || error?.toString() || '未知错误';
  
  // 用户拒绝交易
  if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
    return {
      title: '交易被取消',
      message: '您取消了交易请求',
      action: '请重新尝试并确认交易'
    };
  }
  
  // 余额不足
  if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
    return {
      title: '余额不足',
      message: '账户余额不足以完成此交易',
      action: '请检查您的 ETH 或 GEM 余额'
    };
  }
  
  // Gas 费用问题
  if (errorMessage.includes('gas') || errorMessage.includes('Gas')) {
    return {
      title: 'Gas 费用问题',
      message: 'Gas 费用设置可能有问题',
      action: '请尝试调整 Gas 费用或稍后重试'
    };
  }
  
  // 授权问题
  if (errorMessage.includes('allowance') || errorMessage.includes('approve')) {
    return {
      title: '授权不足',
      message: 'GEM 代币授权额度不足',
      action: '请先进行代币授权'
    };
  }
  
  // 合约执行失败
  if (errorMessage.includes('execution reverted') || errorMessage.includes('revert')) {
    return {
      title: '合约执行失败',
      message: '智能合约执行被拒绝',
      details: extractRevertReason(errorMessage),
      action: '请检查交易参数或稍后重试'
    };
  }
  
  // 网络问题
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return {
      title: '网络连接问题',
      message: '无法连接到区块链网络',
      action: '请检查网络连接或切换 RPC 节点'
    };
  }
  
  // 默认错误处理
  return {
    title: '交易失败',
    message: '交易执行过程中发生错误',
    details: errorMessage.length > 100 ? `${errorMessage.slice(0, 100)}...` : errorMessage,
    action: '请重试或联系技术支持'
  };
}

/**
 * 提取合约 revert 原因
 * @param errorMessage 错误信息
 * @returns 提取的原因
 */
function extractRevertReason(errorMessage: string): string {
  const revertMatch = errorMessage.match(/revert (.+?)(?:\n|$)/i);
  if (revertMatch) {
    return revertMatch[1].trim();
  }
  
  const reasonMatch = errorMessage.match(/reason: (.+?)(?:\n|$)/i);
  if (reasonMatch) {
    return reasonMatch[1].trim();
  }
  
  return '';
}

/**
 * 显示格式化的错误 Toast
 * @param error 错误对象
 * @param customTitle 自定义标题
 */
export function showErrorToast(error: any, customTitle?: string) {
  const errorDetails = parseWalletError(error);
  
  const title = customTitle || errorDetails.title;
  const message = errorDetails.message;
  const details = errorDetails.details;
  const action = errorDetails.action;
  
  // 构建显示内容
  let displayContent = `${title}\n\n${message}`;
  
  if (details) {
    displayContent += `\n\n详细信息:\n${details}`;
  }
  
  if (action) {
    displayContent += `\n\n建议操作:\n${action}`;
  }
  
  toast.error(displayContent, {
    duration: 8000,
    style: {
      maxWidth: '450px',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
      fontSize: '14px',
      lineHeight: '1.5',
    }
  });
}

/**
 * 显示成功 Toast
 * @param message 成功信息
 * @param txHash 交易哈希（可选）
 */
export function showSuccessToast(message: string, txHash?: string) {
  let displayContent = message;
  
  if (txHash) {
    displayContent += `\n\n交易哈希: ${formatTxHash(txHash)}`;
  }
  
  toast.success(displayContent, {
    duration: 5000,
    style: {
      maxWidth: '400px',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
    }
  });
}

/**
 * 显示加载 Toast
 * @param message 加载信息
 * @param id Toast ID
 */
export function showLoadingToast(message: string, id?: string) {
  return toast.loading(message, {
    id,
    style: {
      maxWidth: '350px',
      wordBreak: 'break-word',
    }
  });
}

/**
 * 关闭指定的 Toast
 * @param id Toast ID
 */
export function dismissToast(id?: string) {
  if (id) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
}

/**
 * 格式化合约调用错误信息
 * @param error 错误对象
 * @param contractName 合约名称
 * @param functionName 函数名称
 */
export function formatContractError(error: any, contractName: string, functionName: string): string {
  const errorDetails = parseWalletError(error);
  
  return `${contractName}.${functionName} 调用失败\n\n${errorDetails.message}\n\n${errorDetails.action || '请重试'}`;
}

/**
 * 检查是否为用户取消错误
 * @param error 错误对象
 * @returns 是否为用户取消
 */
export function isUserRejectedError(error: any): boolean {
  const errorMessage = error?.message || error?.toString() || '';
  return errorMessage.includes('User rejected') || errorMessage.includes('user rejected');
}

/**
 * 获取错误的简短描述
 * @param error 错误对象
 * @returns 简短描述
 */
export function getErrorSummary(error: any): string {
  const errorDetails = parseWalletError(error);
  return errorDetails.title;
}
