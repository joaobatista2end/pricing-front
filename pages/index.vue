<template>
  <UContainer class="mt-6">
    <h1 class="text-2xl font-bold mb-4">Applications</h1>

    <ULink href="/products" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 hover:cursor-pointer">
      <div class="bg-green-200/40 border-green-600 border-2 text-green-600 p-4 rounded-lg">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:cube" class="text-[32px]" />
          <h2 class="text-lg font-bold">Product Classifier</h2>
        </div>

        <hr class="my-2 opacity-50">

        <p class="text-sm">
          Classify products into categories based on their description.
        </p>
      </div>
    </ULink>
  </UContainer>
</template>

<script setup lang="ts"></script>
