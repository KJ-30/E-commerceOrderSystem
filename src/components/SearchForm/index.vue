<template>
  <div class="search-form">
    <el-form
      ref="formRef"
      :model="modelValue"
      :inline="true"
      :label-width="labelWidth"
      @submit.prevent="handleSearch"
    >
      <slot />
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>查询
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
        <slot name="extra" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface Props {
  modelValue: Record<string, unknown>
  labelWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: 'auto'
})

const emit = defineEmits<{
  search: []
  reset: []
  'update:modelValue': [value: Record<string, unknown>]
}>()

const formRef = ref<FormInstance>()

function handleSearch(): void {
  emit('search')
}

function handleReset(): void {
  formRef.value?.resetFields()
  emit('reset')
}

defineExpose({
  formRef
})
</script>

<style scoped lang="scss">
.search-form {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 20px;

  :deep(.el-form-item) {
    margin-bottom: 10px;
  }
}
</style>
