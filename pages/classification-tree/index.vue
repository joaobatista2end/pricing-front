<script setup lang="ts">
import { useSupabaseClient } from '#imports'
import { onMounted, ref } from 'vue'

interface TreeNode {
  id: string
  name: string
  type: 'divisao' | 'departamento' | 'categoria' | 'subcategoria'
  parentId?: string
  papel?: string
  children: TreeNode[]
}

// Define interface for UTree item format
interface TreeItem {
  label: string
  value: string
  icon?: string
  defaultExpanded?: boolean
  data?: {
    id: string
    name: string
    type: string
    papel?: string
    [key: string]: unknown
  }
  children: TreeItem[]
}

// Define the type for a slot item in UTree
interface TreeSlotItem {
  label: string
  value: string
  icon?: string
  data?: {
    id: string
    name: string
    type: string
    papel?: string
    [key: string]: unknown
  }
  children?: TreeSlotItem[]
}

const supabase = useSupabaseClient()
const treeData = ref<TreeItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Cores fixas por tipo de nó para máxima diferenciação
const nodeTypeStyles = {
  divisao: {
    color: '#1e40af',      // Azul escuro
    textColor: 'white',
    icon: 'i-heroicons-building-library',
    fontWeight: 'font-bold',
    fontSize: 'text-lg',
    marginLeft: 'ml-0',
    badgeClass: 'bg-blue-800 text-white'
  },
  departamento: {
    color: '#7e22ce',      // Roxo
    textColor: 'white',
    icon: 'i-heroicons-building-office-2',
    fontWeight: 'font-semibold',
    fontSize: 'text-base',
    marginLeft: 'ml-2',
    badgeClass: 'bg-purple-700 text-white'
  },
  categoria: {
    color: '#be123c',      // Vermelho
    textColor: 'white',
    icon: 'i-heroicons-tag',
    fontWeight: 'font-medium',
    fontSize: 'text-sm',
    marginLeft: 'ml-4',
    badgeClass: 'bg-red-600 text-white'
  },
  subcategoria: {
    color: '#0284c7',      // Azul ciano
    textColor: 'white',
    icon: 'i-heroicons-bookmark',
    fontWeight: 'font-normal',
    fontSize: 'text-sm',
    marginLeft: 'ml-6',
    badgeClass: 'bg-sky-600 text-white'
  }
};

// Get icon based on node type
const getNodeIcon = (type: string): string => {
  return nodeTypeStyles[type as keyof typeof nodeTypeStyles]?.icon || 'i-heroicons-document';
}

// Get node style based on type
const getNodeStyle = (type: string): typeof nodeTypeStyles.divisao => {
  return nodeTypeStyles[type as keyof typeof nodeTypeStyles] || nodeTypeStyles.divisao;
}

// Get papel color
const getPapelColor = (papel: string): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral' => {
  switch (papel) {
    case 'CONVENIENCIA': return 'info'
    case 'ROTINA': return 'primary'
    case 'DESTINO': return 'success'
    case 'SAZONAL': return 'warning'
    default: return 'neutral'
  }
}

const fetchClassificationTree = async () => {
  try {
    loading.value = true
    
    // Call the PostgreSQL function to get the tree structure
    const { data, error: err } = await supabase.rpc('get_classification_tree')
    
    if (err) {
      throw err
    }
    
    // Process the data to ensure all nodes have children as arrays
    // and transform to match UTree component format
    const processedData = processTreeData(data || [])
    treeData.value = processedData
    loading.value = false
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load classification tree'
    error.value = errorMessage
    loading.value = false
    console.error('Error loading classification tree:', err)
  }
}

// Process tree data to ensure all children are arrays and format for UTree
const processTreeData = (data: TreeNode[]): TreeItem[] => {
  return data.map(node => {
    // Ensure node has a children property that is an array
    const children = Array.isArray(node.children) ? node.children : []
    
    // Return the item in format expected by UTree
    return {
      label: node.name,
      value: node.id,
      icon: getNodeIcon(node.type),
      defaultExpanded: node.type === 'divisao', // Auto-expand divisions
      // Store original data for custom rendering
      data: {
        ...node,
        papel: node.papel
      },
      // Process children recursively
      children: children.length > 0 ? processTreeData(children) : []
    }
  })
}

onMounted(() => {
  fetchClassificationTree()
})
</script>

<template>
  <UContainer>
    <UCard class="mt-8">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">Árvore de Classificação</h2>
          <UButton
            v-if="!loading"
            icon="i-heroicons-arrow-path"
            variant="ghost"
            color="primary"
            :loading="loading"
            @click="fetchClassificationTree"
          >
            Atualizar
          </UButton>
        </div>
      </template>
      
      <div v-if="loading" class="flex flex-col space-y-4 p-8">
        <!-- Skeleton loaders for tree structure -->
        <div v-for="i in 3" :key="i" class="flex items-center gap-4">
          <USkeleton class="h-6 w-6 rounded" />
          <USkeleton class="h-6 w-[250px]" />
        </div>
        <div v-for="i in 3" :key="i + 3" class="flex items-center gap-4 ml-8">
          <USkeleton class="h-5 w-5 rounded" />
          <USkeleton class="h-5 w-[200px]" />
        </div>
        <div v-for="i in 3" :key="i + 6" class="flex items-center gap-4 ml-16">
          <USkeleton class="h-4 w-4 rounded" />
          <USkeleton class="h-4 w-[150px]" />
        </div>
      </div>
      
      <div v-else-if="error" class="p-4 text-center">
        <UAlert
          title="Erro ao carregar dados"
          color="error"
          icon="i-heroicons-exclamation-triangle"
          :description="error"
        />
      </div>
      
      <div v-else-if="treeData.length === 0" class="p-4 text-center">
        <UAlert
          title="Sem dados"
          color="warning"
          icon="i-heroicons-information-circle"
          description="Não há dados de classificação disponíveis."
        />
      </div>
      
      <div v-else class="classification-tree p-2">
        <div class="overflow-x-auto">
          <UTree 
            :items="treeData"
          >
            <template #item="{ item, expanded }">
              <div 
                class="flex items-center py-1.5 hover:bg-gray-50 rounded transition-colors"
                :class="getNodeStyle((item as TreeSlotItem).data?.type as string).marginLeft"
              >
                <!-- Seta de expansão -->
                <UIcon
                  v-if="(item as TreeSlotItem).children && (item as TreeSlotItem).children.length > 0"
                  :name="expanded ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                  class="text-gray-400 mr-1"
                  size="sm"
                />
                <span v-else class="w-5"/>
                
                <!-- Ícone do tipo de nó -->
                <div 
                  class="node-icon mr-2 rounded-full p-1.5 flex items-center justify-center"
                  :class="getNodeStyle((item as TreeSlotItem).data?.type as string).badgeClass"
                >
                  <UIcon 
                    :name="getNodeIcon((item as TreeSlotItem).data?.type as string)" 
                    class="text-white"
                    size="sm"
                  />
                </div>
                
                <!-- Nome do nó com estilo baseado no tipo -->
                <span 
                  :class="[
                    getNodeStyle((item as TreeSlotItem).data?.type as string).fontWeight,
                    getNodeStyle((item as TreeSlotItem).data?.type as string).fontSize
                  ]"
                >
                  {{ (item as TreeSlotItem).label }}
                </span>
                
                <!-- Badge de papel se existir -->
                <UBadge 
                  v-if="(item as TreeSlotItem).data?.papel"
                  variant="subtle" 
                  :color="getPapelColor((item as TreeSlotItem).data?.papel as string)"
                  class="ml-2"
                >
                  {{ (item as TreeSlotItem).data?.papel }}
                </UBadge>
              </div>
            </template>
          </UTree>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<style scoped>
.classification-tree {
  max-height: 70vh;
  overflow-y: auto;
}

.node-icon {
  width: 24px;
  height: 24px;
  min-width: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style> 