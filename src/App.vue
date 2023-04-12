<script setup lang="ts">
import { ref, onMounted, onUnmounted} from 'vue'
import CardTracker from './components/CardTracker.vue'
import CardAnime from './components/CardAnime.vue'
import Header from './components/Header.vue'
import SearchBar from './components/SearchBar.vue'
import type { Anime, Datum, MyAnime } from './types/anime';

const api_url = 'https://api.jikan.moe/v4/'
const all_anime = ref<Datum[]>([])
const anime_list = ref<Datum[]>([])
const my_list = ref<MyAnime[]>([])
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
  
  data.data.forEach((anime: Datum) => {
    all_anime.value.push(anime)
  })
}

async function searchAnime(search: string) {
  count_page.value = 1
  const response = await fetch(`${api_url}anime?q=${search}`)
  const data = await response.json()
  anime_list.value = data.data
}

function addAnime (anime: Datum) {
  if(!anime.episodes) return 

  const isAnimeInList = my_list.value.some((item) => item.id === anime.mal_id)
  
  if(isAnimeInList) return

  my_list.value.push({
    id: anime.mal_id,
    title: anime.title,
    image: anime.images.jpg.image_url,
    total_episodes: anime.episodes,
    watched_episodes: 0,
  })


}

function removeAnime (id: number) {
  my_list.value = my_list.value.filter((anime) => anime.id !== id)
}

function increaseEpisode (anime: MyAnime) {
  if(anime.total_episodes && anime.watched_episodes < anime.total_episodes) {
    anime.watched_episodes++
  }
}

function decreaseEpisode (anime: MyAnime) {
  if(anime.watched_episodes > 0) {
    anime.watched_episodes--
  }
}

</script>

<template>
  <Header/>
  <main class="text-white p-5 flex justify-center items-center flex-col gap-8">
    <div class="flex flex-col justify-center items-center gap-4">
      <h1 class="text-4xl font-bold">My List</h1>
      <div class="grid grid-cols-3 gap-4">
        <div class="flex flex-col gap-2 items-center" v-for="anime in my_list">
          <CardTracker :anime="anime" @removeAnime="removeAnime" @increaseEpisode="increaseEpisode" @decreaseEpisode="decreaseEpisode"/>
        </div>
      </div>
    </div>
    <SearchBar @input-search="searchAnime"/>
    <div class="grid grid-cols-3 gap-4">
      <div class="flex flex-col gap-2 items-center" v-for="anime in anime_list">
        <CardAnime :anime="anime" @addAnime="addAnime"/>
      </div>
    </div>
  </main>
</template>

<style>
#app{
  min-height: 100vh;
}

</style>