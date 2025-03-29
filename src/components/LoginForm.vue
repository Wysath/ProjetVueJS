<template>
  <div class="login-container animate-fade-in">
    <div class="login-background"></div>

    <div class="login-card glass">
      <div class="color-accent animate-morphing"></div>

      <h1>Connexion</h1>
      <p class="subtitle">Bienvenue sur Palette Expérimentale</p>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="Votre adresse email"
              class="glass-input"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="input-wrapper">
            <input
              type="password"
              id="password"
              v-model="password"
              placeholder="Votre mot de passe"
              class="glass-input"
              required
            />
          </div>
        </div>

        <button type="submit" class="submit-btn animate-pulse">
          <span class="btn-text">Se connecter</span>
          <span class="btn-icon"></span>
        </button>
      </form>

      <div class="register-link">
        <p>Pas encore de compte ? <router-link to="/register">Inscrivez-vous</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useSession } from '../stores/session'

const email = ref('')
const password = ref('')
const router = useRouter()

const login = async () => {
  try {
    const response = await api('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
      },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })

    if (response.token) {
      sessionStorage.setItem('token', response.token)

      // Récupération de l'UUID de l'utilisateur connecté
      const userResponse = await api(`/api/users?email=${encodeURIComponent(response.user)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${response.token}`,
        },
      })

      if (userResponse.member && userResponse.member.length > 0) {
        const user = userResponse.member.find((u) => u.email === response.user)

        if (user) {
          // Mettre à jour le store Pinia avec les informations
          useSession().login(
            {
              email: user.email,
              uuid: user.uuid,
              roles: response.roles,
            },
            response.token,
          )

          router.push('/articles')
        } else {
          console.error("Utilisateur non trouvé dans la réponse de l'API")
          alert('Utilisateur non trouvé')
        }
      } else {
        console.error("Aucun utilisateur retourné par l'API")

        // Fallback: utiliser les infos disponibles sans UUID
        useSession().login(
          {
            email: response.user,
            uuid: null,
            roles: response.roles,
          },
          response.token,
        )

        router.push('/articles')
      }
    } else {
      alert('Email ou mot de passe incorrect')
    }
  } catch (error) {
    console.error('Erreur pendant la connexion:', error)
    alert('Une erreur est survenue pendant la connexion')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: var(--space-xl);
  position: relative;
  overflow: hidden;
}

.login-background {
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

.login-card {
  width: 100%;
  max-width: 450px;
  padding: var(--space-xl);
  border-radius: var(--border-radius-lg);
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
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
}

.subtitle {
  color: var(--text-light);
  margin-bottom: var(--space-lg);
  font-size: 1.1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
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

.submit-btn {
  margin-top: var(--space-md);
  padding: 14px;
  background: linear-gradient(135deg, var(--primary-color), #9575cd);
  border: none;
  border-radius: var(--border-radius-md);
  color: white;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.submit-btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.8s;
}

.submit-btn:hover:before {
  left: 100%;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 15px rgba(126, 87, 194, 0.3);
}

.register-link {
  margin-top: var(--space-xl);
  text-align: center;
  color: var(--text-light);
}

.register-link a {
  color: var(--primary-color);
  font-weight: 600;
  transition: all var(--transition-normal);
}

.register-link a:hover {
  color: var(--accent-color);
  text-decoration: underline;
}

@media (max-width: 500px) {
  .login-card {
    padding: var(--space-lg);
  }

  h1 {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }
}
</style>
