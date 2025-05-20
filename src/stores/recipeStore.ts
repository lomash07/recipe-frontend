import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface Ingredient {
    id?: number;
    ingredient_name: string;
}

export interface Recipe {
    id?: number;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    instructions: string;
    image_url?: string;
    creator_name: string;
    created_date?: string;
    user_id?: number;
    ingredients: Ingredient[];
}

const API_URL = import.meta.env.VITE_API_URL || 'https://recipemanager-c0033f7f55ed.herokuapp.com/recipemanager';

export const useRecipeStore = defineStore('recipe', {
    state: () => ({
        recipes: [] as Recipe[],
        currentRecipe: null as Recipe | null,
        loading: false,
        error: null as string | null,
        filters: {
            difficulty: '',
            ingredientCount: 0,
            searchText: ''
        }
    }),

    getters: {
        filteredRecipes: (state) => {
            return state.recipes.filter(recipe => {
                // Filter by difficulty
                if (state.filters.difficulty && recipe.difficulty !== state.filters.difficulty) {
                    return false;
                }

                // Filter by ingredient count
                if (state.filters.ingredientCount > 0 && recipe.ingredients.length !== state.filters.ingredientCount) {
                    return false;
                }

                // Filter by search text
                if (state.filters.searchText && !recipe.title.toLowerCase().includes(state.filters.searchText.toLowerCase())) {
                    return false;
                }

                return true;
            });
        },

        // Get recipes created by the current user
        myRecipes: (state) => {
            const authStore = useAuthStore();
            if (!authStore.user) return [];
            return state.recipes.filter(recipe => recipe.user_id === authStore.user?.id);
        }
    },

    actions: {
        // Get authorization headers
        getAuthHeaders() {
            const authStore = useAuthStore();
            return {
                ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
                'Content-Type': 'application/json'
            };
        },

        async fetchRecipes() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`${API_URL}/recipes`);
                this.recipes = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to fetch recipes';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },

        async fetchMyRecipes() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`${API_URL}/recipes/my-recipes`, {
                    headers: this.getAuthHeaders()
                });
                this.recipes = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to fetch your recipes';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },

        async fetchRecipeById(id: number) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get(`${API_URL}/recipes/${id}`);
                this.currentRecipe = response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to fetch recipe details';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },

        async createRecipe(recipe: Recipe) {
            this.loading = true;
            this.error = null;
// Add debugging
            const authStore = useAuthStore();
            console.log('Current auth state:', {
                isAuthenticated: !!authStore.token,
                userExists: !!authStore.user,
                userId: authStore.user?.id
            });

            // Log the headers being used
            const headers = this.getAuthHeaders();
            console.log('Request headers:', headers);

            // Log the payload being sent
            console.log('Recipe payload:', JSON.parse(JSON.stringify(recipe)));
            try {
                const response = await axios.post(`${API_URL}/recipes`, recipe, {
                    headers: this.getAuthHeaders()
                });
                this.recipes.push(response.data);
                return response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to create recipe';
                console.error(err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateRecipe(id: number, recipe: Recipe) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.put(`${API_URL}/recipes/${id}`, recipe, {
                    headers: this.getAuthHeaders()
                });
                const index = this.recipes.findIndex(r => r.id === id);
                if (index !== -1) {
                    this.recipes[index] = response.data;
                }
                return response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to update recipe';
                console.error(err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteRecipe(id: number) {
            this.loading = true;
            this.error = null;

            try {
                await axios.delete(`${API_URL}/recipes/${id}`, {
                    headers: this.getAuthHeaders()
                });
                const index = this.recipes.findIndex(r => r.id === id);
                if (index !== -1) {
                    this.recipes.splice(index, 1);
                }
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Failed to delete recipe';
                console.error(err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        setFilters(filters: { difficulty?: string; ingredientCount?: number; searchText?: string }) {
            this.filters = { ...this.filters, ...filters };
        },

        clearFilters() {
            this.filters = {
                difficulty: '',
                ingredientCount: 0,
                searchText: ''
            };
        }
    }
});