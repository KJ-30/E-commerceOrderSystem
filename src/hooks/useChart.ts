import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, ECharts } from 'echarts'

interface UseChartOptions {
  autoResize?: boolean
  onInit?: (chart: ECharts) => void
  onDispose?: (chart: ECharts) => void
}

export function useChart(options: UseChartOptions = {}) {
  const { autoResize = true, onInit, onDispose } = options

  const chartRef = ref<HTMLElement | null>(null)
  const chartInstance = ref<ECharts | null>(null)
  const chartOptions = ref<EChartsOption>({})

  function initChart(): void {
    if (!chartRef.value) return
    
    chartInstance.value = echarts.init(chartRef.value)
    
    if (Object.keys(chartOptions.value).length > 0) {
      chartInstance.value.setOption(chartOptions.value)
    }
    
    onInit?.(chartInstance.value)
  }

  function setOptions(newOptions: EChartsOption, notMerge = false): void {
    chartOptions.value = newOptions
    
    if (chartInstance.value) {
      chartInstance.value.setOption(newOptions, notMerge)
    }
  }

  function updateOptions(partialOptions: EChartsOption): void {
    chartOptions.value = {
      ...chartOptions.value,
      ...partialOptions
    }
    
    if (chartInstance.value) {
      chartInstance.value.setOption(partialOptions)
    }
  }

  function resizeChart(): void {
    chartInstance.value?.resize()
  }

  function clearChart(): void {
    chartInstance.value?.clear()
  }

  function disposeChart(): void {
    if (chartInstance.value) {
      onDispose?.(chartInstance.value)
      chartInstance.value.dispose()
      chartInstance.value = null
    }
  }

  function showLoading(type = 'default'): void {
    chartInstance.value?.showLoading(type)
  }

  function hideLoading(): void {
    chartInstance.value?.hideLoading()
  }

  function getDataURL(options?: { type?: string; pixelRatio?: number; backgroundColor?: string }): string {
    return chartInstance.value?.getDataURL(options) || ''
  }

  watch(
    () => chartOptions.value,
    () => {
      nextTick(() => {
        if (chartInstance.value && Object.keys(chartOptions.value).length > 0) {
          chartInstance.value.setOption(chartOptions.value, true)
        }
      })
    },
    { deep: true }
  )

  onMounted(() => {
    initChart()
    
    if (autoResize) {
      window.addEventListener('resize', resizeChart)
    }
  })

  onUnmounted(() => {
    disposeChart()
    
    if (autoResize) {
      window.removeEventListener('resize', resizeChart)
    }
  })

  return {
    chartRef,
    chartInstance,
    chartOptions,
    initChart,
    setOptions,
    updateOptions,
    resizeChart,
    clearChart,
    disposeChart,
    showLoading,
    hideLoading,
    getDataURL
  }
}
