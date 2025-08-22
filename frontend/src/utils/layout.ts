// 布局相关的工具函数

// 导航栏高度常量
export const HEADER_HEIGHT = {
  // 桌面端导航栏高度 (py-4 = 1rem top + 1rem bottom = 32px)
  DESKTOP: 80, // px
  // 移动端导航栏高度 (包含移动端导航菜单)
  MOBILE: 120, // px
} as const;

// 获取当前设备的导航栏高度
export const getHeaderHeight = (): number => {
  if (typeof window === 'undefined') return HEADER_HEIGHT.DESKTOP;
  
  // 检查是否为移动设备
  const isMobile = window.innerWidth < 768; // md breakpoint
  return isMobile ? HEADER_HEIGHT.MOBILE : HEADER_HEIGHT.DESKTOP;
};

// 获取页面顶部间距的CSS类
export const getPageTopPadding = (): string => {
  // pt-32 = 8rem = 128px，足够覆盖导航栏高度
  return 'pt-32';
};

// 平滑滚动到指定元素，考虑导航栏高度
export const scrollToElementWithOffset = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const headerHeight = getHeaderHeight();
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - headerHeight - 20; // 额外20px间距

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

// 检查元素是否在视口中（考虑导航栏）
export const isElementInViewport = (elementId: string): boolean => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const headerHeight = getHeaderHeight();

  return (
    rect.top >= headerHeight &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// 获取当前活跃的页面区域
export const getCurrentActiveSection = (sections: string[]): string => {
  const headerHeight = getHeaderHeight();
  
  for (const sectionId of sections) {
    const element = document.getElementById(sectionId);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    
    // 如果区域的顶部在导航栏下方且底部在视口中
    if (rect.top <= headerHeight + 50 && rect.bottom > headerHeight + 50) {
      return sectionId;
    }
  }
  
  return sections[0] || 'home';
};
