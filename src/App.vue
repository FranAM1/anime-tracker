<script setup lang="ts">
import { ref, onMounted, onUnmounted} from 'vue'
import Header from './components/Header.vue'
import SearchBar from './components/SearchBar.vue'
import type { Anime, Datum } from './types/anime';

const api_url = 'https://api.jikan.moe/v4/'
const all_anime = ref<Datum[]>([])
const anime_list = ref<Datum[]>([])
const count_page = ref(1)

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)

  const response = await fetch(`${api_url}anime`)
  const data = await response.json() as Anime
  all_anime.value = data.data
  anime_list.value = data.data
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    getAnimes()
  }
}

async function getAnimes() {
  count_page.value++
  const response = await fetch(`${api_url}anime?page=${count_page.value}`)
  const data = await response.json()
  all_anime.value.push(data.data)
}

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