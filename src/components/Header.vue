<script setup lang="ts">
function reloadPage() {
    window.location.reload();
}
</script>

<template>
    <header class="w-full p-8 flex justify-center">
        <h1 class="text-white text-4xl cursor-pointer" @click="reloadPage">MY<strong class="text-yellow-500">ANIME</strong>TRACKER</h1>
    </header>
</template>