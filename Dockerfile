# Etapa 1: Build da aplicação
FROM node:20-alpine AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

# Instalar Git (necessário para algumas dependências)
RUN apk add --no-cache git

# Configura npm para suprimir avisos de descontinuação e melhorar a performance do build
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_LOGLEVEL=error
ENV NODE_OPTIONS=--max-old-space-size=4096

# Copia apenas os arquivos necessários para instalar dependências
COPY package*.json ./

# Instala dependências com flags para evitar preencher logs com avisos
RUN npm install --no-fund --no-audit --prefer-offline

# Copia o restante do projeto
COPY . .

# Gera a build da aplicação Nuxt
RUN npm run build

# Etapa 2: Imagem final para produção
FROM node:20-alpine AS runner

WORKDIR /app

# Configura npm para produção
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_LOGLEVEL=error

# Copia apenas arquivos necessários para rodar a aplicação
COPY --from=builder /app/.output .output
COPY --from=builder /app/package*.json ./

# Instala só dependências de produção com flags para suprimir avisos
RUN npm install --omit=dev --no-fund --no-audit --prefer-offline

# Expõe a porta usada pela aplicação
EXPOSE 8080

# Comando para iniciar a aplicação Nuxt
CMD ["node", ".output/server/index.mjs"]
