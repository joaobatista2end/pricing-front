<template>
  <UCard >
    <template #header>
      <div>
        <div class="flex justify-between">
          <h3
            class="text-lg font-semibold line-clamp-2"
            :title="props.data.descricao_completa"
          >
            {{ props.data.descricao }}
          </h3>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-500 mt-1">
            {{ props.data.apresentacao }}
          </p>
          <UBadge
            :style="getGroupColorStyle(props.data.grupo)"
            size="sm"
            class="mb-1"
          >
            {{
              props.data?.departamento ? props.data?.departamento + ' /' : ''
            }}
            {{ props.data?.grupo ?? '---' }}
          </UBadge>
        </div>
      </div>
    </template>

    <div class="h-40 overflow-y-auto">
      <div class="space-y-1">
        <div class="flex items-center text-sm gap-2">
          <UIcon name="i-heroicons-tag" class="text-gray-400 flex-shrink-0" />
          <div class="text-gray-600">
            <span class="font-semibold text-xs">Marca:</span>
            {{ props.data.marca }}
          </div>
        </div>
        <div
          v-if="props.data.principio_ativo"
          class="flex items-center text-sm gap-2"
        >
          <UIcon
            name="i-heroicons-beaker"
            class="text-gray-400 flex-shrink-0"
          />

          <div class="text-gray-600">
            <span class="font-semibold text-xs">Princípio ativo:</span>
            {{ props.data.principio_ativo }}
          </div>
        </div>
        <div
          v-if="props.data.cod_barras"
          class="flex items-center text-sm gap-2"
        >
          <UIcon
            name="i-heroicons-bars-4"
            class="text-gray-400 flex-shrink-0"
          />
          <div class="text-gray-600">
            <span class="font-semibold text-xs">Codigo de barras:</span>
            {{ props.data.cod_barras }}
          </div>
        </div>
        <div
          v-if="props.data.concentracao"
          class="flex items-center text-sm gap-2"
        >
          <UIcon
            name="i-heroicons-variable"
            class="text-gray-400 flex-shrink-0"
          />
          <div class="text-gray-600">
            <span class="font-semibold text-xs">Concentração:</span>
            {{ props.data.concentracao }}
          </div>
        </div>
        <div
          v-if="props.data.fabricante_fantasia"
          class="flex items-center text-sm gap-2"
        >
          <UIcon
            name="i-heroicons-building-office"
            class="text-gray-400 flex-shrink-0"
          />
          <div class="text-gray-600">
            <span class="font-semibold text-xs">Fabricante:</span>
            {{ props.data.fabricante_fantasia }}
          </div>
        </div>
        <div
          v-if="props.data?.uso_continuo === 'S'"
          class="flex items-center text-sm gap-2"
        >
          <UIcon name="i-heroicons-clock" class="text-gray-400 flex-shrink-0" />
          <div class="text-gray-600">
            <span class="font-semibold text-xs">Uso contínuo</span>
          </div>
        </div>
        <div v-if="props.data.tipo" class="flex items-center text-sm gap-2">
          <UIcon name="i-heroicons-cube" class="text-gray-400 flex-shrink-0" />
          <div class="text-gray-600">
            <span class="font-semibold text-xs">Tipo:</span>
            {{ props.data.tipo }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
        <slot name="actions" />
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import type { ProductProps } from '../types';

defineComponent({
  name: 'ProductCard',
});

const props = defineProps<ProductProps>();

/**
 * Calcula se uma cor é clara ou escura baseado no seu valor RGB
 */
function isLightColor(color: string): boolean {
  // Remove o # do início se existir
  const hex = color.charAt(0) === '#' ? color.substring(1) : color;

  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calcula o brilho (fórmula YIQ)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Se o brilho for maior que 128, a cor é considerada clara
  return brightness > 158;
}

/**
 * Gera uma cor única com base no nome do grupo e retorna os estilos apropriados
 */
function getGroupColorStyle(groupName: string): {
  backgroundColor: string;
  color: string;
} {
  if (!groupName) {
    // Cor padrão em caso de grupo vazio
    return { backgroundColor: '#4f46e5', color: '#ffffff' };
  }

  // Função para gerar um hash simples baseado no nome do grupo
  let hash = 0;
  for (let i = 0; i < groupName.length; i++) {
    hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Converte o hash para uma cor hexadecimal
  let color = '#';
  for (let i = 0; i < 3; i++) {
    // Gera um valor entre 0 e 255 para cada componente RGB
    const value = (hash >> (i * 8)) & 0xff;

    // Garante que a cor não seja muito clara (aumentando seu valor mínimo)
    const adjustedValue = Math.max(value, 50);

    // Converte para hexadecimal e adiciona à string de cor
    color += ('00' + adjustedValue.toString(16)).substr(-2);
  }

  // Determina se o texto deve ser preto ou branco
  const textColor = isLightColor(color) ? '#000000' : '#ffffff';

  return {
    backgroundColor: color,
    color: textColor,
  };
}
</script>
