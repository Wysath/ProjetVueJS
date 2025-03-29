<template>
  <div class="admin-container">
    <h1>Administration</h1>

    <!-- Vérification du rôle admin -->
    <div v-if="hasAdminRole">
      <!-- Tabs de navigation -->
      <div class="admin-tabs">
        <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
          Utilisateurs
        </button>
        <button :class="{ active: activeTab === 'content' }" @click="activeTab = 'content'">
          Publications
        </button>
        <button :class="{ active: activeTab === 'comments' }" @click="activeTab = 'comments'">
          Commentaires
        </button>
      </div>

      <!-- Contenu des tabs -->
      <div class="admin-content">
        <UserManagement v-if="activeTab === 'users'" />
        <ContentManagement v-if="activeTab === 'content'" />
        <CommentManagement v-if="activeTab === 'comments'" />
      </div>
    </div>

    <div v-else class="unauthorized">
      <p>Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '../stores/session'
import UserManagement from '../components/admin/UserManagement.vue'
import ContentManagement from '../components/admin/ContentManagement.vue'
import CommentManagement from '../components/admin/CommentManagement.vue'

const router = useRouter()
const { hasRole } = useSession()
const activeTab = ref('users')
const hasAdminRole = ref(false)

onMounted(() => {
  // Vérifier si l'utilisateur a le rôle admin
  hasAdminRole.value = hasRole('ROLE_ADMIN')

  // Rediriger si l'utilisateur n'est pas administrateur
  if (!hasAdminRole.value) {
    setTimeout(() => {
      router.push('/')
    }, 3000) // Redirection après 3 secondes
  }
})
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
}

.admin-tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.admin-tabs button.active {
  border-bottom: 3px solid #42b983;
  color: #42b983;
  font-weight: bold;
}

.unauthorized {
  text-align: center;
  color: red;
  margin-top: 20px;
}
</style>
