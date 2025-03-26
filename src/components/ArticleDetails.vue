<template>
  <div>
    <div v-if="!article">
      <p>Loading article...</p>
    </div>
    <div v-else>
      <h1>{{ article.title }}</h1>
      <img :src="article.coverImage" alt="Cover Image" />
      <p>{{ article.metaDescription }}</p>
      <p>
        <strong>Author: {{ article.authorDetails?.name || 'Unknown Author' }}</strong>
      </p>
      <p><strong>Created At:</strong> {{ new Date(article.createdAt).toLocaleDateString() }}</p>
      <p><strong>Tags:</strong> {{ article.tags.join(', ').replace(/\|/g, ', ') }}</p>

      <div v-if="isAuthor || hasRole('ROLE_ADMIN')">
        <button v-if="isAuthor" @click="editArticle">Edit Article</button>
        <button @click="deleteArticle">Delete Article</button>
      </div>

      <!-- Formulaire d'édition -->
      <div v-if="isEditing">
        <textarea v-model="editedContent.title" placeholder="Edit title"></textarea>
        <textarea v-model="editedContent.metaDescription" placeholder="Edit description"></textarea>
        <textarea v-model="editedContent.body" placeholder="Edit content"></textarea>
        <button @click="saveArticle">Save Changes</button>
        <button @click="cancelEdit">Cancel</button>
      </div>

      <!-- Section des commentaires -->
      <h2>Comments</h2>
      <div v-if="comments.length === 0">
        <p>No comments yet. Be the first to comment!</p>
      </div>
      <div v-else>
        <div v-for="comment in comments" :key="comment.uuid" class="comment">
          <p>
            <strong>
              {{ getCachedUserEmail(comment.author) || getUserEmail(comment.author) }} </strong
            >:
            {{ comment.comment }}
          </p>
        </div>
      </div>

      <!-- Formulaire pour ajouter un commentaire -->
      <div v-if="isLoggedIn && canAddComment">
        <textarea v-model="newComment" placeholder="Add a comment"></textarea>
        <button @click="addComment">Submit Comment</button>
      </div>
      <div v-else-if="isLoggedIn">
        <p>You must be a Subscriber to add a comment.</p>
      </div>
      <div v-else>
        <p>You must be logged in to add a comment.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../services/api'
import { useSession } from '../stores/session'

const { hasRole } = useSession()

const article = ref(null)
const newComment = ref('')
const router = useRouter()
const route = useRoute()
const comments = ref([])
const userEmails = ref({})
const isLoggedIn = computed(() => {
  return localStorage.getItem('token') !== null
})

const isEditing = ref(false)
const editedContent = ref({})
const isAuthor = computed(() => {
  const userUuid = localStorage.getItem('userUuid') // UUID de l'utilisateur connecté
  const authorUuid = article.value?.author?.split('/').pop() // Extraire l'UUID de l'auteur

  console.log('User UUID:', userUuid)
  console.log('Article Author UUID:', authorUuid)

  if (!userUuid || !authorUuid) {
    console.warn('Either User UUID or Author UUID is missing.')
    return false
  }

  return userUuid === authorUuid
})

const editArticle = () => {
  console.log('Editing article...')
  isEditing.value = true
  editedContent.value = { ...article.value } // Copier les données de l'article
  console.log('Edited Content:', editedContent.value)
}

const saveArticle = async () => {
  try {
    // Vérifie que l'ID de l'article est défini (en utilisant '@id' au lieu de 'id')
    if (!article.value || !article.value['@id']) {
      console.error('Article ID is missing.')
      alert('Article ID is missing.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Authentication token is missing.')
      return
    }

    console.log('Saving article with ID:', article.value['@id'])

    const response = await api(`${article.value['@id']}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editedContent.value),
    })

    console.log('API Response:', response)
    article.value = response // Met à jour l'article avec les nouvelles données
    isEditing.value = false
    alert('Article updated successfully!')
  } catch (error) {
    console.error('Error updating article:', error)
    alert('Failed to update article.')
  }
}

const deleteArticle = async () => {
  try {
    // Vérifie que l'ID de l'article est défini
    if (!article.value || !article.value['@id']) {
      console.error('Article ID is missing.')
      alert('Article ID is missing.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Authentication token is missing.')
      return
    }

    console.log('Deleting article with ID:', article.value['@id'])

    const response = await api(`${article.value['@id']}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    // Vérifie si la réponse est vide (code 204)
    if (response.status === 204) {
      console.log('Article deleted successfully.')
      alert('Article deleted successfully!')
      router.push('/articles') // Exemple de redirection vers la liste des articles
    } else {
      const data = await response.json() // On essaie de lire le JSON si la réponse n'est pas vide
      console.log('API Response:', data)
      alert('Failed to delete article.')
    }
  } catch (error) {
    console.error('Error deleting article:', error)
    alert('Failed to delete article.')
  }
}

// Vérifie si l'utilisateur peut ajouter un commentaire
const canAddComment = computed(() => {
  return hasRole('ROLE_SUBSCRIBER') || hasRole('ROLE_ADMIN')
})

const formatUUID = (uuid) => {
  if (!uuid) {
    console.warn('UUID is undefined or null.')
    return 'Unknown UUID'
  }
  return uuid.replace('0x', '')
}

const getUserEmail = async (uuid) => {
  const formattedUuid = formatUUID(uuid)

  // Vérifie si l'email est déjà dans le cache local
  if (userEmails.value[formattedUuid]) {
    return userEmails.value[formattedUuid].split('@')[0] // Retourne la partie avant le "@"
  }

  try {
    // Vérifie si l'email est déjà dans le localStorage
    const cachedEmail = localStorage.getItem(`userEmail_${formattedUuid}`)
    if (cachedEmail) {
      userEmails.value[formattedUuid] = cachedEmail
      return cachedEmail.split('@')[0] // Retourne la partie avant le "@"
    }

    // Appel API pour récupérer l'utilisateur par UUID
    const response = await api(`${formattedUuid}`)
    const email = response.email

    // Stocke l'email dans le cache local et dans le localStorage
    userEmails.value[formattedUuid] = email
    localStorage.setItem(`userEmail_${formattedUuid}`, email)

    return email.split('@')[0] // Retourne la partie avant le "@"
  } catch (error) {
    console.error('Error fetching user email:', error)
    return 'Unknown User'
  }
}

const getCachedUserEmail = (uuid) => {
  const formattedUuid = formatUUID(uuid)
  const cachedEmail = localStorage.getItem(`userEmail_${formattedUuid}`)
  if (cachedEmail) {
    return cachedEmail.split('@')[0] // Retourne la partie avant le "@"
  }
  return null
}

const fetchAuthor = async (authorUrl) => {
  try {
    const response = await api(authorUrl, {}, false) // Requête sans authentification
    return response
  } catch (error) {
    console.error('Error fetching author details:', error)
    return { name: 'Unknown Author' } // Valeur par défaut en cas d'erreur
  }
}

const fetchArticle = async () => {
  try {
    // Récupérer les détails de l'article
    const response = await api(`/api/contents/${route.params.id}`, {}, false)
    article.value = response
    console.log('Article fetched:', article.value) // Vérifie si l'article est bien récupéré

    // Récupérer les détails de l'auteur
    if (article.value.author) {
      const authorDetails = await fetchAuthor(article.value.author)
      article.value.authorDetails = authorDetails // Ajouter les détails de l'auteur à l'article
    }

    // Récupérer les commentaires associés à l'article
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
    if (error.message === '401') {
      console.warn('Unauthorized access to comments. Displaying article only.')
    } else {
      console.error('Error fetching article:', error)
      alert('Failed to load article details.')
      router.push('/articles')
    }
  }
}

// Fonction pour ajouter un commentaire
const addComment = async () => {
  if (!canAddComment.value) {
    alert('You must be a Subscriber to add a comment.')
    return
  }

  if (!newComment.value.trim()) {
    alert('Comment cannot be empty.')
    return
  }

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Authentication token is missing.')
      return
    }

    if (!article.value || !article.value['@id']) {
      alert('Article reference is missing.')
      return
    }

    const response = await api(`/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        comment: newComment.value,
        content: article.value['@id'],
      }),
    })

    console.log('Réponse API :', response)

    // Vérification de l'objet réponse avant d'ajouter au tableau
    if (!article.value.comments) {
      article.value.comments = []
    }

    article.value.comments.push(response)
    comments.value.push(response) // Ajouter le nouveau commentaire à l'affichage
    newComment.value = ''
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('Failed to add comment.')
  }
}

// Charger les détails de l'article au montage du composant
onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.comment {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
}
</style>
