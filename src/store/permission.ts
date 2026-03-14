import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface PermissionRoute {
  path: string
  name: string
  component?: unknown
  redirect?: string
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
    permissions?: string[]
    breadcrumb?: boolean
  }
  children?: PermissionRoute[]
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<PermissionRoute[]>([])
  const dynamicRoutes = ref<PermissionRoute[]>([])
  const cachedViews = ref<string[]>([])
  const visitedViews = ref<RouteLocationNormalized[]>([])

  const menuRoutes = computed(() => {
    return filterHiddenRoutes(dynamicRoutes.value)
  })

  function filterHiddenRoutes(routeList: PermissionRoute[]): PermissionRoute[] {
    return routeList.filter(route => {
      if (route.meta?.hidden) return false
      if (route.children) {
        route.children = filterHiddenRoutes(route.children)
      }
      return true
    })
  }

  function setRoutes(routeList: PermissionRoute[]): void {
    routes.value = routeList
  }

  function setDynamicRoutes(routeList: PermissionRoute[]): void {
    dynamicRoutes.value = routeList
  }

  function addCachedView(viewName: string): void {
    if (viewName && !cachedViews.value.includes(viewName)) {
      cachedViews.value.push(viewName)
    }
  }

  function removeCachedView(viewName: string): void {
    const index = cachedViews.value.indexOf(viewName)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  function addVisitedView(view: RouteLocationNormalized): void {
    if (visitedViews.value.some(v => v.path === view.path)) return
    visitedViews.value.push(
      Object.assign({}, view, {
        title: view.meta?.title || 'no-name'
      })
    )
  }

  function removeVisitedView(view: RouteLocationNormalized): void {
    const index = visitedViews.value.findIndex(v => v.path === view.path)
    if (index > -1) {
      visitedViews.value.splice(index, 1)
    }
  }

  function closeAllVisitedViews(): void {
    visitedViews.value = []
  }

  function resetState(): void {
    routes.value = []
    dynamicRoutes.value = []
    cachedViews.value = []
    visitedViews.value = []
  }

  return {
    routes,
    dynamicRoutes,
    cachedViews,
    visitedViews,
    menuRoutes,
    setRoutes,
    setDynamicRoutes,
    addCachedView,
    removeCachedView,
    addVisitedView,
    removeVisitedView,
    closeAllVisitedViews,
    resetState
  }
})
