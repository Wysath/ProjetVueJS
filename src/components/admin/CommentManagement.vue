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
.comment-management {
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

.edit-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 5px;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: #40a9ff;
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

/* Styles pour le modal d'édition */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn {
  background-color: #ccc;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #999;
}

.save-btn:hover {
  background-color: #36a16e;
}
</style>
