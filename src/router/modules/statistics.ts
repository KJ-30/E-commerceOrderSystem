import type { RouteRecordRaw } from 'vue-router'

const statisticsRoutes: RouteRecordRaw[] = [
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/statistics/dashboard',
    meta: {
      title: '数据统计',
      icon: 'DataAnalysis',
      menu: 'statistics'
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/statistics/index.vue'),
        meta: {
          title: '数据概览',
          icon: 'DataBoard',
          menu: 'statistics',
          permissions: ['statistics:dashboard']
        }
      }
    ]
  }
]

export default statisticsRoutes
