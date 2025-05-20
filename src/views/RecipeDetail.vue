<template>
  <div class="recipe-detail" v-loading="recipeStore.loading">
    <el-result v-if="recipeStore.error" icon="error" :title="recipeStore.error">
      <template #extra>
        <el-button type="primary" @click="navigateBack">Back to Dashboard</el-button>
      </template>
    </el-result>

    <div v-else-if="recipe" class="recipe-content">
      <div class="recipe-header">
        <h1>{{ recipe.title }}</h1>
        <el-tag :type="getDifficultyTagType(recipe.difficulty)" size="large">
          {{ recipe.difficulty }}
        </el-tag>
      </div>

      <div class="recipe-meta">
        <p>Created by <strong>{{ recipe.creator_name }}</strong> on {{ formatDate(recipe.created_date) }}</p>
      </div>

      <div class="recipe-main">
        <div class="recipe-image-container" v-if="recipe.image_url">
          <img :src="recipe.image_url" :alt="recipe.title" class="recipe-image" />
        </div>

        <div class="recipe-ingredients">
          <h3>Ingredients</h3>
          <el-card shadow="never">
            <ul>
              <li v-for="(ingredient, index) in recipe.ingredients" :key="index">
                {{ ingredient.ingredient_name }}
              </li>
            </ul>
          </el-card>
        </div>

        <div class="recipe-instructions">
          <h3>Instructions</h3>
          <el-card shadow="never" class="instruction-card">
            <pre>{{ recipe.instructions }}</pre>
          </el-card>
        </div>
      </div>

      <div class="recipe-actions">
        <el-button v-if="isOwner" type="primary" @click="editRecipe">Edit Recipe</el-button>
        <el-button v-if="isOwner" type="danger" @click="confirmDelete">Delete Recipe</el-button>
        <el-button @click="navigateBack">Back to Dashboard</el-button>
      </div>

      <!-- Delete Confirmation Dialog -->
      <el-dialog
          v-model="deleteDialogVisible"
          title="Confirm Delete"
          width="30%"
      >
        <span>Are you sure you want to delete this recipe?</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">Cancel</el-button>
            <el-button type="danger" @click="deleteRecipe">Delete</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '../stores/recipeStore';
import { useAuthStore } from '../stores/authStore';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'RecipeDetailView',

  setup() {
    const recipeStore = useRecipeStore();
    const authStore = useAuthStore();
    const route = useRoute();
    const router = useRouter();

    const deleteDialogVisible = ref(false);

    const recipeId = computed(() => {
      return route.params.id ? parseInt(route.params.id as string) : null;
    });

    const recipe = computed(() => recipeStore.currentRecipe);
    const isAuthenticated = computed(() => authStore.isAuthenticated);

    // Check if the current user is the owner of this recipe
    const isOwner = computed(() => {
      if (!isAuthenticated.value || !recipe.value || !authStore.currentUser) {
        return false;
      }
      return recipe.value.user_id === authStore.currentUser.id;
    });

    onMounted(async () => {
      if (recipeId.value) {
        await recipeStore.fetchRecipeById(recipeId.value);
      }
    });

    const navigateBack = () => {
      router.push('/');
    };

    const editRecipe = () => {
      if (recipeId.value) {
        router.push(`/edit/${recipeId.value}`);
      }
    };

    const confirmDelete = () => {
      deleteDialogVisible.value = true;
    };

    const deleteRecipe = async () => {
      if (recipeId.value) {
        try {
          await recipeStore.deleteRecipe(recipeId.value);
          ElMessage.success('Recipe deleted successfully');
          router.push('/');
        } catch (error) {
          ElMessage.error('Failed to delete recipe');
        }
      }
    };

    const getDifficultyTagType = (difficulty: string) => {
      switch (difficulty) {
        case 'Easy':
          return 'success';
        case 'Medium':
          return 'warning';
        case 'Hard':
          return 'danger';
        default:
          return 'info';
      }
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    };

    return {
      recipeStore,
      recipe,
      isAuthenticated,
      isOwner,
      navigateBack,
      editRecipe,
      confirmDelete,
      deleteRecipe,
      deleteDialogVisible,
      getDifficultyTagType,
      formatDate
    };
  }
});
</script>

<style scoped>
.recipe-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recipe-meta {
  margin-bottom: 30px;
  color: #606266;
}

.recipe-main {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

@media (min-width: 768px) {
  .recipe-main {
    grid-template-columns: 1fr 1fr;
  }

  .recipe-instructions {
    grid-column: span 2;
  }
}

.recipe-image-container {
  text-align: center;
  margin-bottom: 20px;
}

.recipe-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.recipe-ingredients ul {
  padding-left: 20px;
  margin: 0;
}

.recipe-ingredients li {
  margin-bottom: 10px;
}

.instruction-card pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}

.recipe-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>