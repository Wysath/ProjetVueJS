<template>
  <div class="content-management">
    <h2>Gestion des Publications</h2>

    <div class="filters">
      <input type="text" v-model="searchTerm" placeholder="Rechercher une publication..." />
    </div>

    <div v-if="loading" class="loading">Chargement des publications...</div>

    <table v-else>
      <thead>
        <tr>
          <th>Titre</th>
          <th>Description</th>
          <th>Date de création</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="content in filteredContents" :key="content.uuid">
          <td>{{ content.title }}</td>
          <td>{{ content.metaDescription }}</td>
          <td>{{ formatDate(content.createdAt) }}</td>
          <td>
            <button @click="editContent(content)" class="edit-btn">Modifier</button>
            <button @click="deleteContent(content)" class="delete-btn">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal d'édition -->
    <div v-if="showEditModal" class="edit-modal">
      <div class="modal-content">
        <h3>Modifier la publication</h3>
        <form @submit.prevent="saveContent">
          <div class="form-group">
            <label for="title">Titre</label>
            <input type="text" id="title" v-model="editingContent.title" required />
          </div>
          <div class="form-group">
            <label for="metaDescription">Description</label>
            <textarea
              id="metaDescription"
              v-model="editingContent.metaDescription"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="content">Contenu</label>
            <textarea id="content" v-model="editingContent.content" rows="10"></textarea>
          </div>
          <div class="form-group">
            <label for="tags">Tags (séparés par des virgules)</label>
            <input type="text" id="tags" v-model="tagsString" />
          </div>
          <div class="form-actions">
            <button type="button" @click="showEditModal = false" class="cancel-btn">Annuler</button>
            <button type="submit" class="save-btn">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="!loading && filteredContents.length === 0" class="no-results">
      Aucune publication trouvée.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '../../services/api'

const contents = ref([])
const loading = ref(true)
const searchTerm = ref('')
const showEditModal = ref(false)
const editingContent = ref({})
const tagsString = ref('')

// Filtrer les publications en fonction du terme de recherche
const filteredContents = computed(() => {
  if (!searchTerm.value) return contents.value

  const searchLower = searchTerm.value.toLowerCase()
  return contents.value.filter(
    (content) =>
      content.title.toLowerCase().includes(searchLower) ||
      (content.metaDescription && content.metaDescription.toLowerCase().includes(searchLower)) ||
      (content.tags && content.tags.some((tag) => tag.toLowerCase().includes(searchLower))),
  )
})

// Récupération de toutes les publications
const fetchContents = async () => {
  loading.value = true
  try {
    const response = await api('/api/contents', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.member) {
      contents.value = response.member
    } else {
      console.error('Format de réponse inattendu:', response)
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des publications:', error)
    alert('Une erreur est survenue lors du chargement des publications.')
  } finally {
    loading.value = false
  }
}

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Éditer une publication
const editContent = (content) => {
  editingContent.value = { ...content }
  tagsString.value = content.tags ? content.tags.join(', ') : ''
  showEditModal.value = true
}

// Sauvegarder les modifications d'une publication
const saveContent = async () => {
  try {
    // Convertir la chaîne de tags en tableau
    editingContent.value.tags = tagsString.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    const response = await api(`/api/contents/${editingContent.value.uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/ld+json',
      },
      body: JSON.stringify(editingContent.value),
    })

    // Mettre à jour les publications localement
    const index = contents.value.findIndex((c) => c.uuid === editingContent.value.uuid)
    if (index !== -1) {
      contents.value[index] = response
    }

    showEditModal.value = false
    alert('Publication mise à jour avec succès.')
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la publication:', error)
    alert('Une erreur est survenue lors de la mise à jour de la publication.')
  }
}

// Supprimer une publication
const deleteContent = async (content) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer la publication "${content.title}" ?`)) {
    return
  }

  try {
    await api(`/api/contents/${content.uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Mettre à jour la liste des publications après suppression
    contents.value = contents.value.filter((c) => c.uuid !== content.uuid)
    alert('Publication supprimée avec succès.')
  } catch (error) {
    console.error('Erreur lors de la suppression de la publication:', error)
    alert('Une erreur est survenue lors de la suppression de la publication.')
  }
}

onMounted(() => {
  fetchContents()
})
</script>

<style scoped>
.content-management {
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
  max-width: 800px;
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

.form-group input,
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
