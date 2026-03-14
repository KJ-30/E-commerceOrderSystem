<template>
  <el-dialog
    v-model="visible"
    title="订单发货"
    width="500px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="快递公司" prop="expressCompany">
        <el-select v-model="form.expressCompany" placeholder="请选择快递公司">
          <el-option
            v-for="item in expressCompanies"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="快递单号" prop="expressNo">
        <el-input v-model="form.expressNo" placeholder="请输入快递单号" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注（选填）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { orderApi } from '@/api'

interface Props {
  modelValue: boolean
  orderId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  expressCompany: '',
  expressNo: '',
  remark: ''
})

const rules: FormRules = {
  expressCompany: [
    { required: true, message: '请选择快递公司', trigger: 'change' }
  ],
  expressNo: [
    { required: true, message: '请输入快递单号', trigger: 'blur' }
  ]
}

const expressCompanies = [
  { label: '顺丰速运', value: 'sf' },
  { label: '中通快递', value: 'zt' },
  { label: '圆通速递', value: 'yt' },
  { label: '韵达快递', value: 'yd' },
  { label: '申通快递', value: 'st' },
  { label: '邮政EMS', value: 'ems' },
  { label: '京东物流', value: 'jd' }
]

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleClosed(): void {
  formRef.value?.resetFields()
  Object.assign(form, {
    expressCompany: '',
    expressNo: '',
    remark: ''
  })
}

async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await orderApi.shipOrder(props.orderId, form.expressCompany, form.expressNo)
    ElMessage.success('发货成功')
    visible.value = false
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>
