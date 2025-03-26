<template>
  <div>
    <h1>Create Content</h1>
    <form @submit.prevent="createContent">
      <input type="text" v-model="title" placeholder="Title" />
      <textarea v-model="content" placeholder="Content"></textarea>
      <input type="text" v-model="coverImage" placeholder="Cover Image" />
      <input type="text" v-model="metaDescription" placeholder="Meta Description" />
      <input type="text" v-model="tags" placeholder="Tags (comma-separated)" />
      <button type="submit">Create</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../services/api'
import { useSession } from '../stores/session'

const { hasRole } = useSession()

const title = ref('')
const content = ref('')
const coverImage = ref('')
const metaDescription = ref('')
const tags = ref('')

const createContent = async () => {
  // Vérifiez si l'utilisateur a les rôles nécessaires
  if (!hasRole('ROLE_SUBSCRIBER') && !hasRole('ROLE_ADMIN')) {
    alert('You do not have permission to create content.')
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
      alert('Content created successfully!')
      // Réinitialisez les champs du formulaire
      title.value = ''
      content.value = ''
      coverImage.value = ''
      metaDescription.value = ''
      tags.value = ''
    } else {
      alert('Failed to create content')
    }
  } catch (error) {
    console.error('Error creating content:', error)
    alert('An error occurred while creating content')
  }
}
</script>
