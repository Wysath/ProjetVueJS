<template>
  <header class="site-header glass animate-fade-in">
    <div class="header-content">
      <div class="logo-container">
        <router-link to="/" class="logo">
          <span class="palette-icon animate-color-change"></span>
          <span class="logo-text">Palette Couleur</span>
        </router-link>
      </div>

      <nav class="main-nav">
        <router-link to="/articles" class="nav-link">Articles</router-link>
        <template v-if="isLoggedIn">
          <button @click="createContent" class="nav-btn btn-create">
            <span class="btn-text">Créer</span>
          </button>
          <button v-if="hasAdminRole" @click="router.push('/admin')" class="nav-btn btn-admin">
            <span class="btn-text">Admin</span>
          </button>
          <button @click="router.push('/profile')" class="nav-btn btn-profile">
            <span class="btn-text">Profil</span>
          </button>
        </template>
      </nav>

      <div class="user-section">
        <template v-if="isLoggedIn">
          <div class="user-info">
            <span class="user-avatar" :style="getUserAvatarStyle()"></span>
            <span class="user-name">{{ userEmail }}</span>
          </div>
          <button @click="logout" class="nav-btn btn-logout">Déconnexion</button>
        </template>
        <button v-else @click="router.push('/login')" class="nav-btn btn-login">
          <span class="btn-text">Connexion</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '../stores/session'

const session = useSession()
const router = useRouter()

// Récupère l'état de connexion depuis le store
const isLoggedIn = computed(() => session.loggedIn)
const userEmail = computed(() => session.user.email)
const hasAdminRole = computed(() => session.hasRole('ROLE_ADMIN'))

// Fonction pour générer un style d'avatar basé sur l'email
const getUserAvatarStyle = () => {
  if (!userEmail.value) return {}

  // Créer un hash simple à partir de l'email pour générer une couleur unique
  let hash = 0
  for (let i = 0; i < userEmail.value.length; i++) {
    hash = userEmail.value.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Convertir le hash en couleur HSL
  const h = Math.abs(hash) % 360

  return {
    background: `linear-gradient(135deg, hsl(${h}, 80%, 60%), hsl(${(h + 60) % 360}, 80%, 45%))`,
  }
}

// S'assure que l'état de session est correctement initialisé au démarrage
onMounted(() => {
  session.checkAuth()
})

const logout = () => {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  session.logout()
  router.push('/login')
}

const createContent = () => {
  router.push('/create-content')
}
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo et titre */
.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
  font-family: var(--font-family-heading);
  font-weight: 600;
  transition: all var(--transition-normal);
}

.logo:hover {
  transform: scale(1.05);
}

.palette-icon {
  display: inline-block;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  margin-right: var(--space-sm);
  background: linear-gradient(135deg, #7e57c2, #e91e63, #ff9800, #4caf50, #2196f3);
  background-size: 500% 500%;
  animation: colorChange 8s infinite;
  position: relative;
  overflow: hidden;
}

.palette-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.logo-text {
  font-size: 1.3rem;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 0.5px;
}

/* Navigation principale */
.main-nav {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.nav-link {
  color: var(--text-color);
  font-weight: 500;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  text-decoration: none;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: width var(--transition-normal);
}

.nav-link:hover::after {
  width: 100%;
}

.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
}

.router-link-active::after {
  width: 100%;
}

/* Boutons de navigation */
.nav-btn {
  padding: var(--space-xs) var(--space-md);
  border-radius: 30px;
  border: none;
  font-family: var(--font-family-body);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-login {
  background: linear-gradient(135deg, var(--primary-color), #9575cd);
  color: white;
}

.btn-create {
  background: linear-gradient(135deg, var(--secondary-color), #81c784);
  color: white;
}

.btn-admin {
  background: linear-gradient(135deg, #ff7675, #fab1a0);
  color: white;
}

.btn-logout {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

.btn-logout:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Section utilisateur */
.user-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  backdrop-filter: blur(5px);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-block;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .logo-text {
    display: none;
  }

  .main-nav {
    order: 3;
    width: 100%;
    justify-content: space-around;
    margin-top: var(--space-sm);
  }

  .user-section {
    gap: var(--space-sm);
  }

  .user-info {
    max-width: 150px;
  }

  .btn-text {
    display: none;
  }

  .nav-btn {
    padding: var(--space-xs);
    width: 36px;
    height: 36px;
  }
}
</style>
