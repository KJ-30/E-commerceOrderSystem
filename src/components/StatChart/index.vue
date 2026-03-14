<template>
  <div ref="chartRef" class="stat-chart" :style="{ width: width, height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

interface Props {
  options: echarts.EChartsOption
  width?: string
  height?: string
  autoResize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  autoResize: true
})

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

function initChart(): void {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(props.options)
}

function updateChart(): void {
  if (!chartInstance) return
  chartInstance.setOption(props.options, true)
}

function resizeChart(): void {
  chartInstance?.resize()
}

function disposeChart(): void {
  chartInstance?.dispose()
  chartInstance = null
}

watch(
  () => props.options,
  () => {
    nextTick(() => {
      updateChart()
    })
  },
  { deep: true }
)

onMounted(() => {
  initChart()
  if (props.autoResize) {
    window.addEventListener('resize', resizeChart)
  }
})

onUnmounted(() => {
  disposeChart()
  if (props.autoResize) {
    window.removeEventListener('resize', resizeChart)
  }
})

defineExpose({
  chartInstance,
  resizeChart,
  updateChart
})
</script>

<style scoped lang="scss">
.stat-chart {
  min-height: 200px;
}
</style>
