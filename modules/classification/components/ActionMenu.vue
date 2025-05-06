<template>
  <div>
    <UDropdown :items="menuItems" :popper="{ placement: 'bottom-end' }">
      <UButton 
        color="neutral" 
        variant="ghost" 
        icon="i-heroicons-ellipsis-vertical" 
        class="h-8 w-8 p-0"
      />
    </UDropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  nodeType: 'divisao' | 'departamento' | 'categoria' | 'subcategoria';
  nodeId: string;
  nodeName: string;
}>();

const emit = defineEmits<{
  'add-child': [nodeType: string, parentId: string, parentName: string];
  'edit-node': [nodeType: string, nodeId: string, nodeName: string];
  'delete-node': [nodeType: string, nodeId: string, nodeName: string];
}>();

const menuItems = computed(() => {
  const items = [];
  
  // Opções específicas com base no tipo de nó
  switch(props.nodeType) {
    case 'divisao':
      items.push({
        label: 'Adicionar Departamento',
        icon: 'i-heroicons-plus-circle',
        click: () => emit('add-child', 'departamento', props.nodeId, props.nodeName)
      });
      break;
    case 'departamento':
      items.push({
        label: 'Adicionar Categoria',
        icon: 'i-heroicons-plus-circle',
        click: () => emit('add-child', 'categoria', props.nodeId, props.nodeName)
      });
      break;
    case 'categoria':
      items.push({
        label: 'Adicionar Subcategoria',
        icon: 'i-heroicons-plus-circle',
        click: () => emit('add-child', 'subcategoria', props.nodeId, props.nodeName)
      });
      break;
  }
  
  // Opções comuns para todos os tipos
  items.push(
    {
      label: 'Editar',
      icon: 'i-heroicons-pencil-square',
      click: () => emit('edit-node', props.nodeType, props.nodeId, props.nodeName)
    },
    {
      label: 'Remover',
      icon: 'i-heroicons-trash',
      click: () => emit('delete-node', props.nodeType, props.nodeId, props.nodeName)
    }
  );
  
  return items;
});
</script> 