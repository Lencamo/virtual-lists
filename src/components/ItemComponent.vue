<template>
  <view
    class="item-container"
    :style="{
      height: `${height}px`,
      width: '100vw'
    }"
  >
    <image
      class="bg-image"
      :src="backgroundImageUrl"
      mode="aspectFill"
      @load="handleImageLoad"
    ></image>
    <view class="message">
      <text class="sender">{{ item.sender }}:</text>
      <text class="content">{{ item.content }}</text>
      <text class="timestamp">{{ item.timestamp }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const height = ref(0) // item 的高度
const backgroundImageUrl = ref('') // 背景图片 URL

// 生成随机图片 URL
const generateRandomImageUrl = (width: number) => {
  const randomHeight = Math.floor(Math.random() * 200) + 150 // 随机高度
  return `https://picsum.photos/${width}/${randomHeight}`
}

// 图片加载完成事件
const handleImageLoad = (event: any) => {
  const { height: imgHeight } = event.detail
  height.value = imgHeight // 获取图片高度
  emit('height-change', height.value) // 通知父组件高度变化
}

const emit = defineEmits(['height-change'])

// 初始化背景图片 URL
onMounted(() => {
  uni.getSystemInfo({
    success: (res) => {
      const screenWidth = res.windowWidth // 获取屏幕宽度
      backgroundImageUrl.value = generateRandomImageUrl(screenWidth)
    },
    fail: (err) => {
      console.error('获取系统信息失败:', err)
    }
  })
})
</script>

<style scoped>
.item-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  box-sizing: border-box;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.message {
  display: flex;
  flex-direction: column;
  z-index: 1;
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
