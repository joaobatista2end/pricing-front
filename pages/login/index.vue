<template>
    <UContainer class="mt-6">
        <UCard class="w-full max-w-md p-6 space-y-6 mx-auto">
            <div class="text-center">
                <h1 class="text-2xl font-semibold mb-2">Login</h1>
                <p class="text-sm text-gray-500">Entre com sua conta Google</p>
            </div>
            
            <hr class="border-t border-gray-200 my-4">

            <UButton 
                block
                color="white" 
                variant="outline" 
                class="flex items-center justify-center gap-2"
                :loading="isLoading"
                @click="signInWithGoogle"
            >
                <UIcon name="i-logos-google-icon" class="h-5 w-5" />
                Entrar com Google
            </UButton>
        </UCard>
    </UContainer>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const isLoading = ref(false);

const signInWithGoogle = async () => {
    try {
        isLoading.value = true;
        
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/confirm`,
            },
        });
        
        if (error) {
            console.error("Erro ao autenticar:", error.message);
            UNotification.add({
                title: 'Erro ao autenticar',
                description: error.message,
                color: 'red'
            });
        }
    } catch (err) {
        console.error("Erro ao processar login:", err);
    } finally {
        isLoading.value = false;
    }
};
</script>
