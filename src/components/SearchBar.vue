<script setup lang="ts">
import { ref } from 'vue'
import SearchIcon from '@/components/icons/SearchIcon.vue'

const inputSearch = ref('')

</script>

<template>
    <div class="relative flex items-center w-1/4 h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden">
        <div 
        class="grid place-items-center h-full w-12 text-gray-300 cursor-pointer hover:bg-black transition-colors duration-300"
        @click="$emit('inputSearch', inputSearch)">
            <SearchIcon />
        </div>

        <input
        class="pl-2 h-full w-full outline-none text-sm text-gray-700 pr-2"
        type="text"
        id="search"
        placeholder="Search anime.."
        v-model="inputSearch"
        /> 
    </div>
</template>