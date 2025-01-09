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
          :key="item.id"
          :id="`item${item.pageNum}`"
          :style="{
            transform: `translateY(${item.offset}px)`,
            height: `${itemHeights[item.idx]}rpx`,
            backgroundColor: getItemColor(item.idx),
          }"
          class="item-list"
          :data-index="item.idx"
        >
          <!-- 渲染聊天信息 -->
          <view class="message">
            <text class="sender">{{ item.sender }}:</text>
            <text class="content">{{ item.content }}</text>
            <text class="timestamp">{{ item.timestamp }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useVirtualList } from "@/hooks/useVirtualList";

// 当前页数，由父组件管理
const currentIndex = ref(0);

// 模拟数据加载函数
const loadMoreData = async () => {
  // 模拟接口请求
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      const newData = Array.from({ length: 5 }, (_, i) => ({
        id: currentIndex.value * 5 + i + 1,
        idx: currentIndex.value * 5 + i, // 全局唯一索引
        sender: `User ${currentIndex.value * 5 + i + 1}`,
        content: `This is message ${currentIndex.value * 5 + i + 1}`,
        timestamp: new Date().toLocaleTimeString(),
      }));
      currentIndex.value++; // 更新页数
      resolve(newData);
    }, 1000); // 模拟延迟
  });
};

const {
  systemHeight,
  itemHeights,
  getItemColor,
  totalHeight,
  visibleItems,
  onReachBottomFn,
  handleScroll,
} = useVirtualList({
  pageSize: 5,
  loadMoreData,
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

.sender {
  font-weight: bold;
  margin-bottom: 5px;
}

.content {
  margin-bottom: 5px;
}

.timestamp {
  font-size: 12px;
  color: #666;
}
</style>
