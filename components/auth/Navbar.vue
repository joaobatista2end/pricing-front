<template>
    <header class="border-b border-gray-200 dark:border-gray-800 py-3 px-4">
        <UContainer>
            <div class="flex items-center justify-between">
                <!-- Logo -->
                <NuxtLink to="/" class="flex items-center gap-2">
                    <UIcon name="i-heroicons-cube" class="h-8 w-8 text-primary" />
                    <span class="font-bold text-xl">Pricing App</span>
                </NuxtLink>
                
                <!-- User Menu -->
                <div v-if="user" class="flex items-center gap-2">
                    <UDropdownMenu
                        :items="userMenuItems"
                        :content="{
                            align: 'end',
                            side: 'bottom',
                            sideOffset: 8
                        }"
                        :ui="{
                            content: 'w-48'
                        }"
                    >
                        <UButton color="neutral" variant="ghost" class="flex items-center gap-2">
                            <UAvatar 
                                v-if="user.user_metadata?.avatar_url" 
                                :src="user.user_metadata.avatar_url" 
                                :alt="user.user_metadata?.name || user.email" 
                            />
                            <span>{{ user.user_metadata?.name || user.email }}</span>
                            <UIcon name="i-heroicons-chevron-down" />
                        </UButton>
                    </UDropdownMenu>
                    <UButton 
                        v-if="!user && route.path !== '/login'"
                        to="/login" 
                        variant="ghost"
                    >
                        Entrar
                    </UButton>
                </div>
                
            </div>
        </UContainer>
    </header>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const toast = useToast();
const isLoggingOut = ref(false);
const route = useRoute();

const handleLogout = async () => {
    try {
        isLoggingOut.value = true;
        await supabase.auth.signOut();
        
        toast.add({
            title: 'Logout realizado',
            description: 'Você foi desconectado com sucesso',
            color: 'success',
            icon: 'i-heroicons-check-circle'
        });
        
        navigateTo('/login');
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        toast.add({
            title: 'Erro ao fazer logout',
            description: 'Ocorreu um erro ao tentar desconectar',
            color: 'error',
            icon: 'i-heroicons-exclamation-circle'
        });
    } finally {
        isLoggingOut.value = false;
    }
};

const userMenuItems = computed<DropdownMenuItem[]>(() => [
    {
        label: 'Perfil',
        icon: 'i-heroicons-user',
        to: '/profile'
    },
    {
        label: 'Árvore de Classificação',
        icon: 'i-heroicons-chart-bar-square',
        to: '/classification-tree'
    },
    {
        label: 'Sair',
        icon: 'i-heroicons-arrow-right-on-rectangle',
        onSelect: handleLogout
    }
]);
</script> 