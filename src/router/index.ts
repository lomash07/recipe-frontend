import { createRouter, createWebHistory} from 'vue-router';
import type {RouteRecordRaw } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import RecipeForm from '../views/RecipeForm.vue';
import RecipeDetail from '../views/RecipeDetail.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import MyRecipes from '../views/MyRecipes.vue';
import { useAuthStore } from '../stores/authStore';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/create',
    name: 'CreateRecipe',
    component: RecipeForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit/:id',
    name: 'EditRecipe',
    component: RecipeForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: RecipeDetail
  },
  {
    path: '/my-recipes',
    name: 'MyRecipes',
    component: MyRecipes,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  }
  // Check if route is for guests only (like login/register)
  else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Dashboard' });
  }
  // Otherwise proceed normally
  else {
    next();
  }
});

export default router;
