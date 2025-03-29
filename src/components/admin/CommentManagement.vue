<template>
  <div class="comment-management">
    <h2>Gestion des Commentaires</h2>

    <div class="filters">
      <input type="text" v-model="searchTerm" placeholder="Rechercher un commentaire..." />
    </div>

    <div v-if="loading" class="loading">Chargement des commentaires...</div>

    <table v-else>
      <thead>
        <tr>
          <th>Commentaire</th>
          <th>Auteur</th>
          <th>Article</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="comment in filteredComments" :key="comment.uuid">
          <td>{{ truncate(comment.comment, 50) }}</td>
          <td>{{ getAuthorName(comment.author) }}</td>
          <td>{{ getContentTitle(comment.content) }}</td>
          <td>{{ formatDate(comment.createdAt) }}</td>
          <td>
            <button @click="deleteComment(comment)" class="delete-btn">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && filteredComments.length === 0" class="no-results">
      Aucun commentaire trouvé.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../../services/api'

const comments = ref([])
const authors = ref({}) // Cache pour les noms d'auteurs
const contents = ref({}) // Cache pour les titres d'articles
const loading = ref(true)
const searchTerm = ref('')
const showEditModal = ref(false)
const editingComment = ref({})

// Filtrer les commentaires en fonction du terme de recherche
const filteredComments = computed(() => {
  if (!searchTerm.value) return comments.value

  const searchLower = searchTerm.value.toLowerCase()
  return comments.value.filter(
    (comment) =>
      comment.comment.toLowerCase().includes(searchLower) ||
      getAuthorName(comment.author).toLowerCase().includes(searchLower) ||
      getContentTitle(comment.content).toLowerCase().includes(searchLower),
  )
})

// Récupération de tous les commentaires
const fetchComments = async () => {
  loading.value = true
  try {
    const response = await api('/api/comments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.member) {
      comments.value = response.member
      // Précharger les données des auteurs et des contenus
      await preloadAuthorData()
      await preloadContentData()
    } else {
      console.error('Format de réponse inattendu:', response)
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error)
    alert('Une erreur est survenue lors du chargement des commentaires.')
  } finally {
    loading.value = false
  }
}

// Préchargement des données des auteurs
const preloadAuthorData = async () => {
  const uniqueAuthors = [...new Set(comments.value.map((comment) => comment.author))]

  for (const authorUrl of uniqueAuthors) {
    if (!authorUrl) continue

    try {
      const authorId = authorUrl.split('/').pop()
      const response = await api(`/api/users/${authorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      authors.value[authorUrl] = response.email
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'auteur ${authorUrl}:`, error)
    }
  }
}

// Préchargement des données des articles
const preloadContentData = async () => {
  const uniqueContents = [...new Set(comments.value.map((comment) => comment.content))]

  for (const contentUrl of uniqueContents) {
    if (!contentUrl) continue

    try {
      const contentId = contentUrl.split('/').pop()
      const response = await api(`/api/contents/${contentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      contents.value[contentUrl] = response.title
    } catch (error) {
      console.error(`Erreur lors de la récupération du contenu ${contentUrl}:`, error)
    }
  }
}

// Obtenir le nom de l'auteur à partir de l'URL
const getAuthorName = (authorUrl) => {
  if (!authorUrl) return 'Inconnu'
  return authors.value[authorUrl] || authorUrl.split('/').pop()
}

// Obtenir le titre du contenu à partir de l'URL
const getContentTitle = (contentUrl) => {
  if (!contentUrl) return 'Inconnu'
  return contents.value[contentUrl] || contentUrl.split('/').pop()
}

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Tronquer le texte s'il est trop long
const truncate = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Éditer un commentaire
const editComment = (comment) => {
  editingComment.value = { ...comment }
  showEditModal.value = true
}

// Sauvegarder les modifications d'un commentaire
const saveComment = async () => {
  try {
    const response = await api(`/api/comments/${editingComment.value.uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/ld+json',
      },
      body: JSON.stringify(editingComment.value),
    })

    // Mettre à jour les commentaires localement
    const index = comments.value.findIndex((c) => c.uuid === editingComment.value.uuid)
    if (index !== -1) {
      comments.value[index] = response
    }

    showEditModal.value = false
    alert('Commentaire mis à jour avec succès.')
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error)
    alert('Une erreur est survenue lors de la mise à jour du commentaire.')
  }
}

// Supprimer un commentaire
const deleteComment = async (comment) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ce commentaire ?`)) {
    return
  }

  try {
    await api(`/api/comments/${comment.uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Mettre à jour la liste des commentaires après suppression
    comments.value = comments.value.filter((c) => c.uuid !== comment.uuid)
    alert('Commentaire supprimé avec succès.')
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error)
    alert('Une erreur est survenue lors de la suppression du commentaire.')
  }
}

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
/* Styles généraux */
.comment-management {
  max-width: 1200px;
  margin: 20px auto;
  padding: 1.5rem;
  font-family: var(--font-family, 'Roboto', sans-serif);
}

.comment-management h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color, #7e57c2), var(--accent-color, #e91e63));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
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

/* Tableau de commentaires */
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
  transition: background-color 0.2s ease;
}

table tbody tr:hover {
  background-color: rgba(126, 87, 194, 0.05);
}

/* Boutons d'action */
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
}

.delete-btn:hover {
  background: linear-gradient(135deg, #ff7875, #f06292);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(233, 30, 99, 0.3);
}

.delete-btn:active {
  transform: translateY(0);
}

/* État aucun résultat */
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
  content: '🔍';
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Styles pour le modal d'édition (conservés et améliorés) */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 80%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color, #333);
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  resize: vertical;
  min-height: 120px;
}

.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color, #7e57c2);
  box-shadow: 0 0 0 3px rgba(126, 87, 194, 0.25);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  background-color: #9e9e9e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.save-btn {
  background: linear-gradient(135deg, #42b983, #36a16e);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(66, 185, 131, 0.2);
}

.cancel-btn:hover {
  background-color: #757575;
}

.save-btn:hover {
  background: linear-gradient(135deg, #4dd193, #3cb179);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);
}

/* Responsive styles */
@media (max-width: 768px) {
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
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.comment-management {
  animation: fadeIn 0.5s ease-out;
}
</style>
