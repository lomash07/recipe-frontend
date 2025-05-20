<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2>Create an Account</h2>
      </template>

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleRegister"
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
          <el-input v-model="registerForm.username" placeholder="Username" />
        </el-form-item>

        <el-form-item label="Name" prop="name">
          <el-input v-model="registerForm.name" placeholder="Your full name" />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input v-model="registerForm.email" placeholder="Email address" />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="Password"
              show-password
          />
        </el-form-item>

        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="Confirm password"
              show-password
          />
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" native-type="submit" :loading="authStore.loading">
            Register
          </el-button>
          <div class="login-link">
            Already have an account?
            <router-link to="/login">Login</router-link>
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
  name: 'RegisterView',

  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const registerFormRef = ref<FormInstance>();

    const registerForm = reactive({
      username: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const validatePass = (rule: any, value: string, callback: any) => {
      if (value === '') {
        callback(new Error('Please enter password'));
      } else if (value.length < 6) {
        callback(new Error('Password must be at least 6 characters'));
      } else {
        if (registerForm.confirmPassword !== '') {
          // Force validation of confirm password
          if (registerFormRef.value) {
            registerFormRef.value.validateField('confirmPassword');
          }
        }
        callback();
      }
    };

    const validateConfirmPass = (rule: any, value: string, callback: any) => {
      if (value === '') {
        callback(new Error('Please confirm your password'));
      } else if (value !== registerForm.password) {
        callback(new Error('Passwords do not match'));
      } else {
        callback();
      }
    };

    const rules = reactive<FormRules>({
      username: [
        { required: true, message: 'Please enter a username', trigger: 'blur' },
        { min: 3, max: 50, message: 'Username must be between 3 and 50 characters', trigger: 'blur' }
      ],
      name: [
        { required: true, message: 'Please enter your name', trigger: 'blur' }
      ],
      email: [
        { required: true, message: 'Please enter your email', trigger: 'blur' },
        { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
      ],
      password: [
        { validator: validatePass, trigger: 'blur' }
      ],
      confirmPassword: [
        { validator: validateConfirmPass, trigger: 'blur' }
      ]
    });

    const handleRegister = async () => {
      if (!registerFormRef.value) return;

      try {
        await registerFormRef.value.validate(async (valid, fields) => {
          if (valid) {
            try {
              // Remove confirmPassword before sending to API
              const { confirmPassword, ...registerData } = registerForm;

              await authStore.register(registerData);
              ElMessage.success('Registration successful');
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
      registerFormRef,
      registerForm,
      rules,
      authStore,
      handleRegister
    };
  }
});
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.register-card {
  width: 100%;
  max-width: 500px;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.login-link {
  margin-top: 15px;
  font-size: 14px;
}

.login-link a {
  color: #409EFF;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>