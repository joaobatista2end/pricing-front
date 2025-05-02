import type { ProductDTO } from "../types";

// Tipo para os departamentos
export interface Department {
  departamento: string;
  count: number;
}

// Interface para filtros
export interface ProductFilters {
  departamento?: string;
  grupo?: string;
  marca?: string;
  principio_ativo?: string;
  search?: string;
}

// Estado compartilhado entre todas as instâncias do composable
const products = ref<ProductDTO[]>([]);
const departments = ref<Department[]>([]);
const groups = ref<string[]>([]);
const brands = ref<string[]>([]);
const activeIngredients = ref<string[]>([]);
const isLoading = ref(false);
const isDepartmentsLoading = ref(false);
const isGroupsLoading = ref(false);
const isBrandsLoading = ref(false);
const isActiveIngredientsLoading = ref(false);
const error = ref<string | null>(null);
const hasMore = ref(true);
const currentPage = ref(0);
const pageSize = ref(15);
const activeFilters = ref<ProductFilters>({});

export const useProducts = () => {
  const supabase = useSupabaseClient();
  
  // Verificar se estamos no servidor para evitar chamadas desnecessárias no SSR
  const isServer = import.meta.server;

  const fetchProducts = async (page = 0, filters: ProductFilters = {}, replace = true) => {
    if (isLoading.value) return;
    
    // Não fazer fetch no servidor durante SSR para evitar problemas
    if (isServer) return;
    
    isLoading.value = true;
    error.value = null;
    
    // Se estamos na página 0 ou substituindo, resetamos o estado
    if (page === 0 || replace) {
      currentPage.value = 0;
      if (replace) {
        products.value = [];
        hasMore.value = true;
      }
    } else {
      currentPage.value = page;
    }
    
    // Guardar filtros ativos
    activeFilters.value = { ...filters };
    
    try {
      // Calcular o offset baseado na página e tamanho de página
      const from = page * pageSize.value;
      const to = from + pageSize.value - 1;
      
      // Iniciar a consulta
      let query = supabase
        .from('dm_produto')
        .select('*');
      
      // Aplicar filtros na consulta
      if (filters.departamento) {
        query = query.eq('departamento', filters.departamento);
      }
      
      if (filters.grupo) {
        query = query.eq('grupo', filters.grupo);
      }
      
      if (filters.marca) {
        query = query.eq('marca', filters.marca);
      }
      
      if (filters.principio_ativo) {
        query = query.eq('principio_ativo', filters.principio_ativo);
      }
      
      if (filters.search) {
        // Busca de texto com ilike (case insensitive)
        query = query.or(`descricao.ilike.%${filters.search}%,descricao_completa.ilike.%${filters.search}%,cod_barras.ilike.%${filters.search}%,principio_ativo.ilike.%${filters.search}%`);
      }
      
      // Aplicar paginação
      query = query.range(from, to);
      
      // Executar consulta
      const { data, error: err } = await query;
      
      if (err) {
        throw err;
      }
      
      // Se não há dados ou menos dados que o tamanho da página, não há mais para carregar
      if (!data || data.length < pageSize.value) {
        hasMore.value = false;
      }
      
      // Substituir ou adicionar ao array existente
      if (page === 0 || replace) {
        products.value = data || [];
      } else {
        products.value = [...products.value, ...(data || [])];
      }
      
      console.log(`Carregados ${data?.length || 0} produtos. Total: ${products.value.length}`);
      
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      error.value = err instanceof Error ? err.message : 'Erro desconhecido ao buscar produtos';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDepartments = async () => {
    if (isDepartmentsLoading.value) return;
    
    // Não fazer fetch no servidor durante SSR para evitar problemas
    if (isServer) return;
    
    isDepartmentsLoading.value = true;
    
    try {
      // Usar a função RPC get_departments criada no Supabase
      const { data, error: err } = await supabase.rpc('get_departments');

      if (err) {
        throw err;
      }
      
      // Atualizar a lista de departamentos
      departments.value = data || [];
      
    } catch (err) {
      console.error('Erro ao buscar departamentos:', err);
    } finally {
      isDepartmentsLoading.value = false;
    }
  };

  const fetchGroups = async () => {
    if (isGroupsLoading.value) return;
    
    // Não fazer fetch no servidor durante SSR
    if (isServer) return;
    
    isGroupsLoading.value = true;
    
    try {
      // Usar a função RPC get_product_groups criada no Supabase
      const { data, error: err } = await supabase.rpc('get_product_groups');

      if (err) {
        throw err;
      }
      
      // Extrair os valores do campo 'grupo' - com type assertion para evitar erro
      if (data) {
        // @ts-expect-error - Sabemos que a API vai retornar objetos com propriedade 'grupo'
        groups.value = data.map(item => item.grupo);
      } else {
        groups.value = [];
      }
      
    } catch (err) {
      console.error('Erro ao buscar grupos:', err);
    } finally {
      isGroupsLoading.value = false;
    }
  };

  const fetchBrands = async () => {
    if (isBrandsLoading.value) return;
    
    // Não fazer fetch no servidor durante SSR
    if (isServer) return;
    
    isBrandsLoading.value = true;
    
    try {
      // Usar a função RPC get_product_brands criada no Supabase
      const { data, error: err } = await supabase.rpc('get_product_brands');

      if (err) {
        throw err;
      }
      
      // Extrair os valores do campo 'marca' - com type assertion para evitar erro
      if (data) {
        // @ts-expect-error - Sabemos que a API vai retornar objetos com propriedade 'marca'
        brands.value = data.map(item => item.marca);
      } else {
        brands.value = [];
      }
      
    } catch (err) {
      console.error('Erro ao buscar marcas:', err);
    } finally {
      isBrandsLoading.value = false;
    }
  };

  const fetchActiveIngredients = async () => {
    if (isActiveIngredientsLoading.value) return;
    
    // Não fazer fetch no servidor durante SSR
    if (isServer) return;
    
    isActiveIngredientsLoading.value = true;
    
    try {
      // Usar a função RPC get_product_active_ingredients criada no Supabase
      const { data, error: err } = await supabase.rpc('get_product_active_ingredients');

      if (err) {
        throw err;
      }
      
      // Extrair os valores do campo 'principio_ativo' - com type assertion para evitar erro
      if (data) {
        // @ts-expect-error - Sabemos que a API vai retornar objetos com propriedade 'principio_ativo'
        activeIngredients.value = data.map(item => item.principio_ativo);
      } else {
        activeIngredients.value = [];
      }
      
    } catch (err) {
      console.error('Erro ao buscar princípios ativos:', err);
    } finally {
      isActiveIngredientsLoading.value = false;
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || isLoading.value) return;
    // Carrega mais produtos mantendo os mesmos filtros ativos
    await fetchProducts(currentPage.value + 1, activeFilters.value, false);
  };

  const refreshProducts = async (filters: ProductFilters = {}) => {
    // Resetar e buscar do início com novos filtros
    hasMore.value = true;
    await fetchProducts(0, filters, true);
  };

  const getProductById = (id: string) => {
    return products.value.find(p => p.produto_id === id);
  };

  // Busca produtos e departamentos quando o componente é montado
  onMounted(() => {
    if (products.value.length === 0 && !isLoading.value) {
      fetchProducts(0, {}, true);
    }
    
    if (departments.value.length === 0 && !isDepartmentsLoading.value) {
      fetchDepartments();
    }
    
    if (groups.value.length === 0 && !isGroupsLoading.value) {
      fetchGroups();
    }
    
    if (brands.value.length === 0 && !isBrandsLoading.value) {
      fetchBrands();
    }
    
    if (activeIngredients.value.length === 0 && !isActiveIngredientsLoading.value) {
      fetchActiveIngredients();
    }
  });
  
  return {
    products,
    departments,
    groups,
    brands,
    activeIngredients,
    isLoading,
    isDepartmentsLoading,
    isGroupsLoading,
    isBrandsLoading,
    isActiveIngredientsLoading,
    error,
    hasMore,
    currentPage,
    pageSize,
    activeFilters,
    fetchProducts,
    fetchDepartments,
    fetchGroups,
    fetchBrands,
    fetchActiveIngredients,
    loadMore,
    refreshProducts,
    getProductById
  };
};
