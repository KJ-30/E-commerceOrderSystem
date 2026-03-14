import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store';
import { ROLE_PERMISSIONS, UserRole } from '@/types/user.d';
import type { LoginParams, RoleConfig } from '@/types/user.d';

export function useAuth() {
  const router = useRouter();
  const userStore = useUserStore();

  const loading = ref(false);
  const error = ref<string | null>(null);

  const isLoggedIn = computed(() => userStore.isLoggedIn);
  const userInfo = computed(() => userStore.userInfo);
  const permissions = computed(() => userStore.permissions);
  const role = computed(() => userStore.role);
  const roleName = computed(() => userStore.roleName);
  const isAdmin = computed(() => userStore.isAdmin);
  const isManager = computed(() => userStore.isManager);
  const isOperator = computed(() => userStore.isOperator);
  const isService = computed(() => userStore.isService);

  async function login(params: LoginParams): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      await userStore.login(params);
      ElMessage.success('登录成功');

      const redirect = router.currentRoute.value.query.redirect as string;
      router.push(redirect || '/');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败';
      error.value = message;
      ElMessage.error(message);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await userStore.logout();
      ElMessage.success('退出成功');
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : '退出失败';
      ElMessage.error(message);
    }
  }

  function hasPermission(permission: string): boolean {
    return userStore.hasPermission(permission);
  }

  function hasAnyPermissions(permissionList: string[]): boolean {
    return userStore.hasAnyPermissions(permissionList);
  }

  function hasAllPermissions(permissionList: string[]): boolean {
    return userStore.hasAllPermissions(permissionList);
  }

  function canAccessMenu(menu: string): boolean {
    return userStore.canAccessMenu(menu);
  }

  function getRoleConfig(): RoleConfig | null {
    if (!role.value) return null;
    return ROLE_PERMISSIONS[role.value] || null;
  }

  function getAllRoles(): Array<{ key: UserRole; name: string; description: string }> {
    return Object.values(ROLE_PERMISSIONS).map((config) => ({
      key: config.key,
      name: config.name,
      description: config.description,
    }));
  }

  function checkRoutePermission(toPath: string): boolean {
    const route = router.resolve(toPath);
    const permissions = route.meta?.permissions as string[] | undefined;
    if (!permissions || permissions.length === 0) return true;
    return hasAnyPermissions(permissions);
  }

  return {
    loading,
    error,
    isLoggedIn,
    userInfo,
    permissions,
    role,
    roleName,
    isAdmin,
    isManager,
    isOperator,
    isService,
    login,
    logout,
    hasPermission,
    hasAnyPermissions,
    hasAllPermissions,
    canAccessMenu,
    getRoleConfig,
    getAllRoles,
    checkRoutePermission,
  };
}
