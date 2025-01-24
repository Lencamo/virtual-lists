<template>
  <view class="container">
    <scroll-view
      scroll-y
      :style="{ height: `${systemHeight}px` }"
      @scroll="handleScroll"
      @scrolltolower="onReachBottomFn"
    >
      <view :style="{ height: `${totalHeight}px` }">
        <view
          v-for="(item, index) in visibleItems"
          :key="item.id"
          :id="`item${item.pageNum}-${item.idx % pageSize}`"
          :style="{
            transform: `translateY(${item.offset}px)`,
            height: `${itemHeights[item.idx]}px`,
            backgroundColor: getItemColor(item.idx),
          }"
          class="item-list"
        >
          <view class="message">{{ item.idx }}</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useVirtualList } from "@/hooks/others/useVirtualList";

const currentIndex = ref(0);
const pageSize = 5;

// 模拟数据加载函数
const loadMoreData = async () => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      const newData = Array.from({ length: pageSize }, (_, i) => ({
        id: currentIndex.value * pageSize + i + 1,
        idx: currentIndex.value * pageSize + i, // 全局唯一索引
      }));
      currentIndex.value++; // 更新页数
      resolve(newData);
    }, 1000); // 模拟延迟
  });
};

// 获取 item 高度的函数（外部逻辑）
const getItemHeight = (item: any) => {
  // 这里可以根据 item 的内容动态计算高度
  return Math.floor(Math.random() * 150) + 100;
};

// 获取 item 颜色的函数（外部逻辑）
const getItemColor = (index: number) => {
  const colors = [
    "#FFCCCC",
    "#FFCC99",
    "#FFFF99",
    "#CCFFCC",
    "#CCFFFF",
    "#CCCCFF",
    "#FFCCFF",
    "#FF9999",
    "#99CCFF",
    "#FF9966",
  ];
  return colors[index % colors.length];
};

const {
  systemHeight,
  itemHeights,
  totalHeight,
  visibleItems,
  onReachBottomFn,
  handleScroll,
} = useVirtualList({
  pageSize,
  loadMoreData,
  getItemHeight, // 传入获取 item 高度的函数
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.item-list {
  text-align: left;
  width: 100vw;
  position: absolute; /* 使用绝对定位实现动态偏移 */
  top: 0;
  left: 0;
  padding: 10px;
  box-sizing: border-box;
}

.message {
  display: flex;
  flex-direction: column;
}
</style>
