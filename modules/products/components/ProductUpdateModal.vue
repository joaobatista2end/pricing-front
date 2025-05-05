<template>
  <UModal v-model:open="isOpen" :title="modalTitle">
    <UButton 
      :label="props.buttonLabel || 'Editar informações'" 
      :icon="props.buttonIcon || 'i-heroicons-pencil-square'" 
      :color="props.buttonColor || 'primary'" 
      :variant="props.buttonVariant || 'solid'" 
      :size="props.buttonSize || 'sm'"
      class="w-full justify-center cursor-pointer"
      @click="openModal"
    />

    <template #body>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <UFormField 
          label="Departamento" 
          name="departamento"
          :error="errors.departamento"
        >
          <UInputMenu
            v-model="formData.departamento"
            :items="departmentOptions"
            placeholder="Selecione um departamento"
            :loading="isLoading"
            value-key="value"
          />
        </UFormField>

        <UFormField 
          label="Grupo" 
          name="grupo"
          :error="errors.grupo"
        >
          <UInputMenu
            v-model="formData.grupo"
            :items="groupOptions"
            placeholder="Selecione um grupo"
            :loading="isLoading"
            value-key="value"
          />
        </UFormField>

        <UFormField 
          label="Tipo" 
          name="tipo"
          :error="errors.tipo"
        >
          <UInput
            v-model="formData.tipo"
            placeholder="Digite o tipo do produto"
          />
        </UFormField>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
        <UButton
          color="gray"
          variant="solid"
          label="Cancelar"
          @click="isOpen = false"
        />
        <UButton
          color="primary"
          variant="solid"
          label="Salvar alterações"
          :loading="isSaving"
          :disabled="isSaving"
          @click="handleSubmit"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ProductDTO } from '../types';
import { useProducts } from '../composables';

const props = defineProps<{
  product?: ProductDTO;
  buttonLabel?: string;
  buttonIcon?: string;
  buttonColor?: string;
  buttonVariant?: string;
  buttonSize?: string;
}>();

const emit = defineEmits<{
  'update': [updatedProduct: Partial<ProductDTO>];
  'success': [message: string];
  'error': [error: Error];
}>();

// Modal state
const isOpen = ref(false);
const isSaving = ref(false);
const errors = ref<Record<string, string>>({});

// Form data
const formData = ref({
  departamento: '',
  grupo: '',
  tipo: '',
});

// Product services
const { 
  departments, 
  groups, 
  isDepartmentsLoading, 
  isGroupsLoading, 
  fetchDepartments,
  fetchGroups
} = useProducts();

const supabase = useSupabaseClient();

// Computed properties
const isLoading = computed(() => isDepartmentsLoading.value || isGroupsLoading.value);

const modalTitle = computed(() => 
  props.product 
    ? `Editar produto: ${props.product.descricao}`
    : 'Editar informações do produto'
);

// Format options for UInputMenu
const departmentOptions = computed(() => {
  return departments.value.map(dep => ({
    label: `${dep.departamento} (${dep.count})`,
    value: dep.departamento
  }));
});

const groupOptions = computed(() => {
  return groups.value.map(group => ({
    label: group,
    value: group
  }));
});

// Methods
function openModal() {
  // Reset form data
  if (props.product) {
    formData.value = {
      departamento: props.product.departamento || '',
      grupo: props.product.grupo || '',
      tipo: props.product.tipo || '',
    };
  } else {
    formData.value = {
      departamento: '',
      grupo: '',
      tipo: '',
    };
  }
  
  // Reset errors
  errors.value = {};
  
  // Load options if needed
  if (departments.value.length === 0) {
    fetchDepartments();
  }
  
  if (groups.value.length === 0) {
    fetchGroups();
  }
  
  // Open modal
  isOpen.value = true;
}

async function handleSubmit() {
  // Validate form
  errors.value = {};
  
  if (!formData.value.departamento) {
    errors.value.departamento = 'Departamento é obrigatório';
  }
  
  if (!formData.value.grupo) {
    errors.value.grupo = 'Grupo é obrigatório';
  }
  
  // If there are validation errors, don't proceed
  if (Object.keys(errors.value).length > 0) {
    return;
  }
  
  // Set saving state
  isSaving.value = true;
  
  try {
    if (props.product) {
      // Update product in database
      const { error } = await supabase
        .from('dm_produto')
        .update({
          departamento: formData.value.departamento,
          grupo: formData.value.grupo,
          tipo: formData.value.tipo,
        })
        .eq('produto_id', props.product.produto_id);
        
      if (error) throw error;
      
      // Emit update event with updated product
      emit('update', {
        ...props.product,
        departamento: formData.value.departamento,
        grupo: formData.value.grupo,
        tipo: formData.value.tipo,
      });
      
      // Emit success event
      emit('success', 'Produto atualizado com sucesso!');
      
      // Close modal
      isOpen.value = false;
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    emit('error', error as Error);
  } finally {
    isSaving.value = false;
  }
}

// Reset form when product prop changes
watch(() => props.product, (newProduct) => {
  if (newProduct && isOpen.value) {
    formData.value = {
      departamento: newProduct.departamento || '',
      grupo: newProduct.grupo || '',
      tipo: newProduct.tipo || '',
    };
  }
}, { deep: true });
</script> 