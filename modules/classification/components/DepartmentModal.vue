<template>
  <UModal v-model="isOpen" :title="isEditing ? 'Editar Departamento' : 'Adicionar Departamento'">
    <div class="space-y-4">
      <UFormGroup label="Nome" required>
        <UInput v-model="form.nome" placeholder="Nome do departamento" />
      </UFormGroup>
      
      <UFormGroup v-if="!isEditing" label="Divisão" required>
        <USelect 
          v-model="form.divisao"
          :options="divisaoOptions"
          option-attribute="label"
          placeholder="Selecione a divisão"
        />
      </UFormGroup>
    </div>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="cancel">
          Cancelar
        </UButton>
        <UButton 
          color="primary" 
          :loading="loading" 
          :disabled="!isFormValid || loading" 
          @click="save"
        >
          {{ isEditing ? 'Atualizar' : 'Salvar' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useSupabaseClient, useToast } from '#imports';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  divisaoId?: string;
  divisaoName?: string;
  departamento?: {
    id: number;
    nome: string;
    divisao: string;
  };
}>();

const emit = defineEmits<{
  'update:isOpen': [value: boolean];
  'saved': [];
}>();

const supabase = useSupabaseClient();
const toast = useToast();

const isOpen = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value)
});

const isEditing = computed(() => !!props.departamento);

const loading = ref(false);
const divisoes = ref<{value: string; label: string}[]>([]);

// Formulário
const form = ref({
  nome: '',
  divisao: ''
});

// Quando o modal abrir, carregue os dados
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await loadDivisoes();
    
    if (isEditing.value) {
      form.value.nome = props.departamento!.nome;
      form.value.divisao = props.departamento!.divisao;
    } else if (props.divisaoId) {
      form.value.divisao = props.divisaoId;
    } else {
      form.value.nome = '';
      form.value.divisao = '';
    }
  }
});

// Carrega as divisões disponíveis
const loadDivisoes = async () => {
  try {
    const { data, error } = await supabase.rpc('get_divisoes');
    
    if (error) throw error;
    
    divisoes.value = data.map((item: { divisao: string }) => ({
      value: item.divisao,
      label: item.divisao
    }));
  } catch (error: any) {
    toast.add({
      title: 'Erro ao carregar divisões',
      description: error.message,
      color: 'error'
    });
  }
};

// Opções para o select de divisão
const divisaoOptions = computed(() => {
  return divisoes.value;
});

// Validação do formulário
const isFormValid = computed(() => {
  return form.value.nome.trim() !== '' && 
    (isEditing.value || form.value.divisao !== '');
});

// Cancelar
const cancel = () => {
  isOpen.value = false;
};

// Salvar departamento
const save = async () => {
  try {
    loading.value = true;
    
    if (isEditing.value) {
      // Atualizar departamento existente
      const { error } = await supabase
        .from('departamentos')
        .update({
          nome: form.value.nome
        })
        .eq('id', props.departamento!.id);
      
      if (error) throw error;
      
      toast.add({
        title: 'Sucesso',
        description: 'Departamento atualizado com sucesso',
        color: 'success'
      });
    } else {
      // Criar novo departamento
      const { error } = await supabase
        .from('departamentos')
        .insert({
          nome: form.value.nome,
          divisao: form.value.divisao
        });
      
      if (error) throw error;
      
      toast.add({
        title: 'Sucesso',
        description: 'Departamento criado com sucesso',
        color: 'success'
      });
    }
    
    emit('saved');
    isOpen.value = false;
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: error.message,
      color: 'error'
    });
  } finally {
    loading.value = false;
  }
};
</script> 