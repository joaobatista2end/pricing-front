<!-- ClearableInputMenu.vue -->
<template>
    <div class="relative">
      <!-- InputMenu component -->
      <UInputMenu
        :model-value="modelValue"
        :options="options"
        :placeholder="placeholder"
        class="w-full"
        v-bind="$attrs"
        @update:model-value="$emit('update:modelValue', $event)"
      />
      
      <!-- Botão de limpar -->
      <UButton
        v-if="modelValue"
        icon="i-heroicons-x-mark"
        color="gray"
        variant="ghost"
        size="sm"
        class="absolute right-2 top-1/2 -translate-y-1/2"
        aria-label="Limpar seleção"
        @click="clearSelection"
      />
    </div>
  </template>
  
  <script setup lang="ts">
 defineProps({
    modelValue: {
      type: [String, Number, Object, Array, null],
      default: null
    },
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Selecione uma opção'
    }
  });
  
  // Emits para comunicação com o componente pai
  const emit = defineEmits(['update:modelValue']);
  
  // Função para limpar a seleção
  const clearSelection = () => {
    emit('update:modelValue', null);
  };
  </script>