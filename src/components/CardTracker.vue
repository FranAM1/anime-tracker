<script setup lang="ts">
import type { MyAnime } from '@/types/anime';

const props = defineProps<{
    anime: MyAnime
}>()

</script>

<template>
    <h2>{{ anime.title }}</h2>
    <img class="max-h-80 rounded-xl" :src="anime.image">
    <div class="flex gap-2 justify-center items-center">
        <button class="bg-blue-500 rounded-lg px-4 py-2 transition-colors duration-300 hover:bg-blue-800" @click="$emit('decreaseEpisode', anime)">-</button>
        <h2>{{ anime.watched_episodes }} / {{ anime.total_episodes }}</h2>
        <button class="bg-blue-500 rounded-lg px-4 py-2  transition-colors duration-300 hover:bg-blue-800" @click="$emit('increaseEpisode', anime)">+</button>
    </div>
    <button class="bg-blue-500 rounded-lg px-4 py-2 transition-colors duration-300 hover:bg-blue-800" @click="$emit('removeAnime',anime.id)">Remove</button>
</template>

