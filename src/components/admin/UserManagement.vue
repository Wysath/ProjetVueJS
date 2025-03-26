<template>
  <div class="user-management">
    <h2>Gestion des Utilisateurs</h2>

    <div class="filters">
      <input type="text" v-model="searchTerm" placeholder="Rechercher un utilisateur..." />
    </div>

    <div v-if="loading" class="loading">Chargement des utilisateurs...</div>

    <table v-else>
      <thead>
        <tr>
          <th>Email</th>
          <th>UUID</th>
          <th>Rôles</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.uuid">
          <td>{{ user.email }}</td>
          <td>{{ user.uuid }}</td>
          <td>{{ user.roles.join(', ') }}</td>
          <td>
            <button @click="deleteUser(user)" class="delete-btn">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && filteredUsers.length === 0" class="no-results">
      Aucun utilisateur trouvé.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../../services/api'
import { useSession } from '../../stores/session'

const { token } = useSession()
const users = ref([])
const loading = ref(true)
const searchTerm = ref('')

// Filtrer les utilisateurs en fonction du terme de recherche
const filteredUsers = computed(() => {
  if (!searchTerm.value) return users.value

  const searchLower = searchTerm.value.toLowerCase()
  return users.value.filter(
    (user) =>
      user.email.toLowerCase().includes(searchLower) ||
      user.uuid.toLowerCase().includes(searchLower) ||
      user.roles.some((role) => role.toLowerCase().includes(searchLower)),
  )
})

// Récupération de tous les utilisateurs
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.member) {
      users.value = response.member
    } else {
      console.error('Format de réponse inattendu:', response)
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    alert('Une erreur est survenue lors du chargement des utilisateurs.')
  } finally {
    loading.value = false
  }
}

// Suppression d'un utilisateur
const deleteUser = async (user) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.email} ?`)) {
    return
  }

  try {
    await api(`/api/users/${user.uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Mettre à jour la liste des utilisateurs après suppression
    users.value = users.value.filter((u) => u.uuid !== user.uuid)
    alert('Utilisateur supprimé avec succès.')
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    alert("Une erreur est survenue lors de la suppression de l'utilisateur.")
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  margin-top: 20px;
}

.filters {
  margin-bottom: 20px;
}

.filters input {
  padding: 8px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #ff7875;
}

.loading {
  text-align: center;
  padding: 20px;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>
