<template>
  <div class="my-recipes">
    <h2>My Recipes</h2>

    <div v-if="!isAuthenticated" class="auth-required">
      <el-empty description="Please login to view your recipes">
        <el-button type="primary" @click="goToLogin">Login</el-button>
      </el-empty>
    </div>

    <template v-else>
      <!-- Loading state -->
      <div v-if="recipeStore.loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- Empty state -->
      <el-empty
          v-else-if="myRecipes.length === 0"
          description="You haven't created any recipes yet"
      >
        <el-button type="primary" @click.prevent="createRecipe">Create Lomash Recipe</el-button>
      </el-empty>

      <!-- Recipe list -->
      <el-table
          v-else
          :data="myRecipes"
          style="width: 100%"
          @row-click="viewRecipeDetails"
      >
        <el-table-column prop="title" label="Recipe Title" />
        <el-table-column prop="difficulty" label="Difficulty Level" width="120">
          <template #default="{ row }">
            <el-tag :type="getDifficultyTagType(row.difficulty)">
              {{ row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Ingredients" width="120">
          <template #default="{ row }">
            {{ row.ingredients.length }} ingredients
          </template>
        </el-table-column>
        <el-table-column prop="created_date" label="Created On" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_date) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="150">
          <template #default="{ row }">
            <el-button
                size="small"
                type="primary"
                @click.stop="editRecipe(row.id)"
            >
              Edit
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click.stop="confirmDelete(row.id)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '../stores/recipeStore';
import { useAuthStore } from '../stores/authStore';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'MyRecipesView',

  setup() {
    const recipeStore = useRecipeStore();
    const authStore = useAuthStore();
    const router = useRouter();

    const deleteDialogVisible = ref(false);
    const recipeToDeleteId = ref<number | null>(null);

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const myRecipes = computed(() => recipeStore.myRecipes);

    onMounted(() => {
      if (isAuthenticated.value) {
        recipeStore.fetchRecipes();
      }
    });

    const goToLogin = () => {
      router.push('/login');
    };

    const createRecipe = () => {
      router.push('/create');
    };

    const viewRecipeDetails = (row: any) => {
      router.push(`/recipe/${row.id}`);
    };

    const editRecipe = (id: number) => {
      router.push(`/edit/${id}`);
    };

    const confirmDelete = (id: number) => {
      recipeToDeleteId.value = id;
      deleteDialogVisible.value = true;
    };

    const deleteRecipe = async () => {
      if (recipeToDeleteId.value) {
        try {
          await recipeStore.deleteRecipe(recipeToDeleteId.value);
          ElMessage.success('Recipe deleted successfully');
          deleteDialogVisible.value = false;
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
        month: 'short',
        day: 'numeric'
      }).format(date);
    };

    return {
      recipeStore,
      isAuthenticated,
      myRecipes,
      deleteDialogVisible,
      goToLogin,
      createRecipe,
      viewRecipeDetails,
      editRecipe,
      confirmDelete,
      deleteRecipe,
      getDifficultyTagType,
      formatDate
    };
  }
});
</script>

<style scoped>
.my-recipes {
  padding: 20px;
}

.auth-required {
  margin-top: 50px;
}

.loading-container {
  padding: 20px 0;
}

.el-tag {
  width: 70px;
  text-align: center;
}
</style>