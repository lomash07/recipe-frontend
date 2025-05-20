<template>
  <div class="dashboard">
    <h2>Recipes Dashboard</h2>

    <!-- Search and Filter Section -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
              v-model="searchText"
              placeholder="Search by title"
              clearable
              @input="applyFilters"
          >
            <template #prefix>
              <el-icon><el-icon-search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select
              v-model="difficultyFilter"
              placeholder="Filter by difficulty"
              clearable
              @change="applyFilters"
          >
            <el-option label="Easy" value="Easy" />
            <el-option label="Medium" value="Medium" />
            <el-option label="Hard" value="Hard" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input-number
              v-model="ingredientCountFilter"
              :min="0"
              placeholder="Ingredient count"
              @change="applyFilters"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="clearFilters">Clear Filters</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Recipe Table -->
    <el-table
        v-loading="recipeStore.loading"
        :data="recipeStore.filteredRecipes"
        style="width: 100%; margin-top: 20px"
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
      <el-table-column prop="creator_name" label="Creator" width="150" />
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

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
          layout="prev, pager, next"
          :total="recipeStore.filteredRecipes.length"
          :page-size="10"
      />
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
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '../stores/recipeStore';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'DashboardView',

  setup() {
    const recipeStore = useRecipeStore();
    const router = useRouter();

    const searchText = ref('');
    const difficultyFilter = ref('');
    const ingredientCountFilter = ref(0);
    const deleteDialogVisible = ref(false);
    const recipeToDeleteId = ref<number | null>(null);

    onMounted(() => {
      recipeStore.fetchRecipes();
    });

    const applyFilters = () => {
      recipeStore.setFilters({
        searchText: searchText.value,
        difficulty: difficultyFilter.value,
        ingredientCount: ingredientCountFilter.value
      });
    };

    const clearFilters = () => {
      searchText.value = '';
      difficultyFilter.value = '';
      ingredientCountFilter.value = 0;
      recipeStore.clearFilters();
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

    const formatDate = (dateString: string) => {
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
      searchText,
      difficultyFilter,
      ingredientCountFilter,
      deleteDialogVisible,
      applyFilters,
      clearFilters,
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
.dashboard {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.el-tag {
  width: 70px;
  text-align: center;
}
</style>