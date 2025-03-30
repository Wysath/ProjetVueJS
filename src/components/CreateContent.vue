<template>
  <div class="create-content-container animate-fade-in">
    <div class="content-background"></div>

    <div class="form-card glass">
      <div class="color-accent animate-morphing"></div>

      <h1 class="page-title">Créer un article</h1>
      <p class="subtitle">Partagez votre vision sur la psychologie des couleurs</p>

      <form @submit.prevent="createContent" class="content-form">
        <div class="form-group">
          <label for="title">Titre de l'article</label>
          <input
            type="text"
            id="title"
            v-model="title"
            placeholder="Un titre captivant..."
            class="glass-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="metaDescription">Description</label>
          <textarea
            id="metaDescription"
            v-model="metaDescription"
            placeholder="Une brève description de votre article..."
            class="glass-input"
            rows="3"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="content">Contenu</label>
          <textarea
            id="content"
            v-model="content"
            placeholder="Exprimez-vous librement..."
            class="glass-input content-textarea"
            rows="10"
            required
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="coverImage">Image de couverture</label>
            <div class="image-upload-container">
              <!-- Option pour URL externe -->
              <div class="upload-option">
                <label>
                  <input type="radio" v-model="imageSource" value="url" class="radio-input" />
                  URL externe
                </label>
                <input
                  v-if="imageSource === 'url'"
                  type="text"
                  id="coverImageUrl"
                  v-model="coverImageUrl"
                  placeholder="https://example.com/image.jpg"
                  class="glass-input"
                />
              </div>

              <div class="upload-option">
                <label>
                  <input type="radio" v-model="imageSource" value="file" class="radio-input" />
                  Télécharger une image
                </label>
                <div v-if="imageSource === 'file'" class="file-upload-wrapper">
                  <input
                    type="file"
                    id="coverImageFile"
                    ref="fileInput"
                    @change="handleFileChange"
                    accept="image/*"
                    class="file-input"
                  />
                  <button
                    type="button"
                    @click="triggerFileInput"
                    class="file-upload-btn glass-input"
                  >
                    {{ fileSelected ? "Changer l'image" : 'Sélectionner une image' }}
                  </button>
                  <span v-if="fileSelected" class="file-name">{{ selectedFileName }}</span>
                  <div v-if="uploadProgress > 0 && uploadProgress < 100" class="progress-bar">
                    <div class="progress" :style="{ width: `${uploadProgress}%` }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="tags">Tags (séparés par des virgules)</label>
            <input
              type="text"
              id="tags"
              v-model="tags"
              placeholder="rouge, design, psychologie..."
              class="glass-input"
            />
            <div class="tags-hint">
              Astuce: incluez des noms de couleurs dans vos tags pour personnaliser l'apparence de
              votre article!
            </div>
          </div>
        </div>

        <div class="preview-section" v-if="imagePreviewUrl">
          <h3>Aperçu de l'image</h3>
          <div class="image-preview">
            <img :src="imagePreviewUrl" alt="Aperçu" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit animate-pulse" :disabled="isUploading">
            <span v-if="isUploading" class="btn-icon">
              <svg
                class="spinner"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
              >
                <circle
                  class="spinner-circle"
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                ></circle>
              </svg>
            </span>
            <span v-else class="btn-icon">✓</span>
            {{ isUploading ? 'En cours...' : "Publier l'article" }}
          </button>
          <button type="button" @click="resetForm" class="btn-reset" :disabled="isUploading">
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api, BASE_URL } from '../services/api'
import { useSession } from '../stores/session'

const { hasRole } = useSession()
const router = useRouter()

const title = ref('')
const content = ref('')
const metaDescription = ref('')
const tags = ref('')

// Nouvelles variables pour l'upload de fichiers
const imageSource = ref('url') // 'url' ou 'file'
const coverImageUrl = ref('') // Pour l'URL externe
const fileInput = ref(null) // Référence à l'input file
const selectedFile = ref(null) // Fichier sélectionné
const uploadProgress = ref(0) // Progression de l'upload
const isUploading = ref(false) // État d'upload en cours

// Variables calculées
const fileSelected = computed(() => selectedFile.value !== null)
const selectedFileName = computed(() => selectedFile.value?.name || '')
const imagePreviewUrl = computed(() => {
  if (imageSource.value === 'url') return coverImageUrl.value
  if (selectedFile.value) return URL.createObjectURL(selectedFile.value)
  return ''
})

// Méthode pour déclencher le clic sur l'input file
const triggerFileInput = () => {
  fileInput.value.click()
}

// Gestion du changement de fichier
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file
    uploadProgress.value = 0
  } else {
    alert('Veuillez sélectionner un fichier image valide.')
    selectedFile.value = null
  }
}

// Upload du fichier vers le serveur
const uploadFile = async () => {
  if (!selectedFile.value) return null

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Création d'un FormData pour l'upload
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    // Vous pouvez ajouter des métadonnées supplémentaires si nécessaire
    formData.append('fileName', selectedFile.value.name)
    formData.append('fileType', selectedFile.value.type)

    // Récupération du token d'authentification
    const token = sessionStorage.getItem('token')

    // Configuration de la requête avec événement de progression
    const xhr = new XMLHttpRequest()

    // Création d'une promesse pour attendre la fin de l'upload
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          uploadProgress.value = Math.round((event.loaded / event.total) * 100)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            console.log('Upload réussi:', response)
            resolve(response)
          } catch (e) {
            console.error('Erreur de parsing:', e)
            reject(new Error('Erreur lors du parsing de la réponse'))
          }
        } else {
          console.error('Erreur HTTP:', xhr.status, xhr.statusText)
          reject(new Error(`Erreur lors de l'upload: ${xhr.status} - ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        console.error('Erreur réseau XHR')
        reject(new Error("Erreur réseau lors de l'upload"))
      })
    })

    // Configuration et envoi de la requête
    xhr.open('POST', `${BASE_URL}/api/uploads`, true)

    // Envoi des headers d'authentification
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    // Ne pas ajouter de Content-Type header, le navigateur le fait automatiquement avec boundary
    xhr.send(formData)

    // Attendre la fin de l'upload
    const response = await uploadPromise

    // Vérifier et extraire l'URL de l'image
    if (response && response.fileUrl) {
      return response.fileUrl
    } else if (response && response.url) {
      return response.url
    } else if (response && response.path) {
      // Construire l'URL complète à partir du chemin relatif fourni par l'API
      return `${BASE_URL}${response.path}`
    } else {
      console.error('Format de réponse inattendu:', response)
      throw new Error('Format de réponse inattendu')
    }
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error)
    alert(`Erreur lors de l'upload: ${error.message}`)
    return null
  } finally {
    isUploading.value = false
  }
}

// Méthode de création de contenu mise à jour
const createContent = async () => {
  // Vérifications des droits...
  if (!hasRole('ROLE_SUBSCRIBER') && !hasRole('ROLE_ADMIN')) {
    alert("Vous n'avez pas l'autorisation de créer du contenu.")
    return
  }

  try {
    isUploading.value = true

    let imageUrl = null
    if (imageSource.value === 'file' && selectedFile.value) {
      console.log('Upload du fichier en cours...')
      imageUrl = await uploadFile()
      if (!imageUrl) {
        console.error("L'upload a échoué, arrêt de la création d'article")
        isUploading.value = false
        return
      }
      console.log('Upload réussi, URL:', imageUrl)
    } else if (imageSource.value === 'url' && coverImageUrl.value) {
      imageUrl = coverImageUrl.value
      console.log('Utilisation URL externe:', imageUrl)
    }

    // Préparation des tags
    const tagsValue = tags.value ? tags.value.trim() : ''
    const tagsList = tagsValue
      ? tagsValue
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : []
    console.log('Tags à ajouter:', tagsList)

    // ÉTAPE 1: Créer l'article sans les tags
    const initialRequestBody = {
      title: title.value,
      content: content.value,
      coverImage: imageUrl,
      metaDescription: metaDescription.value,
      // Ne pas inclure les tags ici
    }

    console.log("Création de l'article (sans tags):", initialRequestBody)

    const response = await api('/api/contents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
      },
      body: JSON.stringify(initialRequestBody),
    })

    if (response && response.uuid) {
      console.log('Article créé avec succès:', response)

      // ÉTAPE 2: Mettre à jour l'article pour ajouter les tags (si présents)
      if (tagsList.length > 0) {
        try {
          console.log(`Ajout des tags à l'article ${response.uuid}:`, tagsList)

          // Mise à jour avec PUT pour ajouter les tags
          const updateResponse = await api(`/api/contents/${response.uuid}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/ld+json',
            },
            body: JSON.stringify({
              // Inclure les champs requis par l'API
              title: response.title,
              metaDescription: response.metaDescription,
              // Ajouter le contenu
              content: response.content || content.value,
              // Ajouter l'image (si présente dans la réponse ou la requête)
              coverImage: response.coverImage || imageUrl,
              // Ajouter les tags
              tags: tagsList,
            }),
          })

          console.log('Mise à jour des tags réussie:', updateResponse)
        } catch (tagError) {
          console.error("Erreur lors de l'ajout des tags:", tagError)
          // Ne pas bloquer le processus en cas d'erreur
        }
      }

      alert('Article créé avec succès!')
      router.push(`/articles/${response.uuid}`)
    } else {
      alert("Échec de la création de l'article")
    }
  } catch (error) {
    console.error('Erreur lors de la création du contenu:', error)
    alert("Une erreur est survenue lors de la création de l'article")
  } finally {
    isUploading.value = false
  }
}

// Réinitialisation du formulaire
const resetForm = () => {
  title.value = ''
  content.value = ''
  metaDescription.value = ''
  tags.value = ''
  imageSource.value = 'url'
  coverImageUrl.value = ''
  selectedFile.value = null
  uploadProgress.value = 0
}
</script>

<style scoped>
.create-content-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-xl);
  position: relative;
}

.content-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 20%, rgba(126, 87, 194, 0.1), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(66, 184, 131, 0.1), transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(255, 118, 117, 0.05), transparent 70%);
  z-index: -1;
}

.form-card {
  padding: var(--space-xl);
  border-radius: var(--border-radius-lg);
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.color-accent {
  position: absolute;
  top: 0;
  left: 0;
  height: 6px;
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--accent-color),
    var(--secondary-color),
    var(--primary-color)
  );
  background-size: 300% 300%;
  animation: colorChange 12s infinite;
}

.page-title {
  color: var(--primary-color);
  margin-bottom: var(--space-xs);
  font-weight: 700;
  font-size: 2.2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  color: var(--text-light);
  margin-bottom: var(--space-lg);
  font-size: 1.1rem;
}

.content-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin: var(--space-md) 0;
}

.form-group label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
}

.glass-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--border-radius-md);
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(5px);
  font-size: 1rem;
  color: var(--text-color);
  transition: all var(--transition-normal);
  font-family: inherit;
}

.glass-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(126, 87, 194, 0.2);
}

.content-textarea {
  resize: vertical;
  min-height: 200px;
}

.tags-hint {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-top: var(--space-xs);
  font-style: italic;
}

.preview-section {
  margin-top: var(--space-md);
}

.preview-section h3 {
  margin-bottom: var(--space-sm);
  font-size: 1.1rem;
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.upload-option {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.upload-option label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
}

.radio-input {
  margin-right: var(--space-xs);
}

.file-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.file-input {
  display: none;
}

.file-upload-btn {
  padding: 10px 15px;
  background: rgba(126, 87, 194, 0.1);
  border: 1px dashed var(--primary-color);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-weight: 500;
  text-align: center;
}

.file-upload-btn:hover {
  background: rgba(126, 87, 194, 0.2);
}

.file-name {
  font-size: 0.9em;
  color: var(--text-color);
  font-style: italic;
  margin-left: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  overflow: hidden;
  margin-top: var(--space-xs);
}

.progress {
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  transition: width 0.3s ease;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.image-preview {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: var(--border-radius-md);
  border: 2px dashed rgba(126, 87, 194, 0.3);
  background-color: rgba(255, 255, 255, 0.4);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-preview:hover img {
  transform: scale(1.05);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.btn-submit {
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--primary-color), #9575cd);
  border: none;
  border-radius: var(--border-radius-md);
  color: white;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  justify-content: center;
  flex: 1;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.btn-submit:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.8s;
}

.btn-submit:hover:before {
  left: 100%;
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 15px rgba(126, 87, 194, 0.3);
}

.btn-reset {
  padding: 14px 24px;
  background: transparent;
  border: 1px solid var(--gray-400);
  border-radius: var(--border-radius-md);
  color: var(--text-color);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-reset:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: var(--gray-600);
}

.btn-icon {
  font-size: 1.2rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 64;
  stroke-dashoffset: 16;
  animation: dash 1.5s ease infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0%,
  100% {
    stroke-dashoffset: 64;
  }
  50% {
    stroke-dashoffset: 32;
  }
}

@media (max-width: 768px) {
  .form-card {
    padding: var(--space-lg);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .page-title {
    font-size: 1.8rem;
  }
}
</style>
