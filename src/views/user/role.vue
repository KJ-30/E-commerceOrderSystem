<template>
  <div class="role-management">
    <div class="role-header">
      <h3 class="title">角色管理</h3>
      <el-button
        v-if="hasPermission('user:role:create')"
        type="primary"
        @click="handleAdd"
      >
        <el-icon><Plus /></el-icon>新增角色
      </el-button>
    </div>

    <div class="role-list">
      <el-card
        v-for="role in roleList"
        :key="role.key"
        class="role-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <div class="role-info">
              <el-tag :type="getRoleColor(role.key)" size="large">
                {{ role.name }}
              </el-tag>
              <span class="role-key">({{ role.key }})</span>
            </div>
            <div class="role-actions">
              <el-button
                v-if="hasPermission('user:role:edit')"
                type="primary"
                link
                @click="handleEdit(role)"
              >
                编辑权限
              </el-button>
              <el-button
                v-if="!isBuiltinRole(role.key) && hasPermission('user:role:delete')"
                type="danger"
                link
                @click="handleDelete(role)"
              >
                删除
              </el-button>
            </div>
          </div>
        </template>
        
        <p class="role-description">{{ role.description }}</p>
        
        <div class="permission-section">
          <h4 class="section-title">菜单权限</h4>
          <div class="permission-tags">
            <el-tag
              v-for="menu in role.menus"
              :key="menu"
              type="info"
              size="small"
              class="permission-tag"
            >
              {{ getMenuText(menu) }}
            </el-tag>
          </div>
        </div>
        
        <div class="permission-section">
          <h4 class="section-title">操作权限</h4>
          <div class="permission-tags">
            <el-tag
              v-for="permission in role.permissions"
              :key="permission"
              size="small"
              class="permission-tag"
            >
              {{ permission }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色权限' : '新增角色'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="key">
          <el-input
            v-model="form.key"
            placeholder="请输入角色标识（英文）"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="菜单权限" prop="menus">
          <el-checkbox-group v-model="form.menus">
            <el-checkbox
              v-for="menu in menuOptions"
              :key="menu.value"
              :label="menu.value"
            >
              {{ menu.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="操作权限" prop="permissions">
          <el-checkbox-group v-model="form.permissions">
            <div class="permission-group">
              <h5>订单权限</h5>
              <el-checkbox
                v-for="permission in orderPermissions"
                :key="permission.value"
                :label="permission.value"
              >
                {{ permission.label }}
              </el-checkbox>
            </div>
            <div class="permission-group">
              <h5>用户权限</h5>
              <el-checkbox
                v-for="permission in userPermissions"
                :key="permission.value"
                :label="permission.value"
              >
                {{ permission.label }}
              </el-checkbox>
            </div>
            <div class="permission-group">
              <h5>统计权限</h5>
              <el-checkbox
                v-for="permission in statisticsPermissions"
                :key="permission.value"
                :label="permission.value"
              >
                {{ permission.label }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAuth } from '@/hooks'
import { ROLE_PERMISSIONS, UserRole } from '@/types/user.d'
import type { RoleConfig } from '@/types/user.d'

const { hasPermission } = useAuth()

const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const roleList = ref<RoleConfig[]>([])

const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  key: '' as UserRole | string,
  description: '',
  menus: [] as string[],
  permissions: [] as string[]
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  key: [
    { required: true, message: '请输入角色标识', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '角色标识只能包含小写字母和下划线', trigger: 'blur' }
  ],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
}

const menuOptions = [
  { label: '订单管理', value: 'order' },
  { label: '用户管理', value: 'user' },
  { label: '数据统计', value: 'statistics' }
]

const orderPermissions = [
  { label: '查看订单列表', value: 'order:list' },
  { label: '查看订单详情', value: 'order:detail' },
  { label: '编辑订单', value: 'order:edit' },
  { label: '删除订单', value: 'order:delete' },
  { label: '导出订单', value: 'order:export' }
]

const userPermissions = [
  { label: '查看用户列表', value: 'user:list' },
  { label: '创建用户', value: 'user:create' },
  { label: '编辑用户', value: 'user:edit' },
  { label: '删除用户', value: 'user:delete' },
  { label: '分配角色', value: 'user:assign-role' },
  { label: '重置密码', value: 'user:reset-password' },
  { label: '角色管理', value: 'user:role' }
]

const statisticsPermissions = [
  { label: '查看统计概览', value: 'statistics:dashboard' },
  { label: '查看统计数据', value: 'statistics:view' }
]

function getRoleColor(role: UserRole | string): string {
  const colorMap: Record<string, string> = {
    [UserRole.ADMIN]: 'danger',
    [UserRole.MANAGER]: 'warning',
    [UserRole.OPERATOR]: 'success',
    [UserRole.SERVICE]: 'info'
  }
  return colorMap[role] || 'info'
}

function getMenuText(menu: string): string {
  const map: Record<string, string> = {
    order: '订单管理',
    user: '用户管理',
    statistics: '数据统计',
    '*': '所有菜单'
  }
  return map[menu] || menu
}

function isBuiltinRole(key: string): boolean {
  return [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR, UserRole.SERVICE].includes(key as UserRole)
}

function fetchRoleList(): void {
  roleList.value = Object.values(ROLE_PERMISSIONS)
}

function handleAdd(): void {
  isEdit.value = false
  Object.assign(form, {
    name: '',
    key: '',
    description: '',
    menus: [],
    permissions: []
  })
  dialogVisible.value = true
}

function handleEdit(role: RoleConfig): void {
  isEdit.value = true
  Object.assign(form, {
    name: role.name,
    key: role.key,
    description: role.description,
    menus: [...role.menus],
    permissions: [...role.permissions]
  })
  dialogVisible.value = true
}

async function handleDelete(role: RoleConfig): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('删除成功（模拟）')
    fetchRoleList()
  } catch {
    // 用户取消
  }
}

async function handleSubmit(): Promise<void> {
  const valid = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success(isEdit.value ? '角色更新成功' : '角色创建成功')
    dialogVisible.value = false
    fetchRoleList()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped lang="scss">
.role-management {
  .role-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background: #fff;
    padding: 15px 20px;
    border-radius: 4px;

    .title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }
  }

  .role-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;

    .role-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .role-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .role-key {
            font-size: 12px;
            color: var(--text-secondary);
          }
        }
      }

      .role-description {
        color: var(--text-regular);
        margin-bottom: 15px;
      }

      .permission-section {
        margin-bottom: 15px;

        .section-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .permission-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;

          .permission-tag {
            margin: 0;
          }
        }
      }
    }
  }

  .permission-group {
    margin-bottom: 15px;

    h5 {
      margin: 0 0 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .el-checkbox {
      margin-right: 15px;
      margin-bottom: 8px;
    }
  }
}
</style>
