import { ref, computed, watch, onMounted } from "vue";

export function useVirtualList(options: {
  pageSize?: number;
  loadMoreData: () => Promise<any[]>; // 加载更多数据的回调函数，不需要参数
}) {
  const { pageSize = 5, loadMoreData } = options;

  // 数据定义
  const list = ref<any[][]>([]); // 所有数据
  const systemHeight = ref(0); // 屏幕高度
  const scrollTop = ref(0); // 当前滚动位置
  const itemHeights = ref<number[]>([]); // 存储每个 item 的实际高度（rpx）
  const itemOffsets = ref<number[]>([]); // 存储每个 item 的偏移量（px）
  const rpxRatio = ref(1); // rpx 与 px 的转换比例
  const isLoading = ref(false); // 是否正在加载数据

  // 默认颜色数组
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

  // 根据索引获取颜色
  const getItemColor = (index: number) => {
    return colors[index % colors.length]; // 循环使用颜色
  };

  // 计算总高度
  const totalHeight = computed(() => {
    return itemOffsets.value[itemOffsets.value.length - 1] || 0;
  });

  // 计算可见区域的内容
  const visibleItems = computed(() => {
    const startIndex = findStartIndex(scrollTop.value);
    const endIndex = findEndIndex(scrollTop.value + systemHeight.value);

    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const pageNum = Math.floor(i / pageSize); // 计算当前页
      const itemIndex = i % pageSize; // 计算当前项在页中的索引
      if (list.value[pageNum] && list.value[pageNum][itemIndex]) {
        items.push({
          ...list.value[pageNum][itemIndex], // 包含数据内容
          pageNum,
          offset: itemOffsets.value[i] || 0, // 动态计算偏移量
        });
      }
    }

    return items;
  });

  // 查找起始索引
  const findStartIndex = (scrollTop: number) => {
    let low = 0,
      high = itemOffsets.value.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (itemOffsets.value[mid] <= scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return high;
  };

  // 查找结束索引
  const findEndIndex = (scrollBottom: number) => {
    let low = 0,
      high = itemOffsets.value.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (itemOffsets.value[mid] <= scrollBottom) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return high;
  };

  // 节流函数
  const throttle = (fn: Function, delay: number) => {
    let lastTime = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastTime >= delay) {
        fn(...args); // 直接调用函数，不依赖 this
        lastTime = now;
      }
    };
  };

  // 获取系统信息
  const getSystemInfo = () => {
    uni.getSystemInfo({
      success: (res) => {
        systemHeight.value = res.windowHeight;
        // 计算 rpx 与 px 的转换比例
        rpxRatio.value = res.windowWidth / 750;
      },
      fail: (err) => {
        console.error("获取系统信息失败:", err);
      },
    });
  };

  // 随机生成高度（200-500rpx）
  const getRandomHeight = () => {
    return Math.floor(Math.random() * 300) + 200; // 200-500rpx
  };

  // 更新 item 偏移量
  const updateItemOffsets = () => {
    let offset = 0;
    itemOffsets.value = itemHeights.value.map((height) => {
      const currentOffset = offset;
      offset += height * rpxRatio.value; // 将 rpx 转换为 px
      return currentOffset;
    });
  };

  // 监听 itemHeights 的变化
  watch(itemHeights, () => {
    updateItemOffsets();
  });

  // 页面加载
  onMounted(() => {
    getSystemInfo();
    loadData(); // 初始化加载数据
  });

  // 加载数据
  const loadData = async () => {
    if (isLoading.value) return; // 防止重复加载
    isLoading.value = true;

    try {
      const newData = await loadMoreData(); // 直接调用 loadMoreData，不需要参数
      if (newData.length > 0) {
        const arr = newData.map((item) => ({
          ...item,
          height: getRandomHeight(),
        }));
        list.value.push(arr);

        // 扩展 itemHeights 和 itemOffsets
        itemHeights.value.push(...arr.map((item) => item.height));
        updateItemOffsets();
      }
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // 触底加载更多数据
  const onReachBottomFn = () => {
    loadData();
  };

  // 页面滚动事件
  const handleScroll = throttle((e: any) => {
    scrollTop.value = e.detail.scrollTop;
  }, 50);

  return {
    list,
    systemHeight,
    scrollTop,
    itemHeights,
    itemOffsets,
    rpxRatio,
    getItemColor,
    totalHeight,
    visibleItems,
    onReachBottomFn,
    handleScroll,
  };
}
