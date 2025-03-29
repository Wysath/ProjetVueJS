<template>
  <div class="articles-container">
    <div class="section-header animate-fade-in">
      <h1>Palette Expérimentale</h1>
      <p class="subtitle">Explorez la psychologie des couleurs et du design</p>
    </div>

    <div class="filters-container glass">
      <h3>Filtres</h3>
      <div class="filters">
        <div class="filter-group">
          <label for="title-filter">Titre</label>
          <input
            id="title-filter"
            type="text"
            v-model="filters.title"
            placeholder="Rechercher par titre"
            class="glass-input"
          />
        </div>

        <div class="filter-group">
          <label for="author-filter">Auteur</label>
          <input
            id="author-filter"
            type="text"
            v-model="filters.author_uuid"
            placeholder="Filtrer par auteur"
            class="glass-input"
          />
        </div>

        <div class="filter-group">
          <label for="date-filter">Date</label>
          <input id="date-filter" type="date" v-model="filters.created_at" class="glass-input" />
        </div>

        <div class="filter-group">
          <label for="tags-filter">Tags</label>
          <input
            id="tags-filter"
            type="text"
            v-model="filters.tags"
            placeholder="Filtrer par tags"
            class="glass-input"
          />
        </div>

        <div class="filter-buttons">
          <button @click="fetchArticles" class="btn">Appliquer</button>
          <button @click="resetFilters" class="btn btn-outline">Réinitialiser</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Exploration des palettes...</p>
    </div>

    <div v-else-if="articles.length === 0" class="no-articles">
      <div class="empty-state">
        <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
          <rect x="20" y="20" width="80" height="60" rx="4" fill="var(--gray-200)" />
          <path
            d="M40 40H80M40 60H70"
            stroke="var(--gray-400)"
            stroke-width="4"
            stroke-linecap="round"
          />
        </svg>
        <p>Aucun article correspondant à vos critères</p>
      </div>
    </div>

    <transition-group name="article-list" tag="div" class="articles-grid">
      <div
        v-for="(article, index) in articles"
        :key="article.uuid"
        class="article-card"
        :class="getColorThemeClass(article)"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="article-image">
          <img v-if="article.coverImage" :src="article.coverImage" alt="Cover Image" />
          <div v-else class="no-image animate-morphing">
            <div class="color-preview" :style="getArticleColorStyle(article)"></div>
          </div>
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
            <div v-if="article.tags && article.tags.length" class="tags-container">
              <span class="tags-label">Tags:</span>
              <div class="tags">
                <span v-for="(tag, index) in article.tags" :key="index" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
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

// Détermine le thème de couleur pour un article
const getColorThemeClass = (article) => {
  if (!article.tags || !article.tags.length) return 'theme-purple' // Thème par défaut

  const colorTags = {
    rouge: 'theme-red',
    bleu: 'theme-blue',
    vert: 'theme-green',
    violet: 'theme-purple',
    orange: 'theme-orange',
    jaune: 'theme-yellow',
    cyan: 'theme-cyan',
    rose: 'theme-pink',
  }

  // Recherche si l'article a un tag correspondant à une couleur
  for (const tag of article.tags) {
    const tagLower = tag.toLowerCase()
    for (const [colorName, className] of Object.entries(colorTags)) {
      if (tagLower.includes(colorName)) {
        return className
      }
    }
  }

  // Si aucun tag de couleur n'est trouvé, retournez un thème aléatoire
  const themes = Object.values(colorTags)
  return themes[Math.floor(Math.random() * themes.length)]
}

// Style dynamique basé sur le thème de l'article
const getArticleColorStyle = (article) => {
  const themeClass = getColorThemeClass(article)

  // Associer les classes CSS aux gradients
  const gradients = {
    'theme-red': 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
    'theme-blue': 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)',
    'theme-green': 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
    'theme-purple': 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
    'theme-orange': 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
    'theme-yellow': 'linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%)',
    'theme-cyan': 'linear-gradient(135deg, #00bcd4 0%, #26c6da 100%)',
    'theme-pink': 'linear-gradient(135deg, #e91e63 0%, #f48fb1 100%)',
  }

  return {
    background: gradients[themeClass] || gradients['theme-purple'],
  }
}

// Récupération des articles
const fetchArticles = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()

    if (filters.author_uuid) params.append('author_uuid', filters.author_uuid)
    if (filters.created_at) params.append('created_at', filters.created_at)
    if (filters.title) params.append('title', filters.title)
    if (filters.tags) params.append('tags', filters.tags)

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

// Détection du scroll pour les animations
const handleScroll = () => {
  const reveals = document.querySelectorAll('.reveal')

  reveals.forEach((element) => {
    const windowHeight = window.innerHeight
    const elementTop = element.getBoundingClientRect().top
    const elementVisible = 150

    if (elementTop < windowHeight - elementVisible) {
      element.classList.add('active')
    }
  })
}

// Chargement initial des articles
onMounted(() => {
  fetchArticles()
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Appel initial pour les éléments visibles
})
</script>

<style scoped>
/* Section d'en-tête */
.section-header {
  text-align: center;
  margin-bottom: var(--space-xxl);
  padding-top: var(--space-xl);
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
}

/* Conteneur principal */
.articles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-md);
}

/* Filtres */
.filters-container {
  padding: var(--space-lg);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--space-xl);
}

.filters-container h3 {
  margin-top: 0;
  margin-bottom: var(--space-md);
  color: var(--text-color);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-md);
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: 500;
  margin-bottom: var(--space-xs);
}

.glass-input {
  padding: var(--space-sm);
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--border-radius-sm);
  backdrop-filter: blur(5px);
}

.filter-buttons {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-end;
}

/* État de chargement */
.loading {
  text-align: center;
  padding: var(--space-xxl) 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(126, 87, 194, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  margin: 0 auto var(--space-lg);
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* État vide */
.no-articles {
  text-align: center;
  padding: var(--space-xxl) 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-light);
}

/* Grille d'articles */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-xl);
}

/* Animation pour la liste d'articles */
.article-list-enter-active {
  animation: slideUp 0.5s ease-out forwards;
}

.article-list-leave-active {
  animation: fadeOut 0.3s ease-in forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Carte d'article */
.article-card {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  height: 100%;
  animation: slideUp 0.5s ease-out forwards;
  animation-fill-mode: both;
  position: relative;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(
    --theme-gradient,
    linear-gradient(90deg, var(--primary-color), var(--accent-color))
  );
}

.article-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-lg);
}

.article-image {
  height: 180px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.article-card:hover .article-image img {
  transform: scale(1.05);
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--gray-100);
  overflow: hidden;
}

.color-preview {
  width: 100%;
  height: 100%;
  animation: colorChange 8s infinite;
  background-size: 200% 200%;
}

.article-content {
  padding: var(--space-lg);
  background: white;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-card h2 {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: var(--space-sm);
  transition: color var(--transition-fast);
}

.article-card:hover h2 {
  color: var(--theme-text, var(--primary-color));
}

.article-card a {
  color: inherit;
  text-decoration: none;
}

.article-description {
  color: var(--text-light);
  margin-bottom: var(--space-md);
  flex-grow: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.article-meta {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-top: auto;
  border-top: 1px solid var(--gray-200);
  padding-top: var(--space-sm);
}

.article-meta p {
  margin: 0 0 var(--space-xs);
}

.tags-container {
  display: flex;
  align-items: flex-start;
}

.tags-label {
  font-weight: bold;
  margin-right: var(--space-xs);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.tag {
  background-color: var(--theme-secondary, var(--gray-200));
  color: var(--theme-text, var(--text-color));
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .articles-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
</style>
