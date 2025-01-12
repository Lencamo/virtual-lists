import { ref, computed, watch, onMounted, nextTick } from 'vue'

export function useVirtualList(options: {
  pageSize?: number
  loadMoreData: (pageNum: number) => Promise<any[]>
}) {
  const { pageSize = 5, loadMoreData } = options

  const list = ref<any[]>([]) // 存储所有数据
  const systemHeight = ref(0) // 屏幕高度
  const scrollTop = ref(0) // 当前滚动位置
  const itemHeights = ref<number[]>([]) // 每个 item 的高度
  const itemOffsets = ref<number[]>([]) // 每个 item 的偏移量
  const isLoading = ref(false) // 是否正在加载数据
  const currentPage = ref(0) // 当前页数

  // 计算总高度
  const totalHeight = computed(() => {
    return itemHeights.value.reduce((sum, height) => sum + height, 0)
  })

  // 计算可见区域的内容
  const visibleItems = computed(() => {
    const buffer = 2 // 上下缓冲区域
    const startIndex = Math.max(0, findStartIndex(scrollTop.value) - buffer)
    const endIndex = Math.min(
      itemOffsets.value.length - 1,
      findEndIndex(scrollTop.value + systemHeight.value) + buffer
    )

    const items = []
    for (let i = startIndex; i <= endIndex; i++) {
      if (list.value[i]) {
        items.push({
          ...list.value[i],
          idx: i,
          offset: itemOffsets.value[i] || 0
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
      if (itemOffsets.value[mid] < scrollTop) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    return low
  }

  // 查找结束索引
  const findEndIndex = (scrollBottom: number) => {
    let low = 0,
      high = itemOffsets.value.length - 1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (itemOffsets.value[mid] < scrollBottom) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    return low
  }

  // 更新 item 偏移量
  const updateItemOffsets = () => {
    let offset = 0
    itemOffsets.value = itemHeights.value.map((height) => {
      const currentOffset = offset
      offset += height
      return currentOffset
    })
  }

  // 监听 itemHeights 的变化
  watch(itemHeights, updateItemOffsets, { deep: true })

  // 页面加载
  onMounted(() => {
    uni.getSystemInfo({
      success: (res) => {
        systemHeight.value = res.windowHeight
      },
      fail: (err) => {
        console.error('获取系统信息失败:', err)
      }
    })
    loadData()
  })

  // 加载数据
  const loadData = async () => {
    if (isLoading.value) return
    isLoading.value = true

    try {
      const newData = await loadMoreData(currentPage.value)
      if (newData.length > 0) {
        list.value.push(...newData)
        itemHeights.value.push(...new Array(newData.length).fill(0))
        currentPage.value++

        // 确保 DOM 更新完成
        await nextTick()
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

  // 更新滚动位置
  const updateScrollTop = (top: number) => {
    scrollTop.value = top
  }

  return {
    systemHeight,
    itemHeights,
    totalHeight,
    visibleItems,
    scrollTop,
    onReachBottomFn,
    updateScrollTop
  }
}
