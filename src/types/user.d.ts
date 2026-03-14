/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  SERVICE = 'service',
}

/**
 * 角色配置接口
 */
export interface RoleConfig {
  key: UserRole;
  name: string;
  description: string;
  permissions: string[];
  menus: string[];
}

/**
 * 角色权限映射
 */
export const ROLE_PERMISSIONS: Record<UserRole, RoleConfig> = {
  [UserRole.ADMIN]: {
    key: UserRole.ADMIN,
    name: '管理员',
    description: '拥有系统所有权限',
    permissions: ['*'],
    menus: ['*'],
  },
  [UserRole.MANAGER]: {
    key: UserRole.MANAGER,
    name: '运营',
    description: '可管理订单和查看统计',
    permissions: ['order:list', 'order:detail', 'order:edit', 'order:export', 'statistics:dashboard', 'statistics:view'],
    menus: ['order', 'statistics'],
  },
  [UserRole.OPERATOR]: {
    key: UserRole.OPERATOR,
    name: '普通运营',
    description: '可查看和编辑订单',
    permissions: ['order:list', 'order:detail', 'order:edit'],
    menus: ['order'],
  },
  [UserRole.SERVICE]: {
    key: UserRole.SERVICE,
    name: '客服',
    description: '仅可查看订单列表',
    permissions: ['order:list', 'order:detail'],
    menus: ['order'],
  },
};

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 0,
}

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string;
  password: string;
  captcha?: string;
}

/**
 * 登录响应数据
 */
export interface LoginResult {
  token: string;
  userInfo: UserInfo;
  permissions: string[];
}

/**
 * 用户列表查询参数
 */
export interface UserQueryParams {
  page: number;
  pageSize: number;
  username?: string;
  status?: UserStatus;
  role?: UserRole;
}

/**
 * 用户列表项
 */
export interface UserListItem {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  department: string;
  createdAt: string;
}

/**
 * 分页响应结构
 */
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 创建用户参数
 */
export interface CreateUserParams {
  username: string;
  password: string;
  nickname: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
}

/**
 * 更新用户参数
 */
export interface UpdateUserParams {
  id: number;
  nickname?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
}
