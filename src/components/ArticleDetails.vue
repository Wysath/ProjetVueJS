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

// Récupération correcte des éléments du store
const session = useSession()
const router = useRouter()
const route = useRoute()

const article = ref(null)
const newComment = ref('')
const comments = ref([])
const userEmails = ref({})
const isEditing = ref(false)
const editedContent = ref({})

// Utiliser le store pour l'état de connexion
const isLoggedIn = computed(() => session.loggedIn)

// Vérifier si l'utilisateur est l'auteur
const isAuthor = computed(() => {
  const userUuid = session.user.uuid
  const authorUuid = article.value?.author?.split('/').pop()

  if (!userUuid || !authorUuid) {
    return false
  }

  return userUuid === authorUuid
})

// Vérifier si l'utilisateur a un rôle spécifique
const hasRole = (role) => session.hasRole(role)

// Vérifier si l'utilisateur peut ajouter des commentaires
const canAddComment = computed(() => {
  return session.hasRole('ROLE_SUBSCRIBER') || session.hasRole('ROLE_ADMIN')
})

// Ajouter un commentaire
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
    // Utiliser sessionStorage pour le token
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('Authentication token is missing.')
      return
    }

    console.log('Sending comment with token:', token)
    console.log('Article ID:', article.value['@id'])

    const response = await api(`/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        comment: newComment.value,
        content: article.value['@id'],
        // Ajouter explicitement l'auteur si nécessaire
        author: `/api/users/${session.user.uuid}`,
      }),
    })

    console.log('Comment added successfully:', response)
    comments.value.push(response)
    newComment.value = ''
    alert('Comment added successfully!')
  } catch (error) {
    console.error('Error adding comment:', error)
    alert('Failed to add comment. Error: ' + error.message)
  }
}

// Le reste de votre code existant...

// Modifications à la fonction fetchArticle pour utiliser sessionStorage
const fetchArticle = async () => {
  try {
    // Récupérer les détails de l'article
    const response = await api(`/api/contents/${route.params.id}`, {}, false)
    article.value = response
    console.log('Article fetched:', article.value)

    // Récupérer les détails de l'auteur
    if (article.value.author) {
      const authorDetails = await fetchAuthor(article.value.author)
      article.value.authorDetails = authorDetails
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
    console.error('Error fetching article:', error)
    if (error.message !== '401') {
      alert('Failed to load article details.')
      router.push('/articles')
    }
  }
}

// Fonction pour annuler l'édition (ajout)
const cancelEdit = () => {
  isEditing.value = false
  editedContent.value = {}
}

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
