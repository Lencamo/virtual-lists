<template>
  <view class="container">
    <!-- 遍历 list，根据 visualIndex 决定是否渲染内容 -->
    <view v-for="(page, pageNum) in list" :id="`item${pageNum}`" :key="pageNum">
      <block v-if="visualIndex.includes(pageNum)">
        <!-- 渲染可见区域的内容 -->
        <view class="item-list" v-for="(item, index) in page" :key="index">
          <text>{{ item.idx }}</text>
        </view>
      </block>
      <block v-else>
        <!-- 不可见区域用占位符代替 -->
        <view
          class="item-visible"
          :style="{ height: `${pageHeight[pageNum] || 0}px` }"
        ></view>
      </block>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { onReachBottom, onPageScroll } from "@dcloudio/uni-app";

// 数据定义
const list = ref<any[][]>([]); // 所有数据
const visualIndex = ref<number[]>([]); // 当前可见的区域
const pageHeight = ref<number[]>([]); // 每屏高度
const index = ref(0); // 数据索引
const currentIndex = ref(0); // 当前页数
const systemHeight = ref(0); // 屏幕高度

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
  });
};

// 设置每屏高度
const setPageHeight = () => {
  nextTick(() => {
    uni
      .createSelectorQuery()
      .select(`#item${currentIndex.value}`)
      .fields(
        {
          size: true,
          rect: true,
        },
        (res: any) => {
          if (res) {
            pageHeight.value[currentIndex.value] = res.height;
            // 更新 visualIndex
            visualIndex.value = [
              currentIndex.value - 1,
              currentIndex.value,
              currentIndex.value + 1,
            ];
          }
        }
      )
      .exec();
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
  list.value[currentIndex.value] = arr;
  setPageHeight();
};

// 页面加载
onMounted(() => {
  initData();
  getSystemInfo();
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
  list.value[currentIndex.value] = arr;
  setPageHeight();
};

// 页面滚动事件
const onPageScrollFn = throttle((e: any) => {
  const pageScrollTop = e.scrollTop;
  let scrollTop = 0;

  // 计算当前可见区域
  for (let i = 0; i < pageHeight.value.length; i++) {
    scrollTop += pageHeight.value[i];
    if (scrollTop > pageScrollTop + systemHeight.value - 50) {
      currentIndex.value = i;
      visualIndex.value = [i - 1, i, i + 1];
      break;
    }
  }
}, 200);

// 监听页面滚动
onPageScroll(onPageScrollFn);
// 监听触底事件
onReachBottom(onReachBottomFn);
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.item-list {
  height: 500rpx;
  width: 100vw;
}
.item-list:nth-child(even) {
  background-color: purple;
}
.item-list:nth-child(odd) {
  background-color: pink;
}

.item-visible {
  /* 占位样式 */
  background-color: transparent;
}
</style>
