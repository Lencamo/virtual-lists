<template>
  <view class="container">
    <scroll-view
      scroll-y
      :style="{ height: `${systemHeight}px` }"
      @scroll="handleScroll"
      @scrolltolower="onReachBottomFn"
      enhanced
      paging-enabled
    >
      <view :style="{ height: `${totalHeight}px` }">
        <view
          v-for="(item, index) in visibleItems"
          :key="item.id"
          :id="`item${item.pageNum}-${item.idx % pageSize}`"
          :style="{
            transform: `translateY(${item.offset}px)`
          }"
          class="item-list"
        >
          <ItemComponent
            :item="item"
            @height-change="(height) => updateItemHeight(item.idx, height)"
          />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useVirtualList } from '@/hooks/useVirtualList2'
import ItemComponent from '@/components/ItemComponent.vue'

const currentIndex = ref(0)
const pageSize = 5

// 模拟数据加载函数
const loadMoreData = async () => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      const newData = Array.from({ length: pageSize }, (_, i) => ({
        id: currentIndex.value * pageSize + i + 1,
        idx: currentIndex.value * pageSize + i, // 全局唯一索引
        sender: `User ${currentIndex.value * pageSize + i + 1}`,
        content: `This is message ${currentIndex.value * pageSize + i + 1}`,
        timestamp: new Date().toLocaleTimeString()
      }))
      currentIndex.value++ // 更新页数
      resolve(newData)
    }, 1000) // 模拟延迟
  })
}

// 更新 item 高度
const updateItemHeight = (index: number, height: number) => {
  itemHeights.value[index] = height
}

const { systemHeight, itemHeights, totalHeight, visibleItems, onReachBottomFn, handleScroll } =
  useVirtualList({
    pageSize,
    loadMoreData
  })
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
  box-sizing: border-box;
}
</style>
