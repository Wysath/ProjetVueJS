<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input type="email" v-model="email" placeholder="Email" />
      <input type="password" v-model="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <router-link to="/register">Register here</router-link></p>
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

    console.log('API Response:', response) // Debug

    if (response.token) {
      sessionStorage.setItem('token', response.token)

      // Faire une requête pour récupérer l'UUID de l'utilisateur connecté
      // en utilisant l'adresse email (qui est unique)
      const userResponse = await api(`/api/users?email=${encodeURIComponent(response.user)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${response.token}`,
        },
      })

      // Vérifier si des utilisateurs ont été retournés
      if (userResponse.member && userResponse.member.length > 0) {
        const user = userResponse.member.find((u) => u.email === response.user)

        if (user) {
          console.log("UUID de l'utilisateur récupéré:", user.uuid)
          console.log("Rôles de l'utilisateur récupérés:", user.roles)
          console.log("Email de l'utilisateur récupéré:", user.email)

          // Mettre à jour le store Pinia avec toutes les informations
          useSession().login(
            {
              email: user.email,
              uuid: user.uuid,
              roles: response.roles, // Utiliser les rôles de la réponse de login
            },
            response.token,
          )

          alert('Login successful!')
          router.push('/articles')
        } else {
          console.error("Utilisateur non trouvé dans la réponse de l'API")
          alert('User not found')
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

        alert('Login successful, but user details could not be retrieved!')
        router.push('/articles')
      }
    } else {
      alert('Invalid email or password')
    }
  } catch (error) {
    console.error('Error during login:', error)
    alert('An error occurred during login')
  }
}
</script>
