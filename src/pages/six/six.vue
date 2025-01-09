<template>
  <view class="container">
    <!-- 使用 scroll-view 监听滚动事件 -->
    <scroll-view
      scroll-y
      :style="{ height: `${systemHeight}px` }"
      @scroll="handleScroll"
      @scrolltolower="onReachBottomFn"
    >
      <!-- 占位符，用于撑起整个列表的高度 -->
      <view :style="{ height: `${totalHeight}px` }">
        <!-- 渲染可见区域的内容 -->
        <view
          v-for="(item, index) in visibleItems"
          :key="item.idx"
          :id="`item${item.pageNum}`"
          :style="{
            transform: `translateY(${item.offset}px)`,
            height: `${itemHeights[item.pageNum * 5 + (item.idx % 5)]}rpx`,
            backgroundColor: getItemColor(item.idx),
          }"
          class="item-list"
          :data-index="item.idx"
        >
          <text>{{ item.idx }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";

// 数据定义
const list = ref<any[][]>([]); // 所有数据
const index = ref(0); // 数据索引
const currentIndex = ref(0); // 当前页数
const systemHeight = ref(0); // 屏幕高度
const scrollTop = ref(0); // 当前滚动位置
const itemHeights = ref<number[]>([]); // 存储每个 item 的实际高度（rpx）
const itemOffsets = ref<number[]>([]); // 存储每个 item 的偏移量（px）
const rpxRatio = ref(1); // rpx 与 px 的转换比例

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
    const pageNum = Math.floor(i / 5); // 计算当前页
    const itemIndex = i % 5; // 计算当前项在页中的索引
    if (list.value[pageNum] && list.value[pageNum][itemIndex]) {
      items.push({
        idx: list.value[pageNum][itemIndex].idx,
        pageNum,
        offset: itemOffsets.value[i] || 0, // 动态计算偏移量
      });
    }
  }

  // console.log("visibleItems的值:", items);
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

// 初始化数据
const initData = () => {
  const arr = [
    { idx: index.value++, height: getRandomHeight() },
    { idx: index.value++, height: getRandomHeight() },
    { idx: index.value++, height: getRandomHeight() },
    { idx: index.value++, height: getRandomHeight() },
    { idx: index.value++, height: getRandomHeight() },
  ];
  list.value.push(arr);

  // 初始化 itemHeights 和 itemOffsets
  itemHeights.value = arr.map((item) => item.height);
  updateItemOffsets();
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
  initData();
  getSystemInfo();
});

// 触底加载更多数据
const onReachBottomFn = () => {
  currentIndex.value++;
  const arr = [
    { idx: index.value++, height: getRandomHeight() },
    { idx: index.value++, height: getRandomHeight() },
    { idx: index.value++, height: getRandomHeight() },
    { idx: index.value++, height: getRandomHeight() },
    { idx: index.value++, height: getRandomHeight() },
  ];
  list.value.push(arr);

  // 扩展 itemHeights 和 itemOffsets
  itemHeights.value.push(...arr.map((item) => item.height));
  updateItemOffsets();
};

// 页面滚动事件
const handleScroll = throttle((e: any) => {
  scrollTop.value = e.detail.scrollTop;
}, 50);
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.item-list {
  text-align: center;
  width: 100vw;
  position: absolute; /* 使用绝对定位实现动态偏移 */
  top: 0;
  left: 0;
}
</style>
