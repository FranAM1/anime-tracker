<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from './components/Header.vue'
import SearchBar from './components/SearchBar.vue'

const api_url = 'https://api.jikan.moe/v4/'
const all_anime = ref([])
const anime_list: any = ref([])

onMounted(async () => {
  const response = await fetch(`${api_url}anime`)
  const data = await response.json()
  all_anime.value = data.data
  anime_list.value = data.data
})

function searchAnime(search: string) {
  if(search.length == 0) return anime_list.value = all_anime.value
  anime_list.value = all_anime.value.filter((anime: any) => anime.title.toLowerCase().includes(search.toLowerCase()))
}

</script>

<template>
  <Header/>
  <main class="text-white p-5 flex justify-center items-center flex-col gap-8">
    <SearchBar @input-search="searchAnime"/>
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