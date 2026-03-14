import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userApi } from '@/api';
import { localStore } from '@/utils';
import { ROLE_PERMISSIONS, UserRole } from '@/types/user.d';
import type { UserInfo, LoginParams, LoginResult } from '@/types/user.d';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStore.get<string>('token') || '');
  const userInfo = ref<UserInfo | null>(localStore.get<UserInfo>('userInfo') || null);
  const permissions = ref<string[]>(localStore.get<string[]>('permissions') || []);
  const rememberMe = ref<boolean>(localStore.get<boolean>('rememberMe') || false);

  const isLoggedIn = computed(() => !!token.value);
  const username = computed(() => userInfo.value?.username || '');
  const nickname = computed(() => userInfo.value?.nickname || '');
  const avatar = computed(() => userInfo.value?.avatar || '');
  const role = computed(() => userInfo.value?.role);
  const roleName = computed(() => {
    if (!role.value) return '';
    return ROLE_PERMISSIONS[role.value]?.name || role.value;
  });
  const isAdmin = computed(() => role.value === UserRole.ADMIN);
  const isManager = computed(() => role.value === UserRole.MANAGER);
  const isOperator = computed(() => role.value === UserRole.OPERATOR);
  const isService = computed(() => role.value === UserRole.SERVICE);

  async function login(params: LoginParams): Promise<LoginResult> {
    const result = await userApi.login(params);
    token.value = result.token;
    userInfo.value = result.userInfo;

    const roleConfig = ROLE_PERMISSIONS[result.userInfo.role];
    permissions.value = roleConfig?.permissions || result.permissions;

    localStore.set('token', result.token);
    localStore.set('userInfo', result.userInfo);
    localStore.set('permissions', permissions.value);

    return result;
  }

  async function logout(): Promise<void> {
    try {
      await userApi.logout();
    } finally {
      resetState();
    }
  }

  async function fetchUserInfo(): Promise<UserInfo> {
    const info = await userApi.getCurrentUser();
    userInfo.value = info;

    const roleConfig = ROLE_PERMISSIONS[info.role];
    permissions.value = roleConfig?.permissions || [];

    localStore.set('userInfo', info);
    localStore.set('permissions', permissions.value);
    return info;
  }

  function setRememberMe(value: boolean): void {
    rememberMe.value = value;
    localStore.set('rememberMe', value);
  }

  function resetState(): void {
    token.value = '';
    userInfo.value = null;
    permissions.value = [];
    localStore.remove('token');
    localStore.remove('userInfo');
    localStore.remove('permissions');
  }

  function hasPermission(permission: string): boolean {
    if (permissions.value.includes('*')) return true;
    return permissions.value.includes(permission);
  }

  function hasAnyPermissions(permissionList: string[]): boolean {
    if (permissions.value.includes('*')) return true;
    return permissionList.some((p) => hasPermission(p));
  }

  function hasAllPermissions(permissionList: string[]): boolean {
    if (permissions.value.includes('*')) return true;
    return permissionList.every((p) => hasPermission(p));
  }

  function canAccessMenu(menu: string): boolean {
    if (!userInfo.value) return false;
    const roleConfig = ROLE_PERMISSIONS[userInfo.value.role];
    if (!roleConfig) return false;
    if (roleConfig.menus.includes('*')) return true;
    return roleConfig.menus.includes(menu);
  }

  function getAccessibleMenus(): string[] {
    if (!userInfo.value) return [];
    const roleConfig = ROLE_PERMISSIONS[userInfo.value.role];
    return roleConfig?.menus || [];
  }

  return {
    token,
    userInfo,
    permissions,
    rememberMe,
    isLoggedIn,
    username,
    nickname,
    avatar,
    role,
    roleName,
    isAdmin,
    isManager,
    isOperator,
    isService,
    login,
    logout,
    fetchUserInfo,
    setRememberMe,
    resetState,
    hasPermission,
    hasAnyPermissions,
    hasAllPermissions,
    canAccessMenu,
    getAccessibleMenus,
  };
});
