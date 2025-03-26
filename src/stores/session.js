// session.js (Pinia Store)
import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'

export const useSession = defineStore('session', () => {
  // Données utilisateur dans le store Pinia
  const user = ref({
    email: null,
    uuid: null,
    roles: [],
  })
  const loggedIn = ref(false)

  // Utilisation de SessionStorage pour stocker le token
  const token = computed(() => sessionStorage.getItem('token'))

  // Initialiser les données de l'utilisateur depuis sessionStorage lors du montage
  onMounted(() => {
    checkAuth()
  })

  // Fonction pour vérifier l'état d'authentification
  function checkAuth() {
    const storedUser = sessionStorage.getItem('user')
    const storedToken = sessionStorage.getItem('token')

    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        loggedIn.value = true
      } catch (e) {
        console.error('Failed to parse stored user', e)
        logout()
      }
    } else {
      loggedIn.value = false
    }
  }

  // Fonction pour se connecter
  function login(newUser, newToken) {
    user.value = newUser
    loggedIn.value = true
    sessionStorage.setItem('token', newToken)
    sessionStorage.setItem('user', JSON.stringify(newUser))
  }

  // Fonction pour se déconnecter
  function logout() {
    loggedIn.value = false
    user.value = { email: null, uuid: null, roles: [] }
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
  }

  // Fonction pour vérifier si un utilisateur a un rôle spécifique
  function hasRole(role) {
    return user.value.roles && user.value.roles.includes(role)
  }

  return {
    user,
    loggedIn,
    token,
    login,
    logout,
    hasRole,
    checkAuth,
  }
})
