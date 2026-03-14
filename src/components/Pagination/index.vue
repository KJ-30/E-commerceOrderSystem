<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      :layout="layout"
      :background="background"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  page?: number
  limit?: number
  total?: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  page: 1,
  limit: 10,
  total: 0,
  pageSizes: () => [10, 20, 30, 50],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true
})

const emit = defineEmits<{
  'update:page': [value: number]
  'update:limit': [value: number]
  pagination: [page: number, limit: number]
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const pageSize = computed({
  get: () => props.limit,
  set: (val) => emit('update:limit', val)
})

function handleSizeChange(val: number): void {
  emit('pagination', currentPage.value, val)
}

function handleCurrentChange(val: number): void {
  emit('pagination', val, pageSize.value)
}
</script>

<style scoped lang="scss">
.pagination-wrapper {
  padding: 20px 0;
  display: flex;
  justify-content: flex-end;
}
</style>
