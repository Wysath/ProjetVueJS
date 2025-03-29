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
/* Styles généraux */
.user-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: var(--font-family, 'Roboto', sans-serif);
}

.user-management h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color, #7e57c2), var(--accent-color, #e91e63));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
  position: relative;
}

.user-management h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 5px;
  background: linear-gradient(
    90deg,
    var(--primary-color, #7e57c2),
    var(--accent-color, #e91e63),
    var(--secondary-color, #42b883),
    var(--primary-color, #7e57c2)
  );
  background-size: 300% 300%;
  animation: colorChange 8s infinite;
  border-radius: 4px;
}

/* Barre de recherche stylisée */
.filters {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.filters input {
  padding: 12px 15px;
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(126, 87, 194, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filters input:focus {
  outline: none;
  border-color: var(--primary-color, #7e57c2);
  box-shadow: 0 0 0 3px rgba(126, 87, 194, 0.25);
}

/* État de chargement */
.loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-light, #666);
  font-style: italic;
  position: relative;
}

.loading::before {
  content: '';
  display: block;
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid rgba(126, 87, 194, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color, #7e57c2);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tableau des utilisateurs */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

table th,
table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

table th {
  background-color: rgba(126, 87, 194, 0.1);
  font-weight: 600;
  color: var(--text-color, #333);
  position: sticky;
  top: 0;
  backdrop-filter: blur(5px);
  border-bottom: 2px solid rgba(126, 87, 194, 0.2);
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

table tr:last-child td {
  border-bottom: none;
}

table tbody tr {
  transition: all 0.2s ease;
}

table tbody tr:hover {
  background-color: rgba(126, 87, 194, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

/* Style des cellules spéciales */
tbody tr td:nth-child(3) {
  /* Style pour la colonne des rôles */
  font-size: 0.9rem;
}

tbody tr td:nth-child(3)::first-letter {
  text-transform: uppercase;
}

/* Badges pour les rôles */
tbody tr td:nth-child(3) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Bouton de suppression */
.delete-btn {
  background: linear-gradient(135deg, #ff4d4f, #e91e63);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(233, 30, 99, 0.2);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.delete-btn::before {
  content: '×';
  font-size: 1.2rem;
  font-weight: bold;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #ff7875, #f06292);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(233, 30, 99, 0.3);
}

/* État sans résultats */
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-light, #666);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  font-style: italic;
}

.no-results::before {
  content: '👤';
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Animation du dégradé des couleurs */
@keyframes colorChange {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Animation d'apparition */
.user-management {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Media queries pour responsive */
@media (max-width: 768px) {
  .user-management h2 {
    font-size: 1.8rem;
  }

  table th,
  table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  .delete-btn {
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
  }

  .filters input {
    max-width: 100%;
  }

  tbody tr td:nth-child(2) {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  table {
    display: block;
    overflow-x: auto;
  }

  .delete-btn::before {
    content: '×';
    font-size: 1.2rem;
  }

  .delete-btn span {
    display: none;
  }
}
</style>
