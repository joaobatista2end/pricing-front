<template>
  <UContainer class="py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">Produtos</h1>
      <p class="text-gray-500">Gerencie e visualize todos os produtos disponíveis</p>
    </div>
    
    <ProductsProductsList />
  </UContainer>
</template>

<script setup lang="ts">
import ProductsProductsList from '~/modules/products/components/ProductsList.vue';
definePageMeta({
  middleware: ['global-auth'],
  layout: 'default'
});
</script>
