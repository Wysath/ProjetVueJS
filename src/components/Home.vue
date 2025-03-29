<template>
  <div class="home-container">
    <!-- Section Hero avec animation de couleurs -->
    <section class="hero-section">
      <div class="color-circles">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="circle c3"></div>
        <div class="circle c4"></div>
      </div>

      <div class="hero-content glass animate-fade-in">
        <h1 class="main-title">
          <span class="gradient-text">Palette</span>
          <br />
          <span class="gradient-text-2">Couleur</span>
        </h1>
        <p class="tagline">
          Explorez l'univers fascinant de la psychologie des couleurs et du design
        </p>
        <div class="cta-buttons">
          <router-link to="/articles" class="cta-primary">Découvrir les articles</router-link>
          <router-link to="/register" class="cta-secondary">Rejoindre la communauté</router-link>
        </div>
      </div>
    </section>

    <!-- Section Introduction -->
    <section class="intro-section glass">
      <div class="section-header">
        <h2>À propos de Palette Couleur</h2>
        <div class="color-accent animate-morphing"></div>
      </div>

      <div class="intro-content">
        <div class="intro-text">
          <p>
            Bienvenue dans un espace où les couleurs racontent des histoires et où le design devient
            une expérience sensorielle. <strong>Palette Couleur</strong> explore l'impact profond
            des couleurs sur nos émotions, nos perceptions et nos décisions.
          </p>
          <p>
            Chaque article plonge dans une teinte particulière, son histoire culturelle, son
            symbolisme psychologique et son application en design contemporain.
          </p>
        </div>

        <div class="color-wheel animate-rotate">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #ff0000" />
                <stop offset="100%" style="stop-color: #ff00ff" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #ff00ff" />
                <stop offset="100%" style="stop-color: #0000ff" />
              </linearGradient>
              <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #0000ff" />
                <stop offset="100%" style="stop-color: #00ffff" />
              </linearGradient>
              <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #00ffff" />
                <stop offset="100%" style="stop-color: #00ff00" />
              </linearGradient>
              <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #00ff00" />
                <stop offset="100%" style="stop-color: #ffff00" />
              </linearGradient>
              <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #ffff00" />
                <stop offset="100%" style="stop-color: #ff0000" />
              </linearGradient>
            </defs>
            <path d="M100,10 A90,90 0 0,1 145,25 L100,100 Z" fill="url(#grad1)" />
            <path d="M145,25 A90,90 0 0,1 175,75 L100,100 Z" fill="url(#grad2)" />
            <path d="M175,75 A90,90 0 0,1 145,175 L100,100 Z" fill="url(#grad3)" />
            <path d="M145,175 A90,90 0 0,1 55,175 L100,100 Z" fill="url(#grad4)" />
            <path d="M55,175 A90,90 0 0,1 25,75 L100,100 Z" fill="url(#grad5)" />
            <path d="M25,75 A90,90 0 0,1 100,10 L100,100 Z" fill="url(#grad6)" />
            <circle cx="100" cy="100" r="15" fill="white" />
          </svg>
        </div>
      </div>
    </section>

    <!-- Section Articles -->
    <section class="featured-articles">
      <div class="section-header">
        <h2>Articles Récents</h2>
        <div class="color-accent animate-morphing"></div>
      </div>

      <div class="articles-preview">
        <div
          v-for="(article, index) in articles"
          :key="index"
          class="article-card glass"
          :class="`theme-${article.theme}`"
        >
          <div class="card-color-accent"></div>
          <div class="article-image" :style="{ backgroundImage: `url(${article.image})` }">
            <div class="article-tag">{{ article.tag }}</div>
          </div>
          <div class="article-content">
            <h3>{{ article.title }}</h3>
            <div class="article-date">{{ article.date }}</div>
            <p>{{ article.description }}</p>
            <router-link :to="`/articles/${article.id}`" class="read-more">
              Lire l'article
            </router-link>
          </div>
        </div>
      </div>

      <div class="view-all-container">
        <router-link to="/articles" class="view-all-btn">Voir tous les articles</router-link>
      </div>
    </section>

    <!-- Section Couleurs et Émotions -->
    <section class="emotions-section">
      <div class="section-header">
        <h2>Couleurs & Émotions</h2>
        <div class="color-accent animate-morphing"></div>
      </div>

      <div class="emotions-grid">
        <div
          v-for="emotion in emotions"
          :key="emotion.name"
          :class="`emotion-card ${emotion.color}`"
          @mouseover="activeEmotion = emotion.name"
          @mouseout="activeEmotion = ''"
        >
          <div class="emotion-content" :class="{ active: activeEmotion === emotion.name }">
            <h3>{{ emotion.title }}</h3>
            <p>{{ emotion.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { api } from '@/services/api'
const activeEmotion = ref('')
const articles = ref([])

// Liste des émotions pour la section Couleurs & Émotions
const emotions = [
  {
    name: 'passion',
    title: 'Passion',
    description: "Le rouge évoque l'intensité et la force des sentiments ardents",
    color: 'red',
  },
  {
    name: 'sérénité',
    title: 'Sérénité',
    description: "Le bleu nous invite au calme et à la tranquillité d'esprit",
    color: 'blue',
  },
  {
    name: 'joie',
    title: 'Joie',
    description: "Le jaune rayonne d'optimisme et d'énergie positive",
    color: 'yellow',
  },
  {
    name: 'harmonie',
    title: 'Harmonie',
    description: "Le vert symbolise l'équilibre et la connexion avec la nature",
    color: 'green',
  },
  {
    name: 'créativité',
    title: 'Créativité',
    description: "Le violet inspire l'imagination et la pensée hors du commun",
    color: 'purple',
  },
  {
    name: 'énergie',
    title: 'Énergie',
    description: "L'orange stimule l'enthousiasme et la vitalité",
    color: 'orange',
  },
]

// Animation des cercles de couleur dans le hero
let rafId = null
const animateCircles = () => {
  const circles = document.querySelectorAll('.circle')
  const scrollY = window.scrollY

  circles.forEach((circle, index) => {
    const speed = 0.05 + index * 0.01
    const yPos = scrollY * speed
    const xPos = Math.sin(scrollY * 0.001 + index) * 20

    circle.style.transform = `translateY(${-yPos}px) translateX(${xPos}px)`
  })

  rafId = requestAnimationFrame(animateCircles)
}

// Récupérer les derniers articles depuis l'API (limité à 3)
const fetchArticles = async () => {
  try {
    // Récupérer les articles triés par date de création décroissante
    const response = await api(
      '/api/contents?order[createdAt]=desc&page=1&itemsPerPage=3', // Limitez à 3 articles
      {},
      false,
    )

    if (response && response.member) {
      // S'assurer qu'on a max 3 articles
      const articleList = response.member.slice(0, 3)

      articles.value = articleList.map((article) => ({
        id: article.uuid,
        title: article.title,
        description: article.metaDescription,
        image: article.coverImage || 'https://via.placeholder.com/300x200',
        tag: article.tags && article.tags[0] ? article.tags[0] : 'Article',
        theme: getThemeFromTags(article.tags || []),
        date: new Date(article.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      }))
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
  }
}

// Détermine un thème de couleur basé sur les tags
const getThemeFromTags = (tags) => {
  const colorMap = {
    rouge: 'red',
    bleu: 'blue',
    vert: 'green',
    violet: 'purple',
    orange: 'orange',
    jaune: 'yellow',
    cyan: 'cyan',
    rose: 'pink',
  }

  for (const tag of tags) {
    const colorName = Object.keys(colorMap).find((color) => tag.toLowerCase().includes(color))
    if (colorName) return colorMap[colorName]
  }

  return 'purple' // Couleur par défaut
}

onMounted(() => {
  fetchArticles()
  animateCircles()
  window.addEventListener('scroll', animateCircles)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('scroll', animateCircles)
})
</script>

<style scoped>
/* Styles généraux */
.home-container {
  overflow-x: hidden;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.section-header h2 {
  font-size: 2.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 1rem;
}

.color-accent {
  height: 5px;
  width: 80px;
  margin: 0 auto;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--accent-color),
    var(--secondary-color),
    var(--primary-color)
  );
  background-size: 300% 300%;
  animation: colorChange 8s infinite;
  border-radius: var(--border-radius-md);
}

/* Section Hero */
.hero-section {
  height: 100vh;
  min-height: 700px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.color-circles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.7;
}

.c1 {
  width: 400px;
  height: 400px;
  background: #7e57c2;
  top: -100px;
  left: -100px;
}

.c2 {
  width: 500px;
  height: 500px;
  background: #e91e63;
  bottom: -150px;
  right: -150px;
}

.c3 {
  width: 300px;
  height: 300px;
  background: #42b883;
  top: 50%;
  left: 20%;
}

.c4 {
  width: 350px;
  height: 350px;
  background: #2196f3;
  bottom: 10%;
  left: 40%;
}

.hero-content {
  text-align: center;
  max-width: 900px;
  padding: 4rem;
  border-radius: var(--border-radius-lg);
  position: relative;
  z-index: 2;
}

.main-title {
  font-size: 5rem;
  line-height: 1.1;
  margin-bottom: 2rem;
  font-weight: 800;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.gradient-text-2 {
  background: linear-gradient(135deg, var(--secondary-color), #42b883);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  font-size: 1.5rem;
  color: rgba(50, 3, 43, 0.9);
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.cta-primary,
.cta-secondary {
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.cta-primary {
  background: linear-gradient(135deg, var(--primary-color), #9575cd);
  color: white;
  box-shadow: 0 5px 15px rgba(126, 87, 194, 0.4);
}

.cta-secondary {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: rgb(20, 19, 19);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cta-primary:hover,
.cta-secondary:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* Section Introduction */
.intro-section {
  padding: 5rem 2rem;
  margin: 3rem auto;
  max-width: 1200px;
  border-radius: var(--border-radius-lg);
}

.intro-content {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.intro-text {
  flex: 1;
  font-size: 1.2rem;
  line-height: 1.7;
}

.intro-text p {
  margin-bottom: 1.5rem;
}

.color-wheel {
  flex: 0 0 300px;
  animation: rotate 60s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Section Articles */
.featured-articles {
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.articles-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  margin-bottom: 3rem;
}

.article-card {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.article-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card-color-accent {
  height: 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.theme-blue .card-color-accent {
  background: linear-gradient(90deg, #2196f3, #03a9f4);
}
.theme-red .card-color-accent {
  background: linear-gradient(90deg, #f44336, #e91e63);
}
.theme-green .card-color-accent {
  background: linear-gradient(90deg, #4caf50, #8bc34a);
}
.theme-purple .card-color-accent {
  background: linear-gradient(90deg, #9c27b0, #673ab7);
}
.theme-orange .card-color-accent {
  background: linear-gradient(90deg, #ff9800, #ff5722);
}
.theme-yellow .card-color-accent {
  background: linear-gradient(90deg, #ffeb3b, #ffc107);
}

.article-image {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.article-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 10px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 500;
}

.article-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.article-date {
  font-size: 0.85rem;
  color: var(--text-light);
  margin-bottom: 1rem;
  font-style: italic;
}

.article-content p {
  color: var(--text-light);
  margin-bottom: 1.5rem;
  flex: 1;
  line-height: 1.5;
}

.read-more {
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 600;
  display: flex;
  align-items: center;
  align-self: flex-start;
  transition: transform 0.2s ease;
}

.read-more:hover {
  transform: translateX(5px);
}

.view-all-container {
  text-align: center;
  margin-top: 2rem;
}

.view-all-btn {
  display: inline-block;
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #9c27b0, #673ab7);
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: 30px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.view-all-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(103, 58, 183, 0.4);
}

/* Section Couleurs et Émotions */
.emotions-section {
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.emotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.emotion-card {
  height: 200px;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.emotion-card:hover {
  transform: translateY(-8px);
}

.emotion-card.red {
  background: linear-gradient(135deg, #f44336, #e91e63);
}
.emotion-card.blue {
  background: linear-gradient(135deg, #2196f3, #03a9f4);
}
.emotion-card.green {
  background: linear-gradient(135deg, #4caf50, #8bc34a);
}
.emotion-card.yellow {
  background: linear-gradient(135deg, #ffeb3b, #ffc107);
}
.emotion-card.purple {
  background: linear-gradient(135deg, #9c27b0, #673ab7);
}
.emotion-card.orange {
  background: linear-gradient(135deg, #ff9800, #ff5722);
}

.emotion-content {
  color: white;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.emotion-content h3 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.emotion-content p {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    max-height 0.4s ease,
    opacity 0.4s ease;
  font-size: 1rem;
  line-height: 1.5;
}

.emotion-content.active p {
  max-height: 100px;
  opacity: 1;
}

/* Animation keyframes */
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

/* Responsive Styles */
@media (max-width: 992px) {
  .main-title {
    font-size: 4rem;
  }

  .tagline {
    font-size: 1.3rem;
  }

  .intro-content {
    flex-direction: column;
  }

  .color-wheel {
    max-width: 250px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .main-title {
    font-size: 3rem;
  }

  .tagline {
    font-size: 1.1rem;
  }

  .cta-buttons {
    flex-direction: column;
    width: 90%;
    max-width: 300px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 2rem;
  }

  .main-title {
    font-size: 2.5rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }
}
</style>
