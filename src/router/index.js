import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'
import App from '../App.vue'
import Home from '@/components/Home.vue'
import LoginForm from '@/components/LoginForm.vue'
import RegisterForm from '@/components/RegisterForm.vue'
import Articles from '@/components/Articles.vue'
import ArticleDetails from '@/components/ArticleDetails.vue'
import CreateContent from '@/components/CreateContent.vue'
import AdminView from '@/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: App,
    },
    {
      path: '/home',
      component: Home,
    },
    {
      path: '/login',
      name: 'LoginForm',
      component: LoginForm,
    },
    {
      path: '/register',
      component: RegisterForm,
    },
    {
      path: '/articles',
      component: Articles,
    },
    { path: '/articles/:id', name: 'ArticleDetails', component: ArticleDetails },
    {
      path: '/create-content',
      component: CreateContent,
    },
    {
      path: '/admin',
      component: AdminView,
    },
  ],
})

export default router
