<template>
  <el-dialog
    :model-value="modelValue"
    :title="`分配角色 - ${user?.username || ''}`"
    width="500px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="当前角色">
        <el-tag :type="getRoleColor(user?.role || '')">
          {{ getRoleText(user?.role || '') }}
        </el-tag>
      </el-form-item>
      <el-form-item label="选择角色" prop="role">
        <el-radio-group v-model="form.role">
          <el-radio
            v-for="role in roleOptions"
            :key="role.value"
            :label="role.value"
            :disabled="role.value === 'admin' && user?.username !== 'admin'"
          >
            <div class="role-option">
              <span class="role-name">{{ role.label }}</span>
              <span class="role-desc">{{ role.description }}</span>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="权限预览">
        <div class="permission-preview">
          <el-tag
            v-for="permission in currentPermissions"
            :key="permission"
            size="small"
            class="permission-tag"
          >
            {{ permission }}
          </el-tag>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
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
import { getUserRoleText } from '@/utils'
import { ROLE_PERMISSIONS, UserRole } from '@/types/user.d'
import type { UserListItem, UserRole as UserRoleType } from '@/types/user.d'

const props = defineProps<{
  modelValue: boolean
  user: UserListItem | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  role: '' as UserRoleType
})

const rules: FormRules = {
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const roleOptions = Object.values(ROLE_PERMISSIONS).map(config => ({
  label: config.name,
  value: config.key,
  description: config.description
}))

const currentPermissions = computed(() => {
  if (!form.role) return []
  const config = ROLE_PERMISSIONS[form.role]
  return config?.permissions || []
})

function getRoleText(role: UserRoleType): string {
  return getUserRoleText(role)
}

function getRoleColor(role: UserRoleType): string {
  const colorMap: Record<UserRoleType, string> = {
    [UserRole.ADMIN]: 'danger',
    [UserRole.MANAGER]: 'warning',
    [UserRole.OPERATOR]: 'success',
    [UserRole.SERVICE]: 'info'
  }
  return colorMap[role] || 'info'
}

watch(() => props.modelValue, (val) => {
  if (val && props.user) {
    form.role = props.user.role
  }
})

async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate()
  if (!valid) return

  if (!props.user) return

  loading.value = true
  try {
    await userApi.updateUser({
      id: props.user.id,
      role: form.role
    })
    ElMessage.success('角色分配成功')
    emit('update:modelValue', false)
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.role-option {
  display: flex;
  flex-direction: column;
  
  .role-name {
    font-weight: 500;
  }
  
  .role-desc {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.permission-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .permission-tag {
    margin: 0;
  }
}
</style>
