import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/user/list',
    meta: {
      title: '用户管理',
      icon: 'User',
      menu: 'user'
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/user/index.vue'),
        meta: {
          title: '用户列表',
          icon: 'UserFilled',
          menu: 'user',
          permissions: ['user:list']
        }
      },
      {
        path: 'role',
        name: 'RoleManagement',
        component: () => import('@/views/user/role.vue'),
        meta: {
          title: '角色管理',
          icon: 'Avatar',
          menu: 'user',
          permissions: ['user:role']
        }
      }
    ]
  }
]

export default userRoutes
