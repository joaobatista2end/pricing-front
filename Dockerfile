# Etapa 1: Build da aplicação
FROM node:18-alpine AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos necessários para instalar dependências
COPY package*.json ./

# Instala dependências de produção e desenvolvimento
RUN npm install

# Copia o restante do projeto
COPY . .

# Gera a build da aplicação Nuxt
RUN npm run build

# Etapa 2: Imagem final para produção
FROM node:18-alpine AS runner

WORKDIR /app

# Copia apenas arquivos necessários para rodar a aplicação
COPY --from=builder /app/.output .output
COPY --from=builder /app/package*.json ./

# Instala só dependências de produção
RUN npm install --omit=dev

# Expõe a porta usada pela aplicação (padrão: 3000)
EXPOSE 8080

# Comando para iniciar a aplicação Nuxt
CMD ["node", ".output/server/index.mjs"]
