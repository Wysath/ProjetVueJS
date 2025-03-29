<template>
  <div class="profile-container animate-fade-in">
    <div class="profile-background"></div>

    <div class="profile-card glass">
      <div class="color-accent animate-morphing"></div>

      <h1>Votre Profil</h1>
      <p class="subtitle">Gérez vos informations personnelles</p>

      <div class="user-info-section">
        <div class="avatar-container">
          <div class="user-avatar" :style="avatarStyle"></div>
          <span class="user-initial">{{ userInitial }}</span>
        </div>

        <div class="user-details">
          <h2>{{ session.user.email }}</h2>
          <div class="user-roles">
            <span v-for="(role, index) in formattedRoles" :key="index" class="role-badge">
              {{ role }}
            </span>
          </div>
        </div>
      </div>

      <!-- Section: Modifier l'email -->
      <section class="profile-section">
        <h3>Changer votre adresse email</h3>
        <form @submit.prevent="updateEmail" class="profile-form">
          <div class="form-group">
            <label for="currentEmail">Email actuel</label>
            <div class="input-wrapper">
              <input
                type="email"
                id="currentEmail"
                v-model="currentEmail"
                class="glass-input"
                disabled
              />
            </div>
          </div>

          <div class="form-group">
            <label for="newEmail">Nouvel email</label>
            <div class="input-wrapper">
              <input
                type="email"
                id="newEmail"
                v-model="newEmail"
                class="glass-input"
                required
                placeholder="Votre nouvelle adresse email"
              />
            </div>
          </div>

          <button type="submit" class="update-btn">
            <span class="btn-text">Mettre à jour l'email</span>
          </button>
        </form>
      </section>

      <!-- Section: Modifier le mot de passe -->
      <section class="profile-section">
        <h3>Changer votre mot de passe</h3>
        <form @submit.prevent="updatePassword" class="profile-form">
          <div class="form-group">
            <label for="currentPassword">Mot de passe actuel</label>
            <div class="input-wrapper">
              <input
                type="password"
                id="currentPassword"
                v-model="currentPassword"
                class="glass-input"
                required
                placeholder="Votre mot de passe actuel"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">Nouveau mot de passe</label>
            <div class="input-wrapper">
              <input
                type="password"
                id="newPassword"
                v-model="newPassword"
                class="glass-input"
                required
                placeholder="Votre nouveau mot de passe"
                pattern=".{8,}"
                title="Le mot de passe doit contenir au moins 8 caractères"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmation du mot de passe</label>
            <div class="input-wrapper">
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                class="glass-input"
                required
                placeholder="Confirmez votre nouveau mot de passe"
              />
              <div v-if="passwordMismatch" class="error-message">
                Les mots de passe ne correspondent pas
              </div>
            </div>
          </div>

          <button type="submit" class="update-btn">
            <span class="btn-text">Mettre à jour le mot de passe</span>
          </button>
        </form>
      </section>

      <!-- Section: Préférences d'abonnement (si applicable) -->
      <section v-if="isSubscriber" class="profile-section">
        <h3>Préférences d'abonnement</h3>
        <div class="subscription-info">
          <div class="subscription-status">
            <span class="status-badge active">Abonnement actif</span>
            <p>Vous êtes abonné à Palette Expérimentale</p>
          </div>

          <div class="preferences-toggles">
            <div class="toggle-item">
              <label class="toggle-switch">
                <input type="checkbox" v-model="emailNotifications" />
                <span class="toggle-slider"></span>
              </label>
              <span>Recevoir les notifications par email</span>
            </div>
          </div>

          <button @click="savePreferences" class="secondary-btn">
            Enregistrer les préférences
          </button>
        </div>
      </section>

      <!-- Section: Abonnement (si non abonné) -->
      <section v-if="!isSubscriber" class="profile-section subscription-section">
        <h3>Devenir abonné</h3>
        <div class="subscription-info">
          <div class="subscription-card">
            <h4 class="subscription-title">Abonnement Premium</h4>
            <div class="subscription-price">
              <span class="price">9.99€</span>
              <span class="period">/mois</span>
            </div>

            <ul class="benefits-list">
              <li><span class="benefit-icon">✓</span> Accès à tous les articles exclusifs</li>
              <li><span class="benefit-icon">✓</span> Possibilité de commenter les articles</li>
              <li><span class="benefit-icon">✓</span> Création et partage de contenu</li>
              <li><span class="benefit-icon">✓</span> Support prioritaire</li>
            </ul>

            <div class="subscription-actions">
              <button @click="subscribeUser" class="subscribe-btn" :disabled="subscribing">
                <span v-if="!subscribing">Devenir abonné</span>
                <span v-else class="loading-text">Traitement en cours...</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Boutons d'action supplémentaires -->
      <div class="action-buttons">
        <button @click="logout" class="logout-btn">Se déconnecter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSession } from '../stores/session'
import { api } from '../services/api'

const router = useRouter()
const session = useSession()

// Variables pour gérer l'état de l'abonnement
const subscribing = ref(false)

// Méthode pour s'abonner
// Remplacez la fonction subscribeUser par celle-ci:
const subscribeUser = async () => {
  try {
    subscribing.value = true

    // Simuler un délai de traitement pour donner l'impression que quelque chose se passe
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Afficher le message que la fonctionnalité est à venir
    alert(
      "Cette fonctionnalité sera bientôt disponible!\n\nNotre système d'abonnement est en cours de développement. Merci pour votre patience.",
    )

    // Éventuellement, vous pourriez laisser un message dans la console pour les développeurs
    console.log("TO-DO: Implémenter l'API d'abonnement côté backend")
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    subscribing.value = false
  }
}

// État du formulaire
const currentEmail = ref('')
const newEmail = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const emailNotifications = ref(true)

// Validation
const passwordMismatch = computed(() => {
  return (
    newPassword.value !== '' &&
    confirmPassword.value !== '' &&
    newPassword.value !== confirmPassword.value
  )
})

// Calcul de l'avatar et des rôles
const avatarStyle = computed(() => {
  const uuid = session.user.uuid || ''
  let hash = 0
  for (let i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return {
    background: `linear-gradient(135deg, hsl(${h}, 80%, 60%), hsl(${(h + 60) % 360}, 80%, 45%))`,
  }
})

const userInitial = computed(() => {
  if (session.user.email) {
    return session.user.email.charAt(0).toUpperCase()
  }
  return '?'
})

const formattedRoles = computed(() => {
  if (!session.user.roles) return []

  return session.user.roles.map((role) => {
    const roleName = role.replace('ROLE_', '')
    return roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase()
  })
})

const isSubscriber = computed(() => {
  return session.hasRole('ROLE_SUBSCRIBER')
})

// Méthodes
const updateEmail = async () => {
  try {
    if (newEmail.value === currentEmail.value) {
      alert("Le nouvel email est identique à l'email actuel.")
      return
    }

    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('Session expirée. Veuillez vous reconnecter.')
      logout()
      return
    }

    const response = await api(`/api/users/${session.user.uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/ld+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: newEmail.value,
      }),
    })

    // Mise à jour du store session
    session.login(
      {
        ...session.user,
        email: newEmail.value,
      },
      token,
    )

    currentEmail.value = newEmail.value
    newEmail.value = ''
    alert('Votre email a été mis à jour avec succès.')
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'email:", error)
    alert(`Échec de la mise à jour de l'email: ${error.message || 'Erreur inconnue'}`)
  }
}

const updatePassword = async () => {
  try {
    if (newPassword.value !== confirmPassword.value) {
      alert('Les mots de passe ne correspondent pas.')
      return
    }

    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('Session expirée. Veuillez vous reconnecter.')
      logout()
      return
    }

    await api(`/api/users/${session.user.uuid}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      }),
    })

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    alert('Votre mot de passe a été modifié avec succès.')
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)

    if (error.message === '400') {
      alert('Le mot de passe actuel est incorrect.')
    } else {
      alert(`Échec du changement de mot de passe: ${error.message || 'Erreur inconnue'}`)
    }
  }
}

const savePreferences = async () => {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      alert('Session expirée. Veuillez vous reconnecter.')
      logout()
      return
    }

    await api(`/api/user-preferences/${session.user.uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        emailNotifications: emailNotifications.value,
      }),
    })

    alert('Vos préférences ont été enregistrées avec succès.')
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des préférences:", error)
    alert("Échec de l'enregistrement des préférences.")
  }
}

const logout = () => {
  session.logout()
  router.push('/login')
}

onMounted(() => {
  // Vérifier si l'utilisateur est connecté
  if (!session.loggedIn) {
    router.push('/login')
    return
  }

  // Initialiser les données
  currentEmail.value = session.user.email

  // Charger les préférences utilisateur
  if (isSubscriber.value) {
    loadUserPreferences()
  }
})

const loadUserPreferences = async () => {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) return

    const response = await api(`/api/user-preferences/${session.user.uuid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response && typeof response.emailNotifications !== 'undefined') {
      emailNotifications.value = response.emailNotifications
    }
  } catch (error) {
    console.error('Erreur lors du chargement des préférences utilisateur:', error)
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: var(--space-xl);
  position: relative;
}

.profile-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 30% 40%, rgba(126, 87, 194, 0.2), transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(66, 184, 131, 0.15), transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 118, 117, 0.1), transparent 70%);
  z-index: -1;
}

.profile-card {
  width: 100%;
  max-width: 800px;
  padding: var(--space-xl);
  border-radius: var(--border-radius-lg);
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  margin: var(--space-xl) 0;
}

.color-accent {
  position: absolute;
  top: 0;
  left: 0;
  height: 5px;
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--accent-color),
    var(--secondary-color),
    var(--primary-color)
  );
  background-size: 300% 300%;
  animation: colorChange 10s infinite;
}

h1 {
  color: var(--primary-color);
  margin-bottom: var(--space-xs);
  font-weight: 700;
  font-size: 2rem;
}

.subtitle {
  color: var(--text-light);
  margin-bottom: var(--space-lg);
  font-size: 1.1rem;
  font-style: italic;
}

/* Section d'information utilisateur */
.user-info-section {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(126, 87, 194, 0.1);
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin-right: var(--space-lg);
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: var(--shadow-md);
}

.user-initial {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.user-details {
  flex-grow: 1;
}

.user-details h2 {
  font-size: 1.5rem;
  margin-bottom: var(--space-xs);
  color: var(--text-color);
}

.user-roles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.role-badge {
  background-color: rgba(126, 87, 194, 0.1);
  color: var(--primary-color);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all var(--transition-normal);
}

/* Sections de profil */
.profile-section {
  margin-bottom: var(--space-xl);
  padding-top: var(--space-md);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid rgba(126, 87, 194, 0.1);
}

.profile-section h3 {
  font-size: 1.3rem;
  margin-bottom: var(--space-md);
  color: var(--text-color);
  font-weight: 600;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  position: relative;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
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
}

.glass-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(126, 87, 194, 0.2);
}

.glass-input:disabled {
  background: rgba(200, 200, 200, 0.2);
  color: var(--text-light);
  cursor: not-allowed;
}

.error-message {
  color: var(--error-color, #e91e63);
  font-size: 0.85rem;
  margin-top: var(--space-xs);
}

/* Boutons */
.update-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary-color), #9575cd);
  border: none;
  border-radius: var(--border-radius-md);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all var(--transition-normal);
  margin-top: var(--space-sm);
  align-self: flex-end;
}

.update-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 15px rgba(126, 87, 194, 0.3);
}

.secondary-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--secondary-color), #2cc07a);
  border: none;
  border-radius: var(--border-radius-md);
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: var(--space-md);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(66, 185, 131, 0.3);
}

.logout-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--text-light), #9e9e9e);
  border: none;
  border-radius: var(--border-radius-md);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.logout-btn:hover {
  background: linear-gradient(135deg, #757575, #616161);
  transform: translateY(-2px);
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
}

/* Préférences d'abonnement */
.subscription-info {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
  padding: var(--space-lg);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(126, 87, 194, 0.1);
}

.subscription-status {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: rgba(66, 185, 131, 0.1);
  color: var(--secondary-color);
}

/* Styles pour la section d'abonnement */
.subscription-section {
  animation: fadeIn 0.5s ease-out;
}

.subscription-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
  border-radius: var(--border-radius-md);
  padding: var(--space-lg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.subscription-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at top right, rgba(126, 87, 194, 0.1), transparent 70%),
    radial-gradient(circle at bottom left, rgba(66, 184, 131, 0.05), transparent 70%);
  z-index: -1;
}

.subscription-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--primary-color);
  text-align: center;
}

.subscription-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: var(--space-lg);
}

.price {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary-color);
  line-height: 1;
}

.period {
  font-size: 1rem;
  color: var(--text-light);
  margin-left: 0.3rem;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin-bottom: var(--space-lg);
}

.benefits-list li {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-sm);
  font-size: 1.05rem;
}

.benefit-icon {
  margin-right: var(--space-sm);
  color: var(--secondary-color);
  font-weight: 700;
}

.subscription-actions {
  display: flex;
  justify-content: center;
}

.subscribe-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, var(--primary-color), #9575cd);
  border: none;
  border-radius: var(--border-radius-md);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.subscribe-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(126, 87, 194, 0.4);
}

.subscribe-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s ease;
}

.subscribe-btn:hover::before {
  left: 100%;
}

.subscribe-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: inline-block;
  position: relative;
}

.loading-text::after {
  content: '...';
  position: absolute;
  animation: loadingDots 1.5s infinite;
  width: 1.2em;
  text-align: left;
}

@keyframes loadingDots {
  0% {
    content: '.';
  }
  33% {
    content: '..';
  }
  66% {
    content: '...';
  }
  100% {
    content: '.';
  }
}
</style>
