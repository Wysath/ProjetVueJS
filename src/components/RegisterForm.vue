<template>
  <div class="register-container animate-fade-in">
    <div class="register-form-card glass">
      <div class="color-accent"></div>

      <h1>Créer un compte</h1>
      <p class="subtitle">Rejoignez Palette Couleur pour découvrir et partager</p>

      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <input
              id="email"
              type="email"
              v-model="email"
              placeholder="Votre adresse email"
              required
              class="glass-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="input-wrapper">
            <input
              id="password"
              type="password"
              v-model="password"
              placeholder="Au moins 8 caractères"
              required
              class="glass-input"
              pattern=".{8,}"
              title="Le mot de passe doit contenir au moins 8 caractères"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <div class="input-wrapper">
            <input
              id="confirmPassword"
              type="password"
              v-model="confirmPassword"
              placeholder="Confirmer votre mot de passe"
              required
              class="glass-input"
            />
          </div>
        </div>

        <button type="submit" class="submit-btn">
          <span>S'inscrire</span>
        </button>

        <div class="login-link">
          <span>Déjà inscrit?</span>
          <router-link to="/login">Se connecter</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const router = useRouter()

const register = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Les mots de passe ne correspondent pas!')
    return
  }

  try {
    const response = await api('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
      },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })

    if (response['@id']) {
      alert('Inscription réussie! Vous pouvez maintenant vous connecter.')
      router.push('/login')
    } else {
      alert("L'inscription a échoué. Veuillez réessayer.")
    }
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    if (error.message) {
      alert(`Une erreur est survenue: ${error.message}`)
    } else {
      alert("Une erreur est survenue lors de l'inscription.")
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--space-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  position: relative;
}

.register-container::before {
  content: '';
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

.register-form-card {
  width: 100%;
  max-width: 500px;
  padding: var(--space-xl);
  border-radius: var(--border-radius-lg);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
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
  animation: gradientShift 10s ease infinite;
}

@keyframes gradientShift {
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
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-color);
}

.input-wrapper {
  position: relative;
}

.glass-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-md);
  background: rgba(255, 255, 255, 0.5);
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

.glass-input::placeholder {
  color: var(--text-light);
  opacity: 0.7;
}

.submit-btn {
  margin-top: var(--space-md);
  padding: 14px 20px;
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

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s ease;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 15px rgba(126, 87, 194, 0.3);
}

.submit-btn:hover::before {
  left: 100%;
}

.login-link {
  margin-top: var(--space-md);
  text-align: center;
  font-size: 0.95rem;
}

.login-link span {
  color: var(--text-light);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  margin-left: var(--space-xs);
  transition: all var(--transition-normal);
}

.login-link a:hover {
  color: var(--accent-color);
  text-decoration: underline;
}

/* Animation */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .register-form-card {
    padding: var(--space-lg);
  }

  h1 {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .register-form-card {
    padding: var(--space-md);
  }

  h1 {
    font-size: 1.5rem;
  }

  .submit-btn {
    font-size: 1rem;
    padding: 12px 16px;
  }
}
</style>
