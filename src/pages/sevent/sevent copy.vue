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
import { useVirtualList } from "@/hooks/useVirtualList";

const {
  systemHeight,
  itemHeights,
  getItemColor,
  totalHeight,
  visibleItems,
  onReachBottomFn,
  handleScroll,
} = useVirtualList();
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
