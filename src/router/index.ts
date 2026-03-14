import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore, usePermissionStore } from '@/store';
import orderRoutes from './modules/order';
import userRoutes from './modules/user';
import statisticsRoutes from './modules/statistics';

const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true,
    },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权限',
      hidden: true,
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404',
      hidden: true,
    },
  },
];

const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/statistics/dashboard',
    meta: {
      title: '首页',
      icon: 'HomeFilled',
    },
  },
  ...orderRoutes,
  ...userRoutes,
  ...statisticsRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      hidden: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

const whiteList = ['/login', '/404', '/403'];

function filterRoutesByRole(routes: RouteRecordRaw[], accessibleMenus: string[]): RouteRecordRaw[] {
  if (accessibleMenus.includes('*')) return routes;

  return routes
    .filter((route) => {
      const menuKey = route.meta?.menu as string | undefined;
      if (!menuKey) return true;
      return accessibleMenus.includes(menuKey);
    })
    .map((route) => {
      if (route.children) {
        return {
          ...route,
          children: filterRoutesByRole(route.children, accessibleMenus),
        };
      }
      return route;
    });
}

router.beforeEach(async (to, _from, next) => {
  document.title = `${to.meta?.title || ''} - 电商订单管理系统`;

  const userStore = useUserStore();
  const permissionStore = usePermissionStore();

  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' });
    } else {
      if (!userStore.userInfo) {
        try {
          await userStore.fetchUserInfo();

          const accessibleMenus = userStore.getAccessibleMenus();
          const filteredRoutes = filterRoutesByRole(dynamicRoutes, accessibleMenus);

          permissionStore.setDynamicRoutes(filteredRoutes as never);

          filteredRoutes.forEach((route) => {
            if (!router.hasRoute(route.name as string)) {
              router.addRoute(route);
            }
          });

          next({ ...to, replace: true });
        } catch {
          userStore.resetState();
          next(`/login?redirect=${to.path}`);
        }
      } else {
        const permissions = to.meta?.permissions as string[] | undefined;
        if (permissions && permissions.length > 0) {
          if (userStore.hasAnyPermissions(permissions)) {
            next();
          } else {
            next('/403');
          }
        } else {
          next();
        }
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
    }
  }
});

router.afterEach((to) => {
  const permissionStore = usePermissionStore();
  if (to.name) {
    permissionStore.addVisitedView(to);
    if (to.meta?.keepAlive) {
      permissionStore.addCachedView(to.name as string);
    }
  }
});

export default router;
