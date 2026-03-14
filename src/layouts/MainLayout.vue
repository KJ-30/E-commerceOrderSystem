<template>
  <div class="main-layout">
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '210px'" class="sidebar">
        <div class="logo">
          <img src="@/assets/images/logo.svg" alt="logo" class="logo-img" />
          <span v-show="!isCollapse" class="logo-text">电商订单管理</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :unique-opened="true"
          router
          class="sidebar-menu"
        >
          <template v-for="route in menuRoutes" :key="route.path">
            <sidebar-item :item="route" :base-path="route.path" />
          </template>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-btn" @click="toggleCollapse">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
            <breadcrumb class="breadcrumb" />
          </div>
          <div class="header-right">
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="username">{{ nickname }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="password">
                    <el-icon><Lock /></el-icon>修改密码
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { User, ArrowDown, Lock, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore, usePermissionStore } from '@/store'
import SidebarItem from './components/SidebarItem.vue'
import Breadcrumb from './components/Breadcrumb.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const isCollapse = ref(false)

const activeMenu = computed(() => route.meta?.activeMenu || route.path)
const menuRoutes = computed(() => permissionStore.menuRoutes)
const cachedViews = computed(() => permissionStore.cachedViews)
const nickname = computed(() => userStore.nickname)
const avatar = computed(() => userStore.avatar)

function toggleCollapse(): void {
  isCollapse.value = !isCollapse.value
}

async function handleCommand(command: string): Promise<void> {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'password':
      router.push('/password')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await userStore.logout()
        ElMessage.success('退出成功')
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style scoped lang="scss">
.main-layout {
  width: 100%;
  height: 100vh;

  .el-container {
    height: 100%;
  }

  .sidebar {
    background-color: #304156;
    transition: width 0.3s;
    overflow: hidden;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 15px;
      background-color: #263445;

      .logo-img {
        width: 32px;
        height: 32px;
      }

      .logo-text {
        margin-left: 10px;
        font-size: 16px;
        font-weight: bold;
        color: #fff;
        white-space: nowrap;
      }
    }

    .sidebar-menu {
      border-right: none;
      background-color: #304156;

      &:not(.el-menu--collapse) {
        width: 210px;
      }
    }
  }

  .header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .header-left {
      display: flex;
      align-items: center;

      .collapse-btn {
        font-size: 20px;
        cursor: pointer;
        color: var(--text-regular);

        &:hover {
          color: var(--primary-color);
        }
      }

      .breadcrumb {
        margin-left: 20px;
      }
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;

        .username {
          margin: 0 8px;
          color: var(--text-primary);
        }
      }
    }
  }

  .main {
    background-color: var(--background-color);
    padding: 20px;
    overflow-y: auto;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
