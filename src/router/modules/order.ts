import type { RouteRecordRaw } from 'vue-router';

const orderRoutes: RouteRecordRaw[] = [
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/order/list',
    meta: {
      title: '订单管理',
      icon: 'Document',
      menu: 'order',
    },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/list/index.vue'),
        meta: {
          title: '订单列表',
          icon: 'List',
          menu: 'order',
          permissions: ['order:list'],
        },
      },
      {
        path: 'detail/:id',
        name: 'OrderDetail',
        component: () => import('@/views/order/detail/index.vue'),
        meta: {
          title: '订单详情',
          icon: 'Document',
          menu: 'order',
          hidden: true,
          permissions: ['order:detail'],
          activeMenu: '/order/list',
        },
      },
    ],
  },
];

export default orderRoutes;
