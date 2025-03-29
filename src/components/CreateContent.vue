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
            <label for="coverImage">Image de couverture (URL)</label>
            <input
              type="text"
              id="coverImage"
              v-model="coverImage"
              placeholder="https://example.com/image.jpg"
              class="glass-input"
            />
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

        <div class="preview-section" v-if="coverImage">
          <h3>Aperçu de l'image</h3>
          <div class="image-preview">
            <img :src="coverImage" alt="Aperçu" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit animate-pulse">
            <span class="btn-icon">✓</span>
            Publier l'article
          </button>
          <button type="button" @click="resetForm" class="btn-reset">Réinitialiser</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useSession } from '../stores/session'

const { hasRole } = useSession()
const router = useRouter()

const title = ref('')
const content = ref('')
const coverImage = ref('')
const metaDescription = ref('')
const tags = ref('')

const createContent = async () => {
  // Vérifiez si l'utilisateur a les rôles nécessaires
  if (!hasRole('ROLE_SUBSCRIBER') && !hasRole('ROLE_ADMIN')) {
    alert("Vous n'avez pas l'autorisation de créer du contenu.")
    return
  }

  try {
    // Préparez les données pour la requête
    const requestBody = {
      title: title.value,
      content: content.value,
      coverImage: coverImage.value,
      metaDescription: metaDescription.value,
      tags: tags.value.split(',').map((tag) => tag.trim()), // Convertir les tags en tableau
    }

    // Envoyez la requête pour créer le contenu
    const response = await api('/api/contents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
      },
      body: JSON.stringify(requestBody),
    })

    if (response) {
      alert('Article créé avec succès!')
      // Rediriger vers la page de l'article nouvellement créé
      router.push(`/articles/${response.uuid}`)
    } else {
      alert("Échec de la création de l'article")
    }
  } catch (error) {
    console.error('Erreur lors de la création du contenu:', error)
    alert("Une erreur est survenue lors de la création de l'article")
  }
}

const resetForm = () => {
  title.value = ''
  content.value = ''
  coverImage.value = ''
  metaDescription.value = ''
  tags.value = ''
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
