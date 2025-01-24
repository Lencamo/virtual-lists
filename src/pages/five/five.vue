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
            backgroundColor: getItemColor(item.idx),
          }"
          class="item-list"
        >
          <text>{{ item.idx }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { getItemColor, rpxToPx, throttle } from "@/utils/appTools";
import { ref, computed, nextTick } from "vue";

const currentIndex = ref(1); // 当前页数
const dataList = ref<any[][]>([]); // 所有数据

const { windowHeight } = uni.getSystemInfoSync();
const systemHeight = ref(windowHeight); // 屏幕高度
const scrollTop = ref(0); // 当前滚动位置
const itemHeight = ref(rpxToPx(500));

const index = ref(0); // 数据索引
const getDataFn = async () => {
  const arr = [
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
  ];
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟延迟
  dataList.value.push(arr);
};

getDataFn();

// ======================== 数据更新 ========================

// 计算总高度
const totalHeight = computed(() => {
  return dataList.value.length * itemHeight.value * 5;
});

// 计算可见区域的内容
const visibleItems = computed(() => {
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop.value / itemHeight.value) - 5
  );
  const endIndex = Math.min(
    startIndex + Math.ceil(systemHeight.value / itemHeight.value) + 10,
    dataList.value.length * 5
  );

  const items = [];
  for (let i = startIndex; i < endIndex; i++) {
    const pageNum = Math.floor(i / 5);
    const itemIndex = i % 5;
    if (dataList.value[pageNum] && dataList.value[pageNum][itemIndex]) {
      items.push({
        idx: dataList.value[pageNum][itemIndex].idx,
        pageNum,
        offset: i * itemHeight.value,
      });
    }
  }

  return items;
});

// ======================== 数据加载 ========================

// 页面滚动事件
const handleScroll = throttle((e: any) => {
  scrollTop.value = e.detail.scrollTop;
}, 50);

// 触底加载更多数据
const onReachBottomFn = () => {
  currentIndex.value++;
  getDataFn();
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.item-list {
  text-align: center;
  height: v-bind("itemHeight + 'px'");
  width: 100vw;
  position: absolute; /* 使用绝对定位实现动态偏移 */
  top: 0;
  left: 0;

  transition: transform 0.2s ease-in-out;
}
</style>
