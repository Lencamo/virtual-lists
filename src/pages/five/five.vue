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
          :style="{ transform: `translateY(${item.offset}px)` }"
          class="item-list"
        >
          <text>{{ item.idx }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { onReachBottom } from "@dcloudio/uni-app";

// 数据定义
const list = ref<any[][]>([]); // 所有数据
const index = ref(0); // 数据索引
const currentIndex = ref(0); // 当前页数
const systemHeight = ref(0); // 屏幕高度
const scrollTop = ref(0); // 当前滚动位置
const itemHeight = ref(100); // 每个列表项的预估高度（单位：px）

// 计算总高度
const totalHeight = computed(() => {
  return list.value.length * itemHeight.value * 5; // 每页有 5 个列表项
});

// 计算可见区域的内容
const visibleItems = computed(() => {
  const startIndex = Math.floor(scrollTop.value / itemHeight.value);
  const endIndex = Math.min(
    startIndex + Math.ceil(systemHeight.value / itemHeight.value) + 10, // 多加载一些项以避免空白
    list.value.length * 5 // 每页有 5 个列表项
  );

  const items = [];
  for (let i = startIndex; i < endIndex; i++) {
    const pageNum = Math.floor(i / 5); // 计算当前页
    const itemIndex = i % 5; // 计算当前项在页中的索引
    if (list.value[pageNum] && list.value[pageNum][itemIndex]) {
      items.push({
        idx: list.value[pageNum][itemIndex].idx,
        pageNum,
        offset: i * itemHeight.value, // 动态计算偏移量
      });
    }
  }
  return items;
});

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
    },
    fail: (err) => {
      console.error("获取系统信息失败:", err);
    },
  });
};

// 初始化数据
const initData = () => {
  const arr = [
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
  ];
  list.value.push(arr);
};

// 页面加载
onMounted(() => {
  initData();
  getSystemInfo();
  // 动态获取 item 高度
  nextTick(() => {
    uni
      .createSelectorQuery()
      .select(".item-list")
      .boundingClientRect((res: any) => {
        if (res) {
          itemHeight.value = res.height; // 更新 itemHeight 为实际高度
        }
      })
      .exec();
  });
});

// 触底加载更多数据
const onReachBottomFn = () => {
  currentIndex.value++;
  const arr = [
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
  ];
  list.value.push(arr);
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
  height: 500rpx; /* 每个列表项的高度 */
  width: 100vw;
  position: absolute; /* 使用绝对定位实现动态偏移 */
  top: 0;
  left: 0;
}
.item-list:nth-child(even) {
  background-color: lightgray;
}
.item-list:nth-child(odd) {
  background-color: lightgreen;
}
</style>
