<template>
  <div class="articles-container">
    <h1>Articles</h1>

    <div class="filters-container">
      <h3>Filtres</h3>
      <div class="filters">
        <div class="filter-group">
          <label for="title-filter">Titre</label>
          <input
            id="title-filter"
            type="text"
            v-model="filters.title"
            placeholder="Rechercher par titre"
          />
        </div>

        <div class="filter-group">
          <label for="author-filter">Auteur (UUID)</label>
          <input
            id="author-filter"
            type="text"
            v-model="filters.author_uuid"
            placeholder="Filtrer par auteur"
          />
        </div>

        <div class="filter-group">
          <label for="date-filter">Date de création</label>
          <input id="date-filter" type="date" v-model="filters.created_at" />
        </div>

        <div class="filter-group">
          <label for="tags-filter">Tags</label>
          <input
            id="tags-filter"
            type="text"
            v-model="filters.tags"
            placeholder="Filtrer par tags"
          />
        </div>

        <div class="filter-buttons">
          <button @click="fetchArticles" class="apply-btn">Appliquer les filtres</button>
          <button @click="resetFilters" class="reset-btn">Réinitialiser</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Chargement des articles...</div>

    <div v-else-if="articles.length === 0" class="no-articles">Aucun article trouvé.</div>

    <div v-else class="articles-grid">
      <div v-for="article in articles" :key="article.uuid" class="article-card">
        <div class="article-image">
          <img v-if="article.coverImage" :src="article.coverImage" alt="Cover Image" />
          <div v-else class="no-image">Pas d'image</div>
        </div>

        <div class="article-content">
          <h2>
            <router-link :to="`/articles/${article.uuid}`">
              {{ article.title }}
            </router-link>
          </h2>

          <p class="article-description">{{ article.metaDescription }}</p>

          <div class="article-meta">
            <p><strong>Date:</strong> {{ formatDate(article.createdAt) }}</p>
            <p v-if="article.tags && article.tags.length">
              <strong>Tags:</strong>
              <span class="tags">
                <span v-for="(tag, index) in article.tags" :key="index" class="tag">
                  {{ tag }}
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { api } from '../services/api'

const articles = ref([])
const loading = ref(false)

const filters = reactive({
  author_uuid: '',
  created_at: '',
  title: '',
  tags: '',
})

// Formatage de date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Récupération des articles
const fetchArticles = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()

    // Ajouter les filtres si renseignés
    if (filters.author_uuid) params.append('author_uuid', filters.author_uuid)
    if (filters.created_at) params.append('created_at', filters.created_at)
    if (filters.title) params.append('title', filters.title)
    if (filters.tags) params.append('tags', filters.tags)

    // Utiliser notre service API personnalisé
    const response = await api(
      `/api/contents${params.toString() ? '?' + params.toString() : ''}`,
      {},
      false,
    )

    if (response && response.member) {
      articles.value = response.member
    } else {
      console.error('Format de réponse inattendu:', response)
      articles.value = []
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
    articles.value = []
  } finally {
    loading.value = false
  }
}

// Réinitialisation des filtres
const resetFilters = () => {
  filters.author_uuid = ''
  filters.created_at = ''
  filters.title = ''
  filters.tags = ''
  fetchArticles()
}

// Chargement initial des articles
onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.articles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.filters-container {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters-container h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #555;
}

.filter-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

button {
  cursor: pointer;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
}

.apply-btn {
  background-color: #4caf50;
  color: white;
}

.reset-btn {
  background-color: #f44336;
  color: white;
}

.loading,
.no-articles {
  text-align: center;
  margin: 40px 0;
  color: #666;
  font-size: 18px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.article-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  background-color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.article-image {
  height: 180px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.article-content {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-card h2 {
  margin-top: 0;
  font-size: 18px;
}

.article-card a {
  color: #2c3e50;
  text-decoration: none;
}

.article-card a:hover {
  color: #42b983;
}

.article-description {
  color: #666;
  margin-bottom: 15px;
  flex: 1;
}

.article-meta {
  font-size: 14px;
  color: #777;
  margin-top: auto;
}

.article-meta p {
  margin: 5px 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background-color: #e0f2f1;
  color: #00796b;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
