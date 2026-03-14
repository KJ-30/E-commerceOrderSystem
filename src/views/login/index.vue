<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/images/logo.svg" alt="logo" class="logo" />
        <h2 class="title">电商订单管理系统</h2>
        <p class="subtitle">E-Commerce Order Management System</p>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" size="large" clearable />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" show-password @keyup.enter="handleLogin" />
        </el-form-item>

        <el-form-item prop="role">
          <el-select v-model="loginForm.role" placeholder="请选择登录角色" size="large" style="width: 100%">
            <el-option v-for="role in roleOptions" :key="role.value" :label="role.label" :value="role.value">
              <div class="role-option">
                <span class="role-name">{{ role.label }}</span>
                <span class="role-desc">{{ role.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <div class="remember-row">
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
            <el-checkbox v-model="autoLogin">自动登录</el-checkbox>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <el-divider>演示账号</el-divider>
        <div class="demo-accounts">
          <div v-for="account in demoAccounts" :key="account.username" class="demo-account-item" @click="fillDemoAccount(account)">
            <el-tag :type="account.tagType" size="small">{{ account.roleName }}</el-tag>
            <span class="account-info">{{ account.username }} / {{ account.password }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="login-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useAuth } from '@/hooks';
import { localStore } from '@/utils';
import { UserRole } from '@/types/user.d';
import type { LoginParams } from '@/types/user.d';

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);
const autoLogin = ref(false);

const loginForm = reactive<LoginParams & { role: string }>({
  username: '',
  password: '',
  role: 'admin',
});

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择登录角色', trigger: 'change' }],
};

const roleOptions = [
  { value: 'admin', label: '管理员', description: '拥有系统所有权限' },
  { value: 'manager', label: '运营', description: '可管理订单和查看统计' },
  { value: 'operator', label: '普通运营', description: '可查看和编辑订单' },
  { value: 'service', label: '客服', description: '仅可查看订单列表' },
];

const demoAccounts = [
  { username: 'admin', password: '123456', role: 'admin', roleName: '管理员', tagType: 'danger' as const },
  { username: 'manager', password: '123456', role: 'manager', roleName: '运营', tagType: 'warning' as const },
  { username: 'operator', password: '123456', role: 'operator', roleName: '普通运营', tagType: 'success' as const },
  { username: 'service', password: '123456', role: 'service', roleName: '客服', tagType: 'info' as const },
];

const { login } = useAuth();

function fillDemoAccount(account: (typeof demoAccounts)[0]): void {
  loginForm.username = account.username;
  loginForm.password = account.password;
  loginForm.role = account.role;
}

async function handleLogin(): Promise<void> {
  const valid = await loginFormRef.value?.validate();
  if (!valid) return;

  loading.value = true;

  try {
    if (rememberMe.value) {
      localStore.set('rememberedUsername', loginForm.username);
      localStore.set('rememberedRole', loginForm.role);
      localStore.set('rememberMe', true);
    } else {
      localStore.remove('rememberedUsername');
      localStore.remove('rememberedRole');
      localStore.set('rememberMe', false);
    }

    localStore.set('autoLogin', autoLogin.value);

    await login({
      username: loginForm.username,
      password: loginForm.password,
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const rememberedUsername = localStore.get<string>('rememberedUsername');
  const rememberedRole = localStore.get<string>('rememberedRole');
  const remembered = localStore.get<boolean>('rememberMe');
  const autoLoginSaved = localStore.get<boolean>('autoLogin');

  if (rememberedUsername) {
    loginForm.username = rememberedUsername;
  }
  if (rememberedRole) {
    loginForm.role = rememberedRole;
  }
  if (remembered) {
    rememberMe.value = remembered;
  }
  if (autoLoginSaved) {
    autoLogin.value = autoLoginSaved;
  }
});
</script>

<style scoped lang="scss">
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  .login-box {
    width: 420px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 10;
  }

  .login-header {
    text-align: center;
    margin-bottom: 30px;

    .logo {
      width: 60px;
      height: 60px;
      margin-bottom: 15px;
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px;
    }

    .subtitle {
      font-size: 12px;
      color: #999;
      margin: 0;
    }
  }

  .login-form {
    .role-option {
      display: flex;
      flex-direction: column;

      .role-name {
        font-weight: 500;
      }

      .role-desc {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }

    .remember-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .login-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
    }
  }

  .login-footer {
    margin-top: 20px;

    .demo-accounts {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .demo-account-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        background: var(--background-color);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--primary-color);
          color: #fff;

          .account-info {
            color: #fff;
          }
        }

        .account-info {
          font-size: 13px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .login-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .bg-shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
    }

    .shape-1 {
      width: 400px;
      height: 400px;
      background: #fff;
      top: -100px;
      right: -100px;
    }

    .shape-2 {
      width: 300px;
      height: 300px;
      background: #fff;
      bottom: -50px;
      left: -50px;
    }

    .shape-3 {
      width: 200px;
      height: 200px;
      background: #fff;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>
