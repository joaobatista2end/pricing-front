<template>
    <UApp>
        <AuthNavbar />
        <div class="min-h-screen">
            <div class="fixed bottom-4 right-4 z-50">
                <UButton
                    :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
                    color="gray"
                    variant="ghost"
                    size="lg"
                    class="rounded-full shadow-lg"
                    @click="toggleColorMode"
                />
            </div>
            <NuxtPage />
        </div>
    </UApp>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

const toggleColorMode = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

