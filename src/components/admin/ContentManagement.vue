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
/* Styles généraux */
.content-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: var(--font-family, 'Roboto', sans-serif);
}

.content-management h2 {
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

.content-management h2::after {
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

/* Tableau de publications */
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

/* Boutons d'action */
.edit-btn {
  background: linear-gradient(135deg, #2196f3, #03a9f4);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(3, 169, 244, 0.2);
  margin-right: 0.5rem;
}

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

.edit-btn:hover {
  background: linear-gradient(135deg, #1e88e5, #29b6f6);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(3, 169, 244, 0.3);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #ff7875, #f06292);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(233, 30, 99, 0.3);
}

/* États vides */
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
  content: '📄';
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Modal d'édition */
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 12px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-content h3 {
  color: var(--primary-color, #7e57c2);
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  position: relative;
}

.modal-content h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 50px;
  height: 3px;
  background: var(--primary-color, #7e57c2);
  border-radius: 2px;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(126, 87, 194, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  color: var(--text-color, #333);
  font-family: inherit;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color, #7e57c2);
  box-shadow: 0 0 0 3px rgba(126, 87, 194, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  background: linear-gradient(135deg, #9e9e9e, #757575);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 0.95rem;
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
  font-size: 0.95rem;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #bdbdbd, #9e9e9e);
  transform: translateY(-2px);
}

.save-btn:hover {
  background: linear-gradient(135deg, #4dd193, #3cb179);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 185, 131, 0.3);
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

/* Responsive design */
@media (max-width: 768px) {
  .modal-content {
    width: 90%;
    padding: 1.5rem;
  }

  table th,
  table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  .edit-btn,
  .delete-btn {
    padding: 0.4rem 0.7rem;
    font-size: 0.8rem;
  }

  .filters input {
    max-width: 100%;
  }
}
</style>
