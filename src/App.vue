<template>
  <div id="app">
    <Header />
    <!-- Si vous avez un composant Header -->
    <router-view />
    <!-- C'est ici que les différentes pages seront affichées -->
    <Footer />
    <!-- Si vous avez un composant Footer -->
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue' // Si applicable
//import Footer from '@/components/Footer.vue' // Si applicable
</script>
