<template>
    <UContainer class="mt-6">
      <UCard v-if="user" class="mb-6">
        <template #header>
          <div class="flex items-center gap-3">
            <UAvatar 
              v-if="user.user_metadata?.avatar_url" 
              :src="user.user_metadata.avatar_url"
              :alt="user.user_metadata?.name || user.email"
            />
            <div>
              <h2 class="text-lg font-semibold">{{ user.user_metadata?.name || user.email }}</h2>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
          </div>
        </template>
        
        <p>Você está autenticado com o Google.</p>
        <p class="text-sm text-gray-500 mt-2">Acesso concedido em: {{ formatDate(user.created_at) }}</p>
      </UCard>
      
      <div v-else>
        <p>Carregando informações do usuário...</p>
      </div>
    </UContainer>
  </template>
  
  <script setup lang="ts">
  definePageMeta({
    middleware: ['global-auth'],
    layout: 'default'
  });
  
  const user = useSupabaseUser();
  
  function formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  </script>