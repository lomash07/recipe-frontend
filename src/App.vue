<template>
  <div class="app-container">
    <el-config-provider>
      <el-container>
        <el-header>
          <div class="header-content">
            <h1 class="app-title">Recipe Manager</h1>
            <el-menu mode="horizontal" router :default-active="activeRoute">
              <el-menu-item index="/">Dashboard</el-menu-item>
              <el-menu-item v-if="isAuthenticated" index="/create">Create Recipe</el-menu-item>
              <el-menu-item v-if="isAuthenticated" index="/my-recipes">My Recipes</el-menu-item>
            </el-menu>
            <div class="auth-actions">
              <template v-if="isAuthenticated">
                <el-dropdown trigger="click" @command="handleCommand">
                  <span class="user-dropdown">
                    {{ currentUser?.name }}
                    <el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="logout">Logout</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
              <template v-else>
                <el-button type="text" @click="goToLogin">Login</el-button>
                <el-button type="primary" @click="goToRegister">Register</el-button>
              </template>
            </div>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
        <el-footer>
          <p>© 2025 Recipe Manager App</p>
        </el-footer>
      </el-container>
    </el-config-provider>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/authStore';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'App',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const activeRoute = computed(() => route.path);
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const currentUser = computed(() => authStore.currentUser);

    const handleCommand = (command: string) => {
      if (command === 'logout') {
        authStore.logout();
        ElMessage.success('Logged out successfully');
        router.push('/');
      }
    };

    const goToLogin = () => {
      router.push('/login');
    };

    const goToRegister = () => {
      router.push('/register');
    };

    return {
      activeRoute,
      isAuthenticated,
      currentUser,
      handleCommand,
      goToLogin,
      goToRegister
    };
  }
});
</script>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
}

.el-header {
  padding: 0;
  height: auto !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  flex-wrap: wrap;
}

.app-title {
  margin: 0;
  padding: 10px 0;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #409EFF;
}

.el-footer {
  text-align: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .auth-actions {
    margin-top: 10px;
    align-self: flex-end;
  }
}
</style>