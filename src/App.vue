<template>
  <div id="app">
    <AppHeader />
    <router-view />
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Articles from './components/Articles.vue'
export default {
  components: {
    AppHeader: Header,
    Articles,
  },
}
</script>
