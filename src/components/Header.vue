<template>
  <div class="header">
    <button v-if="!isLoggedIn" @click="router.push('/login')">Login</button>
    <template v-else>
      <span class="user-info">Connecté en tant que: {{ userEmail }}</span>
      <button @click="logout">Logout</button>
      <button @click="createContent">Create Content</button>
      <button v-if="hasAdminRole" @click="router.push('/admin')">Admin</button>
      <router-link to="/articles">Articles</router-link>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '../stores/session'

const session = useSession()
const router = useRouter()

// Récupère l'état de connexion depuis le store
const isLoggedIn = computed(() => session.loggedIn)
const userEmail = computed(() => session.user.email)
const hasAdminRole = computed(() => session.hasRole('ROLE_ADMIN'))

// S'assure que l'état de session est correctement initialisé au démarrage
onMounted(() => {
  session.checkAuth()
})

const logout = () => {
  // Supprimer les données de sessionStorage
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')

  // Mettre à jour l'état dans le store
  session.logout()

  router.push('/login')
}

const createContent = () => {
  router.push('/create-content')
}
</script>

<style scoped>
.header {
  padding: 1rem;
  background-color: #f5f5f5;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-info {
  margin-right: auto;
  font-size: 0.9rem;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
