<template>
  <template v-if="!item.meta?.hidden">
    <template v-if="!item.children || item.children.length === 0">
      <el-menu-item :index="resolvePath(item.path)">
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <template #title>{{ item.meta?.title }}</template>
      </el-menu-item>
    </template>
    <template v-else-if="item.children.length === 1 && !item.children[0].children">
      <el-menu-item :index="resolvePath(item.children[0].path)">
        <el-icon v-if="item.children[0].meta?.icon || item.meta?.icon">
          <component :is="item.children[0].meta?.icon || item.meta?.icon" />
        </el-icon>
        <template #title>{{ item.children[0].meta?.title || item.meta?.title }}</template>
      </el-menu-item>
    </template>
    <template v-else>
      <el-sub-menu :index="resolvePath(item.path)">
        <template #title>
          <el-icon v-if="item.meta?.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <span>{{ item.meta?.title }}</span>
        </template>
        <sidebar-item
          v-for="child in item.children"
          :key="child.path"
          :item="child"
          :base-path="resolvePath(item.path)"
        />
      </el-sub-menu>
    </template>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

interface Props {
  item: RouteRecordRaw
  basePath?: string
}

const props = defineProps<Props>()

function resolvePath(path: string): string {
  if (path.startsWith('/')) {
    return path
  }
  if (props.basePath) {
    const base = props.basePath.endsWith('/') ? props.basePath.slice(0, -1) : props.basePath
    return `${base}/${path}`
  }
  return `/${path}`
}
</script>
