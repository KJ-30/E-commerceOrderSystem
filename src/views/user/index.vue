<template>
  <div class="user-management">
    <search-form v-model="searchForm" @search="handleSearch" @reset="handleReset">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="searchForm.role" placeholder="请选择角色" clearable>
          <el-option v-for="role in roleOptions" :key="role.value" :label="role.label" :value="role.value" />
        </el-select>
      </el-form-item>
    </search-form>

    <div class="table-wrapper">
      <div class="table-header">
        <h3 class="table-title">用户列表</h3>
        <div class="table-actions">
          <el-button v-if="hasPermission('user:create')" type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增用户
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="userList" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130">
          <template #default="{ row }">
            {{ formatPhone(row.phone) }}
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleColor(row.role)">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" :disabled="!hasPermission('user:edit')" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button v-if="hasPermission('user:edit')" type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button v-if="hasPermission('user:assign-role')" type="warning" link @click="handleAssignRole(row)"> 分配角色 </el-button>
            <el-button v-if="hasPermission('user:reset-password')" type="info" link @click="handleResetPassword(row)"> 重置密码 </el-button>
            <el-button v-if="hasPermission('user:delete') && row.username !== 'admin'" type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-model:page="pagination.page" v-model:limit="pagination.pageSize" :total="pagination.total" @pagination="handlePagination" />
    </div>

    <user-dialog v-model="dialogVisible" :user="currentUser" @success="handleDialogSuccess" />

    <role-assign-dialog v-model="roleDialogVisible" :user="currentUser" @success="handleDialogSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { SearchForm, Pagination } from '@/components';
import { userApi } from '@/api';
import { useAuth } from '@/hooks';
import { formatDateTime, formatPhone, getUserRoleText } from '@/utils';
import { ROLE_PERMISSIONS, UserRole } from '@/types/user.d';
import type { UserListItem, UserRole as UserRoleType, UserStatus } from '@/types/user.d';
import UserDialog from './components/UserDialog.vue';
import RoleAssignDialog from './components/RoleAssignDialog.vue';

const { hasPermission } = useAuth();

const loading = ref(false);
const userList = ref<UserListItem[]>([]);
const selectedRows = ref<UserListItem[]>([]);
const dialogVisible = ref(false);
const roleDialogVisible = ref(false);
const currentUser = ref<UserListItem | null>(null);

const searchForm = reactive({
  username: '',
  status: '' as UserStatus | '',
  role: '' as UserRoleType | '',
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const roleOptions = Object.values(ROLE_PERMISSIONS).map((config) => ({
  label: config.name,
  value: config.key,
}));

function getRoleText(role: UserRoleType): string {
  return getUserRoleText(role);
}

function getRoleColor(role: UserRoleType): string {
  const colorMap: Record<UserRoleType, string> = {
    [UserRole.ADMIN]: 'danger',
    [UserRole.MANAGER]: 'warning',
    [UserRole.OPERATOR]: 'success',
    [UserRole.SERVICE]: 'info',
  };
  return colorMap[role] || 'info';
}

async function fetchUserList(): Promise<void> {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    };
    const result = await userApi.getUserList(params);
    userList.value = result.list;
    pagination.total = result.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch(): void {
  pagination.page = 1;
  fetchUserList();
}

function handleReset(): void {
  Object.assign(searchForm, {
    username: '',
    status: '',
    role: '',
  });
  handleSearch();
}

function handlePagination(page: number, pageSize: number): void {
  pagination.page = page;
  pagination.pageSize = pageSize;
  fetchUserList();
}

function handleSelectionChange(rows: UserListItem[]): void {
  selectedRows.value = rows;
}

function handleAdd(): void {
  currentUser.value = null;
  dialogVisible.value = true;
}

function handleEdit(row: UserListItem): void {
  currentUser.value = { ...row };
  dialogVisible.value = true;
}

function handleAssignRole(row: UserListItem): void {
  currentUser.value = { ...row };
  roleDialogVisible.value = true;
}

async function handleStatusChange(row: UserListItem): Promise<void> {
  try {
    await userApi.updateUser({
      id: row.id,
      status: row.status,
    });
    ElMessage.success('状态更新成功');
  } catch {
    row.status = row.status === 1 ? 0 : 1;
  }
}

async function handleResetPassword(row: UserListItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要重置用户 "${row.username}" 的密码吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await userApi.resetPassword(row.id);
    ElMessage.success('密码已重置为默认密码');
  } catch {
    // 用户取消
  }
}

async function handleDelete(row: UserListItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await userApi.deleteUser(row.id);
    ElMessage.success('删除成功');
    fetchUserList();
  } catch {
    // 用户取消
  }
}

function handleDialogSuccess(): void {
  fetchUserList();
}

onMounted(() => {
  fetchUserList();
});
</script>

<style scoped lang="scss">
.user-management {
  .table-wrapper {
    background: #fff;
    border-radius: 4px;
    padding: 20px;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .table-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }
    }
  }
}
</style>
