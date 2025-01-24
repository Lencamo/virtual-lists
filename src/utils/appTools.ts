const { screenWidth } = uni.getWindowInfo();

export const rpxToPx = (rpx: number) => {
  const rpxToPxRatio = screenWidth / 750;
  return rpx * rpxToPxRatio;
};

export const throttle = (fn: Function, delay: number) => {
  let lastTime = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn(...args); // 直接调用函数，不依赖 this
      lastTime = now;
    }
  };
};

// 定义 10 种颜色
const colors = [
  "#FFCCCC", // 浅红
  "#FFCC99", // 浅橙
  "#FFFF99", // 浅黄
  "#CCFFCC", // 浅绿
  "#CCFFFF", // 浅青
  "#CCCCFF", // 浅蓝
  "#FFCCFF", // 浅紫
  "#FF9999", // 粉红
  "#99CCFF", // 天蓝
  "#FF9966", // 橙红
];

export const getItemColor = (index: number) => {
  return colors[index % colors.length]; // 循环使用颜色
};
