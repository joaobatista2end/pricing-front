<script setup lang="ts">
const user = useSupabaseUser();

watch(
    user,
    () => {
        if (user.value) {
            return navigateTo("/");
        }
    },
    { immediate: true },
);
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center p-4">
        <UCard class="w-full max-w-md p-6 text-center">
            <h2 class="text-xl font-medium mb-4">Processando login</h2>
            <p class="text-sm text-gray-500">Você será redirecionado em breve...</p>
        </UCard>
    </div>
</template>
