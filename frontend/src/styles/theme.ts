// Genesis NFT BlindBox 主题配置
export const theme = {
  colors: {
    // 主色调 - 深空蓝紫渐变
    primary: {
      50: '#f0f4ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    
    // 霓虹强调色
    neon: {
      blue: '#00d4ff',
      cyan: '#00ff88',
      purple: '#8b5cf6',
      pink: '#f472b6',
    },
    
    // 稀有度颜色
    rarity: {
      common: '#9ca3af',     // 灰色
      rare: '#3b82f6',       // 蓝色
      epic: '#8b5cf6',       // 紫色
      legendary: '#f59e0b',  // 金色
    },
    
    // 背景色
    background: {
      primary: '#0a0a0f',
      secondary: '#1a1b3a',
      tertiary: '#2d1b69',
      card: 'rgba(26, 27, 58, 0.8)',
      glass: 'rgba(255, 255, 255, 0.05)',
    },
    
    // 文本色
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
      muted: '#94a3b8',
      accent: '#00d4ff',
    },
    
    // 状态色
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  
  // 渐变
  gradients: {
    primary: 'linear-gradient(135deg, #1a1b3a 0%, #2d1b69 100%)',
    neon: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
    card: 'linear-gradient(135deg, rgba(26, 27, 58, 0.8) 0%, rgba(45, 27, 105, 0.6) 100%)',
    button: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    rare: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    legendary: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
  
  // 阴影
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    neon: '0 0 20px rgba(0, 212, 255, 0.3)',
    glow: '0 0 30px rgba(139, 92, 246, 0.4)',
  },
  
  // 动画
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // 断点
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 字体
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
    display: ['Orbitron', 'sans-serif'], // 科技感字体
  },
  
  // 间距
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },
  
  // 圆角
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
};

// CSS变量导出
export const cssVariables = `
  :root {
    --color-primary: ${theme.colors.primary[600]};
    --color-neon-blue: ${theme.colors.neon.blue};
    --color-neon-cyan: ${theme.colors.neon.cyan};
    --color-bg-primary: ${theme.colors.background.primary};
    --color-bg-secondary: ${theme.colors.background.secondary};
    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    --gradient-primary: ${theme.gradients.primary};
    --gradient-neon: ${theme.gradients.neon};
    --shadow-neon: ${theme.shadows.neon};
    --shadow-glow: ${theme.shadows.glow};
  }
`;

export default theme;
