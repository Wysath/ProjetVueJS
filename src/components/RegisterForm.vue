<template>
  <div>
    <h1>Register</h1>
    <form @submit.prevent="register">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required />
      <button type="submit">Register</button>
    </form>
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
    alert('Passwords do not match!')
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
      alert('Registration successful! You can now log in.')
      router.push('/login')
    } else {
      alert('Registration failed. Please try again.')
    }
  } catch (error) {
    console.error('Error during registration:', error)
    if (error.message) {
      alert(`An error occurred: ${error.message}`)
    } else {
      alert('An error occurred during registration.')
    }
  }
}
</script>
