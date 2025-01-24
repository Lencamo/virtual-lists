import { ref, computed, watch, onMounted, nextTick } from 'vue'

// 工具函数：节流
const throttle = (fn: Function, delay: number) => {
  let lastTime = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn(...args)
      lastTime = now
    }
  }
}

export function useVirtualList(options: {
  pageSize?: number
  loadMoreData: () => Promise<any[]> // 加载更多数据的回调函数
  getItemHeight: (item: any) => number // 外部传入的获取 item 高度的函数
}) {
  const { pageSize = 5, loadMoreData, getItemHeight } = options

  const list = ref<any[][]>([]) // 所有数据
  const systemHeight = ref(0) // 屏幕高度（px）
  const scrollTop = ref(0) // 当前滚动位置（px）
  const itemHeights = ref<number[]>([]) // 存储每个 item 的实际高度（px）
  const itemOffsets = ref<number[]>([]) // 存储每个 item 的偏移量（px）
  const rpxRatio = ref(1) // rpx 与 px 的转换比例
  const isLoading = ref(false) // 是否正在加载数据

  // 计算总高度（px）
  const totalHeight = computed(() => {
    return itemOffsets.value[itemOffsets.value.length - 1] || 0
  })

  // 计算可见区域的内容
  const visibleItems = computed(() => {
    const startIndex = findStartIndex(scrollTop.value)
    const endIndex = findEndIndex(scrollTop.value + systemHeight.value)

    const items = []
    for (let i = startIndex; i <= endIndex; i++) {
      const pageNum = Math.floor(i / pageSize) // 计算当前页
      const itemIndex = i % pageSize // 计算当前项在页中的索引
      if (list.value[pageNum] && list.value[pageNum][itemIndex]) {
        items.push({
          ...list.value[pageNum][itemIndex], // 包含数据内容
          pageNum,
          offset: itemOffsets.value[i] || 0 // 动态计算偏移量（px）
        })
      }
    }

    return items
  })

  // 查找起始索引
  const findStartIndex = (scrollTop: number) => {
    let low = 0,
      high = itemOffsets.value.length - 1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (itemOffsets.value[mid] <= scrollTop) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    return high
  }

  // 查找结束索引
  const findEndIndex = (scrollBottom: number) => {
    let low = 0,
      high = itemOffsets.value.length - 1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (itemOffsets.value[mid] <= scrollBottom) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    return high
  }

  // 更新 item 偏移量（px）
  const updateItemOffsets = () => {
    let offset = 0
    itemOffsets.value = itemHeights.value.map((height) => {
      const currentOffset = offset
      offset += height // 高度已经是 px，直接累加
      return currentOffset
    })
  }

  // 监听 itemHeights 的变化
  watch(itemHeights, updateItemOffsets, { deep: true })

  // 页面加载
  onMounted(() => {
    // 获取系统信息并计算 rpx 与 px 的转换比例
    uni.getSystemInfo({
      success: (res) => {
        systemHeight.value = res.windowHeight // 屏幕高度（px）
        rpxRatio.value = res.windowWidth / 750 // 计算 rpx 与 px 的转换比例
      },
      fail: (err) => {
        console.error('获取系统信息失败:', err)
      }
    })
    loadData() // 初始化加载数据
  })

  // 加载数据
  const loadData = async () => {
    if (isLoading.value) return // 防止重复加载
    isLoading.value = true

    try {
      const newData = await loadMoreData() // 调用外部传入的加载函数
      if (newData.length > 0) {
        list.value.push(newData)

        // 初始化 itemHeights
        const startIndex = itemHeights.value.length
        itemHeights.value.push(...newData.map((item) => getItemHeight(item)))

        // 等待 DOM 更新后，动态计算 item 的高度
        nextTick(() => {
          newData.forEach((_, index) => {
            const query = uni.createSelectorQuery()
            query.select(`#item${list.value.length - 1}-${index}`).boundingClientRect()
            query.exec((res) => {
              if (res && res[0]) {
                const height = res[0].height // 获取实际高度（px）
                const itemIndex = startIndex + index
                itemHeights.value[itemIndex] = height
                updateItemOffsets()
              }
            })
          })
        })
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 触底加载更多数据
  const onReachBottomFn = () => {
    loadData()
  }

  // 页面滚动事件
  const handleScroll = throttle((e: any) => {
    scrollTop.value = e.detail.scrollTop
  }, 50)

  return {
    systemHeight,
    itemHeights,
    totalHeight,
    visibleItems,
    onReachBottomFn,
    handleScroll
  }
}
