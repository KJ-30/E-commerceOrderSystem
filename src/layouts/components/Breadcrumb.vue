<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      <span v-if="item.redirect === 'noRedirect' || item === breadcrumbs[breadcrumbs.length - 1]">
        {{ item.meta?.title }}
      </span>
      <router-link v-else :to="item.path">
        {{ item.meta?.title }}
      </router-link>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, type RouteLocationMatched } from 'vue-router'

const route = useRoute()
const breadcrumbs = ref<RouteLocationMatched>([])

function getBreadcrumbs(): void {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  breadcrumbs.value = matched
}

watch(
  () => route.path,
  () => {
    getBreadcrumbs()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.breadcrumb {
  font-size: 14px;

  a {
    color: var(--text-regular);
    transition: color 0.2s;

    &:hover {
      color: var(--primary-color);
    }
  }
}
</style>
