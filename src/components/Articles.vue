<template>
  <div>
    <h1>Articles</h1>
    <div class="filters">
      <input type="text" v-model="filters.author_uuid" placeholder="Filter by author UUID" />
      <input type="date" v-model="filters.created_at" placeholder="Filter by creation date" />
      <input type="text" v-model="filters.title" placeholder="Search by title" />
      <input type="text" v-model="filters.tags" placeholder="Filter by tags" />
      <button @click="fetchArticles">Apply Filters</button>
    </div>

    <div v-if="articles.length === 0">No articles found.</div>
    <div v-else>
      <div v-for="article in articles" :key="article.uuid" class="article">
        <h2>
          <a :href="`/articles/${article.uuid}`">
            {{ article.title }}
          </a>
        </h2>
        <p>UUID: {{ article.uuid }}</p>
        <img :src="article.coverImage" alt="Cover Image" />
        <p>{{ article.metaDescription }}</p>
        <p><strong>Created At:</strong> {{ new Date(article.createdAt).toLocaleDateString() }}</p>
        <p><strong>Tags:</strong> {{ article.tags.join(', ').replace(/\|/g, ', ') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      articles: [], // Tableau pour stocker les articles récupérés
      filters: {
        author_uuid: '', // Filtrer par auteur
        created_at: '', // Filtrer par date
        title: '', // Recherche par titre
        tags: '', // Filtrer par tags
      },
    }
  },
  created() {
    this.fetchArticles() // Appel de la méthode pour récupérer les articles
  },
  methods: {
    async fetchArticles() {
      try {
        const params = new URLSearchParams()

        // Ajouter les filtres si renseignés
        if (this.filters.author_uuid) params.append('author_uuid', this.filters.author_uuid)
        if (this.filters.created_at) params.append('created_at', this.filters.created_at)
        if (this.filters.title) params.append('title', this.filters.title)
        if (this.filters.tags) params.append('tags', this.filters.tags)

        // Effectuer la requête avec les paramètres
        const response = await axios.get(`http://127.0.0.1:8000/api/contents?${params.toString()}`)
        this.articles = response.data.member // Accédez au champ `member` pour obtenir les articles
      } catch (error) {
        console.error('Erreur lors de la récupération des articles:', error)
      }
    },
  },
}
</script>

<style scoped>
.article {
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
}

.filters input {
  margin-right: 10px;
  padding: 5px;
}

.filters button {
  padding: 5px 10px;
}
</style>
