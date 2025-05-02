<template>
  <div>
    <!-- Filtros -->
    <div class="mb-4">
      <UCard class="mb-3">
        <div class="space-y-3">

          <UFormField label="Pesquisar" class="mb-4">
            <UInput 
              v-model="searchQuery" 
              placeholder="Nome, código de barras..." 
              icon="i-heroicons-magnifying-glass"
              class="w-1/2"
              @input="debouncedFilter"
            />
          </UFormField>
          
          <!-- Primeira linha de filtros -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <UFormField label="Departamento">
                <UInputMenu
                  v-model="selectedDepartment"
                  :items="departmentOptions"
                  value-key="value"
                  class="w-full"
                  placeholder="Selecione um departamento"
                  :loading="isDepartmentsLoading"
                  @update:model-value="applyServerFilters"
                />
              </UFormField>
            </div>
            <div>
              <UFormField label="Grupo">
                <UInputMenu
                  v-model="selectedGroup"
                  :items="groupOptions"
                  value-key="value"
                  class="w-full"
                  placeholder="Selecione um grupo"
                  :loading="isGroupsLoading"
                  @update:model-value="applyServerFilters"
                />
              </UFormField>
            </div>
            <div>
              <UFormField label="Marca">
                <UInputMenu
                  v-model="selectedBrand"
                  :items="brandOptions"
                  value-key="value"
                  class="w-full"
                  placeholder="Selecione uma marca"
                  :loading="isBrandsLoading"
                  @update:model-value="applyServerFilters"
                />
              </UFormField>
            </div>
            <div>
              <UFormField label="Princípio Ativo">
                <UInputMenu
                  v-model="selectedActiveIngredient"
                  :items="activeIngredientOptions"
                  value-key="value"
                  class="w-full"
                  placeholder="Selecione um princípio ativo"
                  :loading="isActiveIngredientsLoading"
                  @update:model-value="applyServerFilters"
                />
              </UFormField>
            </div>
          </div>
        </div>
      </UCard>

      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500">
          Exibindo {{ displayedProducts.length }} de {{ totalProducts }} produtos
          <span v-if="hasFilters" class="text-primary font-medium ml-1">(filtrados)</span>
        </p>
        
        <UButton 
          v-if="hasFilters"
          color="primary" 
          variant="ghost" 
          @click="resetFilters"
          icon="i-heroicons-x-mark"
          :loading="isLoading"
        >
          Limpar filtros
        </UButton>
      </div>
    </div>
    
    <!-- Lista de produtos -->
    <div v-if="isLoading && !displayedProducts.length" class="py-8">
      <UCard v-for="i in 6" :key="i" class="mb-4 h-40">
        <div class="animate-pulse bg-gray-200 h-full rounded"></div>
      </UCard>
    </div>
    
    <div v-else-if="!displayedProducts.length" class="text-center py-12">
      <div class="h-12 w-12 mx-auto text-gray-400 mb-4">
        <UIcon name="i-heroicons-face-frown" class="h-full w-full" />
      </div>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
      <p class="mt-1 text-sm text-gray-500">Tente ajustar seus filtros ou fazer uma nova pesquisa.</p>
    </div>
    
    <div
      v-else
      ref="productsContainer"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <ProductCard 
        v-for="product in displayedProducts" 
        :key="product.produto_id" 
        :data="product"
        @click="selectProduct(product)"
      />
      
      <!-- Elemento sentinel para infinite scroll -->
      <div ref="sentinel" class="h-10 w-full col-span-full"></div>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="isLoadingMore" class="flex justify-center my-6">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
    
    <!-- Finished indicator -->
    <div v-if="!hasMore && displayedProducts.length > 0" class="text-center my-8 text-gray-500">
      <div class="flex items-center my-4">
        <div class="flex-1 border-t border-gray-300"></div>
        <p class="text-sm px-2">Fim dos resultados</p>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import type { ProductDTO } from '../types';
import { useProducts, type ProductFilters } from '../composables';
import ProductCard from './ProductCard.vue';

// Estado
const searchQuery = ref('');
const selectedDepartment = ref('');
const selectedGroup = ref('');
const selectedBrand = ref('');
const selectedActiveIngredient = ref('');
const isLoadingMore = ref(false);
const productsContainer = ref<HTMLElement | null>(null);
const sentinel = ref<HTMLElement | null>(null);

// Obter produtos do composable
const { 
  products, 
  departments, 
  isLoading, 
  isDepartmentsLoading, 
  loadMore, 
  hasMore, 
  refreshProducts,
  groups,
  brands,
  activeIngredients,
  isGroupsLoading,
  isBrandsLoading,
  isActiveIngredientsLoading
} = useProducts();

// Computado para garantir que products seja sempre um array (importante para SSR)
const displayedProducts = computed(() => {
  return products.value || [];
});

// Contador total de produtos (para exibição)
const totalProducts = computed(() => {
  if (!departments.value) return 0;
  
  if (selectedDepartment.value) {
    const dept = departments.value.find(d => d.departamento === selectedDepartment.value);
    return dept ? dept.count : 0;
  }
  // Soma total de todos os departamentos
  return departments.value.reduce((sum, dept) => sum + dept.count, 0);
});

// Opções para o select de departamentos
const departmentOptions = computed(() => {
  if (!departments.value) return [];
  
  return departments.value.map(dept => ({
    label: `${dept.departamento} (${dept.count})`,
    value: dept.departamento
  }));
});

// Opções para o select de grupos
const groupOptions = computed(() => {
  return groups.value.map(group => ({ 
    label: group, 
    value: group 
  }));
});

// Opções para o select de marcas
const brandOptions = computed(() => {
  return brands.value.map(brand => ({ 
    label: brand, 
    value: brand 
  }));
});

// Opções para o select de princípios ativos
const activeIngredientOptions = computed(() => {
  return activeIngredients.value.map(ingredient => ({ 
    label: ingredient, 
    value: ingredient 
  }));
});

// Verificar se há filtros ativos
const hasFilters = computed(() => {
  return !!searchQuery.value || 
         !!selectedDepartment.value || 
         !!selectedGroup.value ||
         !!selectedBrand.value ||
         !!selectedActiveIngredient.value;
});

// Debounce para o filtro de pesquisa
let searchTimeout: NodeJS.Timeout | null = null;
const debouncedFilter = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyServerFilters();
  }, 500); // Debounce maior para evitar muitas requisições durante digitação
};

// Obter filtros atuais
const getCurrentFilters = (): ProductFilters => {
  return {
    departamento: selectedDepartment.value || undefined,
    grupo: selectedGroup.value || undefined,
    marca: selectedBrand.value || undefined,
    principio_ativo: selectedActiveIngredient.value || undefined,
    search: searchQuery.value?.trim() || undefined
  };
};

// Aplicar filtros fazendo uma nova requisição ao servidor
const applyServerFilters = async () => {
  // Montar objeto de filtros
  const filters = getCurrentFilters();
  
  console.log('Aplicando filtros do servidor:', filters);
  
  // Fazer nova requisição com os filtros
  await refreshProducts(filters);
};

// Carregar mais produtos
const loadMoreItems = async () => {
  if (!hasMore.value || isLoadingMore.value || isLoading.value) return;
  
  isLoadingMore.value = true;
  
  try {
    // Carregar mais produtos (loadMore já aplica os filtros ativos)
    await loadMore();
  } catch (error) {
    console.error('Erro ao carregar mais produtos:', error);
  } finally {
    isLoadingMore.value = false;
  }
};

// Limpar filtros
const resetFilters = async () => {
  searchQuery.value = '';
  selectedDepartment.value = '';
  selectedGroup.value = '';
  selectedBrand.value = '';
  selectedActiveIngredient.value = '';
  
  // Fazer nova requisição sem filtros
  await refreshProducts({});
};

// Selecionar um produto
const selectProduct = (product: ProductDTO) => {
  console.log('Produto selecionado:', product);
};

// Observer para infinite scroll
let observer: IntersectionObserver | null = null;

// Configurar observador de interseção para detecção de scroll
const setupIntersectionObserver = () => {
  // Destruir observer anterior se existir
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  if (!window.IntersectionObserver || !sentinel.value) return;
  
  observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting && !isLoadingMore.value && !isLoading.value && hasMore.value) {
        console.log('Elemento sentinel visível, carregando mais itens...');
        loadMoreItems();
      }
    },
    { threshold: 0.1 }
  );
  
  observer.observe(sentinel.value);
};

// Observar mudanças nos produtos para reconfigurar o observer
watch(displayedProducts, () => {
  nextTick(() => {
    setupIntersectionObserver();
  });
});

// Inicialização
onMounted(async () => {
  // Inicializar observer
  await nextTick();
  setupIntersectionObserver();
  
  // Configurar evento de scroll para fallback
  window.addEventListener('scroll', () => {
    if (
      !window.IntersectionObserver &&
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      !isLoadingMore.value &&
      !isLoading.value &&
      hasMore.value
    ) {
      loadMoreItems();
    }
  });
});

// Limpar observer ao desmontar o componente
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script> 