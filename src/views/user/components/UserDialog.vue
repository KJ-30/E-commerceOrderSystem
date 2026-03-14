<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          :disabled="isEdit"
          placeholder="请输入用户名"
        />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色">
          <el-option label="管理员" value="admin" />
          <el-option label="经理" value="manager" />
          <el-option label="操作员" value="operator" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门" prop="department">
        <el-input v-model="form.department" placeholder="请输入部门" />
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
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api'
import { createRules, isEmail, isPhone } from '@/utils'
import type { UserListItem, UserRole } from '@/types/user.d'

interface Props {
  modelValue: boolean
  user: UserListItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const visible = ref(props.modelValue)
const loading = ref(false)
const formRef = ref<FormInstance>()

const isEdit = computed(() => !!props.user)

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  role: '' as UserRole | '',
  department: ''
})

const rules: FormRules = {
  username: [
    createRules.required('请输入用户名'),
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    createRules.required('请输入密码'),
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  nickname: [
    createRules.required('请输入昵称')
  ],
  email: [
    createRules.required('请输入邮箱'),
    {
      validator: (_rule, value, callback) => {
        if (!isEmail(value)) {
          callback(new Error('请输入正确的邮箱地址'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    createRules.required('请输入手机号'),
    {
      validator: (_rule, value, callback) => {
        if (!isPhone(value)) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  role: [
    createRules.required('请选择角色')
  ],
  department: [
    createRules.required('请输入部门')
  ]
}

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.user) {
      Object.assign(form, {
        username: props.user.username,
        password: '',
        nickname: props.user.nickname,
        email: props.user.email,
        phone: props.user.phone,
        role: props.user.role,
        department: props.user.department
      })
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function handleClosed(): void {
  formRef.value?.resetFields()
  Object.assign(form, {
    username: '',
    password: '',
    nickname: '',
    email: '',
    phone: '',
    role: '',
    department: ''
  })
}

async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    if (isEdit.value && props.user) {
      await userApi.updateUser({
        id: props.user.id,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        role: form.role as UserRole,
        department: form.department
      })
      ElMessage.success('更新成功')
    } else {
      await userApi.createUser({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        role: form.role as UserRole,
        department: form.department
      })
      ElMessage.success('创建成功')
    }
    visible.value = false
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>
