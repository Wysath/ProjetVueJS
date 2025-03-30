<template>
  <div class="article-details-container">
    <div v-if="!article" class="loading-container">
      <div class="spinner animate-color-change"></div>
      <p>Chargement de l'article...</p>
    </div>

    <div v-else class="article-content glass animate-fade-in">
      <!-- En-tête de l'article avec image de couverture -->
      <div class="article-header">
        <div class="color-accent animate-morphing"></div>
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <div class="author-info">
            <span class="author-avatar" :style="getAuthorAvatarStyle(article.author)"></span>
            <span class="author-name">{{ article.authorDetails?.name || 'Unknown Author' }}</span>
          </div>
          <div class="article-date">
            <span class="icon-calendar"></span>
            {{ formatDate(article.createdAt) }}
          </div>
        </div>

        <div class="tags-container" v-if="article.tags && article.tags.length">
          <span v-for="(tag, index) in article.tags" :key="index" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Image de couverture avec effet parallaxe -->
      <div class="cover-image-container">
        <img
          v-if="article.coverImage"
          :src="article.coverImage"
          alt="Cover Image"
          class="cover-image"
        />
        <div v-else class="placeholder-image animate-morphing">
          <div class="color-preview" :style="getArticleColorStyle(article)"></div>
        </div>
      </div>

      <!-- Corps de l'article -->
      <div class="article-body">
        <p class="article-description">{{ article.metaDescription }}</p>
        <div class="article-content-body" v-html="article.body"></div>
      </div>

      <!-- Actions pour l'auteur ou admin -->
      <div v-if="isAuthor || hasRole('ROLE_ADMIN')" class="article-actions">
        <button v-if="isAuthor" @click="editArticle" class="btn btn-edit">
          <span class="btn-icon">✎</span>
          Modifier
        </button>
        <button @click="deleteArticle" class="btn btn-delete">
          <span class="btn-icon">✕</span>
          Supprimer
        </button>
      </div>

      <!-- Formulaire d'édition -->
      <div v-if="isEditing" class="edit-form glass">
        <h3>Modifier l'article</h3>
        <div class="form-group">
          <label for="edit-title">Titre</label>
          <input
            id="edit-title"
            type="text"
            v-model="editedContent.title"
            placeholder="Titre de l'article"
            class="glass-input"
          />
        </div>

        <div class="form-group">
          <label for="edit-description">Description</label>
          <textarea
            id="edit-description"
            v-model="editedContent.metaDescription"
            placeholder="Description de l'article"
            class="glass-input"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="edit-content">Contenu</label>
          <textarea
            id="edit-content"
            v-model="editedContent.body"
            placeholder="Contenu de l'article"
            class="glass-input"
            rows="10"
          ></textarea>
        </div>

        <div class="form-actions">
          <button @click="saveArticle" class="btn btn-save">Enregistrer</button>
          <button @click="cancelEdit" class="btn btn-cancel">Annuler</button>
        </div>
      </div>

      <!-- Section des commentaires -->
      <div class="comments-section">
        <h2 class="section-title">Commentaires</h2>

        <div v-if="comments.length === 0" class="no-comments">
          <div class="empty-comments">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"
                fill="currentColor"
              />
              <path d="M12 10H16V12H12V10ZM6 10H10V12H6V10ZM8 14H16V16H8V14Z" fill="currentColor" />
            </svg>
            <p>Aucun commentaire pour le moment. Soyez le premier à réagir !</p>
          </div>
        </div>

        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.uuid" class="comment-card glass">
            <div class="comment-header">
              <div class="comment-author">
                <span class="user-avatar" :style="getAuthorAvatarStyle(comment.author)"></span>
                <strong>{{
                  getCachedUserEmail(comment.author) || getUserEmail(comment.author)
                }}</strong>
              </div>
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <!-- Mode d'affichage normal du commentaire -->
            <div v-if="editingCommentId !== comment.uuid" class="comment-body">
              {{ comment.comment }}

              <!-- Afficher les boutons d'action uniquement pour l'auteur du commentaire -->
              <div v-if="isCommentAuthor(comment.author)" class="comment-actions">
                <button @click="editComment(comment)" class="btn btn-edit btn-sm">
                  <span class="btn-icon">✎</span>
                  Modifier
                </button>
                <button @click="deleteComment(comment)" class="btn btn-delete btn-sm">
                  <span class="btn-icon">🗑️</span>
                  Supprimer
                </button>
              </div>
            </div>

            <!-- Mode d'édition du commentaire -->
            <div v-else class="comment-edit-form">
              <textarea v-model="editedCommentText" class="glass-input" rows="3"></textarea>
              <div class="comment-edit-actions">
                <button @click="saveComment(comment)" class="btn btn-save btn-sm">
                  Enregistrer
                </button>
                <button @click="cancelEditComment" class="btn btn-cancel btn-sm">Annuler</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire pour ajouter un commentaire -->
        <div class="comment-form-container">
          <div v-if="isLoggedIn && canAddComment" class="add-comment-form glass">
            <h3>Ajouter un commentaire</h3>
            <textarea
              v-model="newComment"
              placeholder="Partagez votre avis..."
              class="glass-input"
              rows="4"
            ></textarea>
            <button @click="addComment" class="btn btn-primary">Publier</button>
          </div>

          <div v-else-if="isLoggedIn" class="comment-restriction glass">
            <p>
              <span class="icon-info"></span>
              Vous devez être abonné pour ajouter un commentaire.
            </p>
          </div>

          <div v-else class="comment-restriction glass">
            <p>
              <span class="icon-lock"></span>
              Vous devez être connecté pour ajouter un commentaire.
            </p>
            <button @click="router.push('/login')" class="btn btn-outline">Se connecter</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../services/api'
import { useSession } from '../stores/session'

const session = useSession()
const router = useRouter()
const route = useRoute()

const article = ref(null)
const newComment = ref('')
const comments = ref([])
const userEmails = ref({})
const isEditing = ref(false)
const editedContent = ref({})

const editingCommentId = ref(null)
const editedCommentText = ref('')
const isLoggedIn = computed(() => session.loggedIn)

const isAuthor = computed(() => {
  const userUuid = session.user.uuid
  const authorUuid = article.value?.author?.split('/').pop()

  if (!userUuid || !authorUuid) {
    return false
  }

  return userUuid === authorUuid
})

const hasRole = (role) => session.hasRole(role)

const canAddComment = computed(() => {
  return session.hasRole('ROLE_SUBSCRIBER') || session.hasRole('ROLE_ADMIN')
})

const getAuthorAvatarStyle = (authorUrl) => {
  if (!authorUrl) return {}

  const uuid = formatUUID(authorUrl)

  let hash = 0
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash)
  }

  const h = Math.abs(hash) % 360

  return {
    background: `linear-gradient(135deg, hsl(${h}, 80%, 60%), hsl(${(h + 60) % 360}, 80%, 45%))`,
  }
}

const getArticleColorStyle = (article) => {
  if (!article || !article.tags || !article.tags.length) {
    return { background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' }
  }

  const colorMappings = {
    rouge: 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
    bleu: 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)',
    vert: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
    violet: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
    orange: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
    jaune: 'linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%)',
    cyan: 'linear-gradient(135deg, #00bcd4 0%, #26c6da 100%)',
    rose: 'linear-gradient(135deg, #e91e63 0%, #f48fb1 100%)',
  }

  for (const tag of article.tags) {
    const tagLower = tag.toLowerCase()
    for (const [colorName, gradient] of Object.entries(colorMappings)) {
      if (tagLower.includes(colorName)) {
        return { background: gradient }
      }
    }
  }

  return { background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchAuthor = async (authorUrl) => {
  try {
    const uuid = authorUrl.split('/').pop()
    const response = await api(`/api/users/${uuid}`, {}, false)
    return { name: response.email.split('@')[0] }
  } catch (error) {
    console.error('Error fetching author details:', error)
    return { name: 'Unknown Author' }
  }
}

const formatUUID = (authorUrl) => {
  if (!authorUrl) return ''
  return authorUrl.split('/').pop()
}

const getUserEmail = async (authorUrl) => {
  const uuid = formatUUID(authorUrl)

  if (userEmails.value[uuid]) {
    return userEmails.value[uuid].split('@')[0]
  }

  try {
    const response = await api(`/api/users/${uuid}`, {}, false)
    const email = response.email

    userEmails.value[uuid] = email
    sessionStorage.setItem(`userEmail_${uuid}`, email)

    return email.split('@')[0]
  } catch (error) {
    console.error('Error fetching user email:', error)
    return 'Unknown User'
  }
}

const getCachedUserEmail = (authorUrl) => {
  const uuid = formatUUID(authorUrl)
  const cachedEmail = sessionStorage.getItem(`userEmail_${uuid}`)

  if (cachedEmail) {
    userEmails.value[uuid] = cachedEmail
    return cachedEmail.split('@')[0]
  }
  return null
}

const editArticle = () => {
  isEditing.value = true
  editedContent.value = { ...article.value }
}

const saveArticle = async () => {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('Authentication token is missing.')
      return
    }

    const response = await api(`${article.value['@id']}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editedContent.value),
    })

    article.value = response
    isEditing.value = false
    alert('Article updated successfully!')
  } catch (error) {
    console.error('Error updating article:', error)
    alert('Failed to update article.')
  }
}

const deleteArticle = async () => {
  if (!confirm('Are you sure you want to delete this article?')) {
    return
  }

  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('Authentication token is missing.')
      return
    }

    await api(`${article.value['@id']}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    alert('Article deleted successfully!')
    router.push('/articles')
  } catch (error) {
    console.error('Error deleting article:', error)
    alert('Failed to delete article.')
  }
}

const addComment = async () => {
  if (!newComment.value.trim()) {
    alert('Le commentaire ne peut pas être vide.')
    return
  }

  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert("Token d'authentification manquant.")
      return
    }

    const commentData = {
      comment: newComment.value,
      content: article.value['@id'],
    }

    const response = await api(`/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    })

    console.log("Réponse de l'API:", response)
    comments.value.push(response)
    newComment.value = ''
    alert('Commentaire ajouté avec succès!')
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error)
    alert(`Échec de l'ajout du commentaire: ${error.message}`)
  }
}

const isCommentAuthor = (commentAuthorUrl) => {
  if (!commentAuthorUrl || !session.user.uuid) {
    console.log("Impossible de vérifier l'auteur:", {
      commentAuthorUrl,
      sessionUserUuid: session.user.uuid,
    })
    return false
  }
  const authorUuid = commentAuthorUrl.split('/').pop()
  const isAuthor = session.user.uuid === authorUuid
  console.log('Vérification auteur:', {
    commentAuthorUrl,
    authorUuid,
    sessionUserUuid: session.user.uuid,
    isAuthor,
  })
  return isAuthor
}

const editComment = (comment) => {
  editingCommentId.value = comment.uuid
  editedCommentText.value = comment.comment
}

const cancelEditComment = () => {
  editingCommentId.value = null
  editedCommentText.value = ''
}

const saveComment = async (comment) => {
  try {
    console.log('Tentative de modification du commentaire:', {
      commentUuid: comment.uuid,
      commentAuthor: comment.author,
      currentUser: session.user.uuid,
      isAuthor: isCommentAuthor(comment.author),
      userRoles: session.user.roles,
    })

    const token = sessionStorage.getItem('token')
    if (!token) {
      alert("Token d'authentification manquant.")
      return
    }

    const originalComment = await api(`/api/comments/${comment.uuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
      },
    })

    const commentData = {
      ...originalComment,
      comment: editedCommentText.value,
    }

    const response = await api(`/api/comments/${comment.uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    })

    const index = comments.value.findIndex((c) => c.uuid === comment.uuid)
    if (index !== -1) {
      comments.value[index] = response
    }

    editingCommentId.value = null
    editedCommentText.value = ''
    alert('Commentaire modifié avec succès!')
  } catch (error) {
    console.error('Erreur lors de la modification du commentaire:', error)

    if (error.message === '403') {
      alert(
        "Vous n'avez pas l'autorisation de modifier ce commentaire. Seul l'auteur du commentaire peut le modifier.",
      )
    } else {
      alert(`Échec de la modification du commentaire: ${error.message}`)
    }
  }
}

const deleteComment = async (comment) => {
  // Vérifier que l'utilisateur est bien l'auteur du commentaire
  if (!isCommentAuthor(comment.author)) {
    alert('Vous ne pouvez supprimer que vos propres commentaires.')
    return
  }

  // Demander confirmation avant suppression
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
    return
  }

  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert("Token d'authentification manquant.")
      return
    }

    // NOUVELLE APPROCHE : Récupérer d'abord le commentaire complet
    const commentDetails = await api(`/api/comments/${comment.uuid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('Détails du commentaire récupérés:', commentDetails)

    // Ensuite envoyer la requête DELETE avec tous les headers nécessaires
    await api(`/api/comments/${comment.uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/ld+json',
      },
    })

    // Supprimer le commentaire de la liste locale
    comments.value = comments.value.filter((c) => c.uuid !== comment.uuid)
    alert('Commentaire supprimé avec succès!')
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error)

    if (error.message === '403') {
      // Ajout d'informations de débogage
      console.error("Détails de l'erreur 403:", {
        commentId: comment.uuid,
        userUuid: session.user.uuid,
        roles: session.user.roles,
        isLoggedIn: session.loggedIn,
      })

      alert(
        "Vous n'avez pas l'autorisation de supprimer ce commentaire. Vérifiez que vous êtes bien connecté et que vous êtes l'auteur du commentaire.",
      )
    } else {
      alert(`Échec de la suppression du commentaire: ${error.message}`)
    }
  }
}

const fetchArticle = async () => {
  try {
    const response = await api(`/api/contents/${route.params.id}`, {}, false)
    article.value = response

    if (article.value.author) {
      const authorDetails = await fetchAuthor(article.value.author)
      article.value.authorDetails = authorDetails
    }

    const commentsResponse = await api(
      `/api/comments`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      false,
    )

    comments.value = (commentsResponse.member || []).filter(
      (comment) => comment.content === article.value['@id'],
    )
  } catch (error) {
    console.error('Error fetching article:', error)
    if (error.message !== '401') {
      alert('Failed to load article details.')
      router.push('/articles')
    }
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editedContent.value = {}
}

onMounted(() => {
  fetchArticle()

  const token = sessionStorage.getItem('token')
  console.log('Token présent:', !!token)
  console.log('Rôles utilisateur:', session.user.roles)
  console.log('ROLE_ADMIN présent:', session.hasRole('ROLE_ADMIN'))
  console.log('ROLE_SUBSCRIBER présent:', session.hasRole('ROLE_SUBSCRIBER'))
  console.log('canAddComment:', canAddComment.value)
})
</script>

<style scoped>
.article-details-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-md);
}

/* Animation de chargement */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
}

.spinner {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 5px solid rgba(126, 87, 194, 0.2);
  border-top-color: var(--primary-color);
  animation: spin 1s infinite linear;
  margin-bottom: var(--space-md);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Article principal */
.article-content {
  position: relative;
  overflow: hidden;
  margin: var(--space-xl) auto;
  padding-bottom: var(--space-lg);
  border-radius: var(--border-radius-lg);
}

.color-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  z-index: 2;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--accent-color),
    var(--secondary-color),
    var(--primary-color)
  );
  background-size: 300% 300%;
  animation: colorChange 8s infinite;
}

/* En-tête de l'article */
.article-header {
  position: relative;
  padding: var(--space-xl) var(--space-xl) var(--space-lg);
  text-align: center;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: var(--space-md);
  line-height: 1.2;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
  margin-bottom: var(--space-md);
  font-size: 0.95rem;
  color: var(--text-light);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: var(--shadow-sm);
}

.author-name {
  font-weight: 600;
}

.article-date {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.icon-calendar::before {
  content: '📅';
  font-size: 1.1rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-xs);
  margin-top: var(--space-md);
}

.tag {
  background-color: rgba(126, 87, 194, 0.1);
  color: var(--primary-color);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all var(--transition-normal);
}

.tag:hover {
  background-color: rgba(126, 87, 194, 0.2);
  transform: translateY(-2px);
}

/* Image de couverture */
.cover-image-container {
  width: 100%;
  height: 400px;
  overflow: hidden;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-preview {
  width: 100%;
  height: 100%;
  animation: colorChange 8s infinite;
  background-size: 200% 200%;
}

/* Corps de l'article */
.article-body {
  padding: var(--space-xl);
  font-size: 1.1rem;
  line-height: 1.7;
}

.article-description {
  font-size: 1.25rem;
  color: var(--text-light);
  font-style: italic;
  margin-bottom: var(--space-lg);
  line-height: 1.6;
  padding: 0 var(--space-md);
  position: relative;
}

.article-description::before,
.article-description::after {
  content: '"';
  font-size: 3rem;
  color: var(--primary-color);
  opacity: 0.2;
  position: absolute;
}

.article-description::before {
  left: -15px;
  top: -15px;
}

.article-description::after {
  right: -15px;
  bottom: -30px;
}

.article-content-body {
  word-break: break-word;
}

/* Actions pour l'article */
.article-actions {
  display: flex;
  gap: var(--space-md);
  margin: 0 var(--space-xl) var(--space-md);
}

/* Formulaire d'édition */
.edit-form {
  margin: var(--space-md) var(--space-xl);
  padding: var(--space-lg);
  border-radius: var(--border-radius-md);
}

.edit-form h3 {
  margin-top: 0;
  margin-bottom: var(--space-md);
}

.form-group {
  margin-bottom: var(--space-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--space-xs);
  font-weight: 500;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

/* Section des commentaires */
.comments-section {
  margin-top: var(--space-xxl);
  padding: 0 var(--space-xl);
}

.section-title {
  position: relative;
  display: inline-block;
  margin-bottom: var(--space-lg);
  font-size: 1.8rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 50px;
  height: 4px;
  background: var(--primary-color);
  border-radius: var(--border-radius-sm);
}

.no-comments {
  text-align: center;
  padding: var(--space-lg) 0;
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-light);
}

.empty-comments svg {
  color: var(--gray-400);
  margin-bottom: var(--space-md);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.comment-card {
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
  transition: transform var(--transition-normal);
}

.comment-card:hover {
  transform: translateY(-3px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.comment-author {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-block;
}

.comment-date {
  font-size: 0.85rem;
  color: var(--text-light);
}

.comment-body {
  white-space: pre-wrap;
  line-height: 1.6;
}

/* Formulaire de commentaire */
.comment-form-container {
  margin-top: var(--space-lg);
}

.add-comment-form {
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
}

.add-comment-form h3 {
  margin-top: 0;
  margin-bottom: var(--space-md);
  font-size: 1.2rem;
}

.add-comment-form textarea {
  width: 100%;
  margin-bottom: var(--space-md);
}

.comment-restriction {
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  text-align: center;
}

.comment-restriction p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.icon-info::before {
  content: 'ⓘ';
  font-size: 1.2rem;
}

.icon-lock::before {
  content: '🔒';
  font-size: 1.2rem;
}

/* Boutons stylisés */
.btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--border-radius-md);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), #9575cd);
  color: white;
}

.btn-edit {
  background: linear-gradient(135deg, var(--secondary-color), #66bb6a);
  color: white;
}

.btn-delete {
  background: linear-gradient(135deg, #f44336, #ff7675);
  color: white;
}

.btn-save {
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  color: white;
}

.btn-cancel {
  background: linear-gradient(135deg, #9e9e9e, #bdbdbd);
  color: white;
}

.btn-outline {
  border: 2px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
}

.btn-outline:hover {
  background: var(--primary-color);
  color: white;
}

.btn-icon {
  margin-right: var(--space-xs);
}

/* Media queries */
@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }

  .article-meta {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .cover-image-container {
    height: 250px;
  }

  .article-header,
  .article-body,
  .comments-section {
    padding: var(--space-md);
  }

  .article-actions {
    margin: 0 var(--space-md) var(--space-md);
    flex-direction: column;
  }

  .edit-form {
    margin: var(--space-md);
  }
}

.comment-actions {
  margin-top: var(--space-sm);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-xs);
}

.btn-delete.btn-sm {
  background: linear-gradient(135deg, #f44336, #ff7675);
  color: white;
}

.btn-delete.btn-sm:hover {
  background: linear-gradient(135deg, #e53935, #ff5252);
}

.btn-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: 0.85rem;
}

.comment-edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.comment-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-xs);
}
</style>
