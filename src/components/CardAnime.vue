<script setup lang="ts">
import type { PropType } from 'vue'
import type { Datum } from '@/types/anime';

const props = defineProps({
    anime: {
        type: Object as PropType<Datum>,
        required: true
    }
})

const emit = defineEmits([
    'addAnime'
])

</script>
<template>
    <h2>{{ anime.title }}</h2>
    <img class="max-h-80 rounded-xl" :src="anime.images.jpg.image_url">
    <button class="bg-yellow-500 text-black rounded-lg px-4 py-2 m-2 mb-4 transition-colors duration-300 hover:bg-yellow-600" @click="$emit('addAnime', anime)">Add to my list</button>
</template>