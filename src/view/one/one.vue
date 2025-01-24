<template>
  <view class="container">
    <view class="item-list" v-for="item in list" :key="item.idx">
      <text>{{ item.idx }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReachBottom } from "@dcloudio/uni-app";
import { onMounted, ref } from "vue";

// 定义数据
const list = ref<{ idx: number }[]>([]);
const index = ref(0);

// 初始化数据
const initData = () => {
  const arr = [
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
  ];
  list.value = arr;
};

// 页面加载时初始化数据
onMounted(() => {
  initData();
});

// 页面滚动到底部时加载更多数据
onReachBottom(() => {
  const arr = [
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
    { idx: index.value++ },
  ];
  list.value = [...list.value, ...arr];
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
  background-color: skyblue;
}
.item-list:nth-child(odd) {
  background-color: lightcoral;
}
</style>
