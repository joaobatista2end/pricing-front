# Etapa 1: Build da aplicação
FROM node:20-alpine AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm run build


FROM node:20-alpine AS runner

WORKDIR /app


ENV NODE_ENV=production
ENV PORT=8080

# Copia apenas arquivos necessários para rodar a aplicação
COPY --from=builder /app/.output .output
COPY --from=builder /app/package*.json ./

# Instala só dependências de produção com flags para suprimir avisos
RUN npm install -g pnpm
RUN pnpm install

# Expõe a porta usada pela aplicação
EXPOSE 8080

# Comando para iniciar a aplicação Nuxt
CMD ["node", ".output/server/index.mjs"]
