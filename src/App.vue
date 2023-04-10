<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Header from './components/Header.vue'
import SearchBar from './components/SearchBar.vue'

const api_url = 'https://api.jikan.moe/v4/'
const anime_list: any = ref([])
const search_query = ref('')

onMounted(async () => {
  const response = await fetch(`${api_url}anime`)
  const data = await response.json()
  anime_list.value = data.data
})

</script>

<template>
  <Header/>
  <main class="text-white p-5 flex justify-center items-center flex-col gap-8">
    <SearchBar/>
    <div class="grid grid-cols-3 gap-4">
      <div class="flex flex-col gap-2 items-center" v-for="anime in anime_list">
        <h2>{{ anime.title }}</h2>
        <img class="max-h-80 rounded-xl" :src="anime.images.jpg.image_url">
      </div>
    </div>
    
  </main>
</template>

<style>
#app{
  min-height: 100vh;
}

</style>