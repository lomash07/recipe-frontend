<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>Login to Recipe App</h2>
      </template>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleLogin"
      >
        <el-alert
            v-if="authStore.error"
            :title="authStore.error"
            type="error"
            show-icon
            :closable="false"
            style="margin-bottom: 20px"
        />

        <el-form-item label="Username" prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="Username"
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="Password"
              show-password
          />
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" native-type="submit" :loading="authStore.loading">
            Login
          </el-button>
          <div class="register-link">
            Don't have an account?
            <router-link to="/register">Register</router-link>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

export default defineComponent({
  name: 'LoginView',

  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const loginFormRef = ref<FormInstance>();

    const loginForm = reactive({
      username: '',
      password: ''
    });

    const rules = reactive<FormRules>({
      username: [
        { required: true, message: 'Please enter your username', trigger: 'blur' }
      ],
      password: [
        { required: true, message: 'Please enter your password', trigger: 'blur' }
      ]
    });

    const handleLogin = async () => {
      if (!loginFormRef.value) return;

      try {
        await loginFormRef.value.validate(async (valid, fields) => {
          if (valid) {
            try {
              await authStore.login(loginForm);
              ElMessage.success('Login successful');
              router.push('/');
            } catch (error) {
              // Error is already handled in the store
            }
          } else {
            ElMessage.error('Please check your input');
          }
        });
      } catch (error) {
        console.error('Form validation error:', error);
      }
    };

    return {
      loginFormRef,
      loginForm,
      rules,
      authStore,
      handleLogin
    };
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.register-link {
  margin-top: 15px;
  font-size: 14px;
}

.register-link a {
  color: #409EFF;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>