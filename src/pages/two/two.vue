<template>
  <view class="container">
    <view v-for="(page, pageNuma) in list" :key="pageNuma">
      <view class="item-list" v-for="item in page" :key="item.idx">
        <text>{{ item.idx }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReachBottom } from "@dcloudio/uni-app";
import { onMounted, ref } from "vue";

// 定义数据
const list = ref<{ idx: number }[][]>([]); // 二维数组，存储分页数据
const index = ref(0); // 用于生成 idx
const currentIndex = ref(0); // 当前页数 pageNuma

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
};

// 页面加载时初始化数据
onMounted(() => {
  initData();
});

// 页面滚动到底部时加载更多数据
onReachBottom(() => {
  currentIndex.value++; // 触底 +1
  const arr = [
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
  ];
  list.value[currentIndex.value] = arr;
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.item-list {
  width: 100vw;
  height: 300rpx;
}

.item-list:nth-child(even) {
  background-color: lightgray;
}
.item-list:nth-child(odd) {
  background-color: lightgreen;
}
</style>
