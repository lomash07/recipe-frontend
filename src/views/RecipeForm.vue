<template>
  <div class="recipe-form">
    <h2>{{ isEditing ? 'Edit Recipe' : 'Create New Recipe' }}</h2>

    <div v-if="!isAuthenticated" class="auth-required">
      <el-empty description="Please login to create or edit recipes">
        <el-button type="primary" @click="goToLogin">Login</el-button>
      </el-empty>
    </div>

    <el-form
        v-else
        ref="formRef"
        :model="recipeForm"
        :rules="rules"
        label-width="120px"
        v-loading="recipeStore.loading"
        @submit.prevent
    >
      <!-- Recipe Title -->
      <el-form-item label="Title" prop="title">
        <el-input v-model="recipeForm.title" placeholder="Recipe title" />
      </el-form-item>

      <!-- Difficulty Level -->
      <el-form-item label="Difficulty" prop="difficulty">
        <el-select v-model="recipeForm.difficulty" placeholder="Select difficulty">
          <el-option label="Easy" value="Easy" />
          <el-option label="Medium" value="Medium" />
          <el-option label="Hard" value="Hard" />
        </el-select>
      </el-form-item>

      <!-- Ingredients -->
      <el-form-item label="Ingredients" prop="ingredients">
        <div v-for="(ingredient, index) in recipeForm.ingredients" :key="index" class="ingredient-item">
          <el-input
              v-model="ingredient.ingredient_name"
              placeholder="Ingredient name"
              class="ingredient-input"
          />
          <el-button
              type="danger"
              circle
              @click.prevent="removeIngredient(index)"
          >
            <el-icon><el-icon-delete /></el-icon>
          </el-button>
        </div>
        <el-button type="primary" @click.prevent="addIngredient">Add Ingredient</el-button>
      </el-form-item>

      <!-- Instructions -->
      <el-form-item label="Instructions" prop="instructions">
        <el-input
            v-model="recipeForm.instructions"
            type="textarea"
            rows="6"
            placeholder="Step-by-step instructions"
        />
      </el-form-item>

      <!-- Image Upload (Optional) -->
      <el-form-item label="Recipe Image">
        <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/upload"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
        >
          <img v-if="recipeForm.image_url" :src="recipeForm.image_url" class="recipe-image" />
          <el-icon v-else class="avatar-uploader-icon"><el-icon-plus /></el-icon>
        </el-upload>
        <div class="upload-hint">Optional: Upload a recipe image</div>
      </el-form-item>

      <!-- Form Actions -->
      <el-form-item>
        <el-button type="primary" @click.prevent="submitForm">{{ isEditing ? 'Update' : 'Create' }}</el-button>
        <el-button @click.prevent="resetForm">Reset</el-button>
        <el-button @click.prevent="navigateBack">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '../stores/recipeStore';
import { useAuthStore } from '../stores/authStore';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormValidateCallback } from 'element-plus';
import type { Recipe, Ingredient } from '../stores/recipeStore';

export default defineComponent({
  name: 'RecipeFormView',

  setup() {
    const recipeStore = useRecipeStore();
    const authStore = useAuthStore();
    const route = useRoute();
    const router = useRouter();
    const formRef = ref<FormInstance>();

    const recipeId = computed(() => {
      return route.params.id ? parseInt(route.params.id as string) : null;
    });

    const isEditing = computed(() => !!recipeId.value);
    const isAuthenticated = computed(() => authStore.isAuthenticated);

    const recipeForm = reactive<Recipe>({
      title: '',
      difficulty: 'Easy',
      instructions: '',
      image_url: '',
      creator_name: authStore.currentUser?.name || '',
      ingredients: [],
    });

    const rules = {
      title: [
        { required: true, message: 'Please enter recipe title', trigger: 'blur' }
      ],
      difficulty: [
        { required: true, message: 'Please select difficulty', trigger: 'change' }
      ],
      instructions: [
        { required: true, message: 'Please enter instructions', trigger: 'blur' }
      ],
      ingredients: [
        {
          type: 'array',
          validator: (rule: any, value: Ingredient[]) => {
            if (value.length === 0) {
              return new Error('Please add at least one ingredient');
            }
            for (const ing of value) {
              if (!ing.ingredient_name.trim()) {
                return new Error('Ingredient name cannot be empty');
              }
            }
            return true;
          },
          trigger: 'change'
        }
      ]
    };

    // Headers for image upload
    const uploadHeaders = computed(() => {
      return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {};
    });

    onMounted(async () => {
      if (!isAuthenticated.value) {
        return;
      }

      if (isEditing.value && recipeId.value) {
        await recipeStore.fetchRecipeById(recipeId.value);
        if (recipeStore.currentRecipe) {
          // Check if current user is the owner of this recipe
          if (recipeStore.currentRecipe.user_id !== authStore.currentUser?.id) {
            ElMessage.error('You do not have permission to edit this recipe');
            router.push('/');
            return;
          }
          Object.assign(recipeForm, recipeStore.currentRecipe);
        }
      } else {
        // Initialize with one empty ingredient for a new recipe
        addIngredient();

        // Set creator name from authenticated user
        if (authStore.currentUser) {
          recipeForm.creator_name = authStore.currentUser.name;
        }
      }
    });

    const addIngredient = () => {
      recipeForm.ingredients.push({ ingredient_name: '' });
    };

    const removeIngredient = (index: number) => {
      recipeForm.ingredients.splice(index, 1);
    };

    // Fixed the submitForm function to correctly handle the FormValidateCallback
    const submitForm = async () => {
console.log("lomash1");
      if (!formRef.value) return;

      try {
        await formRef.value.validate(async (valid, fields) => {
          if (valid) {
            console.log("lomash2");
            try {
              if (isEditing.value && recipeId.value) {
                console.log("lomash3");
                await recipeStore.updateRecipe(recipeId.value, recipeForm);
                console.log("lomash4");
                ElMessage.success('Recipe updated successfully');
              } else {

                // Set user_id for new recipes
                console.log("lomash5");
                if (authStore.currentUser) {
                  recipeForm.user_id = authStore.currentUser.id;
                }
                if (!recipeForm.created_date) {
                  recipeForm.created_date = new Date().toISOString();
                }
                // Make sure ingredients array is properly initialized
                if (!recipeForm.ingredients || recipeForm.ingredients.length === 0) {
                  recipeForm.ingredients = [{ ingredient_name: '' }];
                }
                console.log("lomash6");
                await recipeStore.createRecipe(recipeForm);
                console.log("lomash7");
                ElMessage.success('Recipe created successfully');
              }
              await router.push('/');
              console.log("lomash8");
            } catch (error) {
              console.log(error);
              console.log("lomash9");
              ElMessage.error('Failed to save recipe');
            }
          } else {
            ElMessage.error('Please fix the form errors');
          }
        });
      } catch (error) {
        console.error('Form validation error:', error);
        ElMessage.error('Form validation failed');
      }
    };

    const resetForm = () => {
      if (formRef.value) {
        formRef.value.resetFields();
      }
    };

    const navigateBack = () => {
      router.push('/');
    };

    const handleImageSuccess = (response: any) => {
      recipeForm.image_url = response.url;
    };

    const beforeImageUpload = (file: File) => {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG && !isPNG) {
        ElMessage.error('Image must be JPG or PNG format!');
        return false;
      }
      if (!isLt2M) {
        ElMessage.error('Image size can not exceed 2MB!');
        return false;
      }
      return true;
    };

    const goToLogin = () => {
      router.push('/login');
    };

    return {
      recipeStore,
      formRef,
      recipeForm,
      rules,
      isEditing,
      isAuthenticated,
      uploadHeaders,
      addIngredient,
      removeIngredient,
      submitForm,
      resetForm,
      navigateBack,
      handleImageSuccess,
      beforeImageUpload,
      goToLogin
    };
  }
});
</script>

<style scoped>
.recipe-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.auth-required {
  margin-top: 50px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.ingredient-input {
  flex: 1;
  margin-right: 10px;
}

.avatar-uploader {
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>