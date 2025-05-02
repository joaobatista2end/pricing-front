# Estágio de build
FROM node:18-alpine AS build

WORKDIR /app

# Instala as dependências globais necessárias
RUN apk add --no-cache git

# Copia arquivos de configuração
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Executa o build da aplicação
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

WORKDIR /app

# Copia apenas os arquivos necessários do estágio de build
COPY --from=build /app/.output ./
COPY --from=build /app/package.json ./

# Expõe a porta 
EXPOSE 8080

# Define variáveis de ambiente para produção
ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=production

# As variáveis do Supabase serão substituídas em tempo de execução
# pelos valores fornecidos no docker-compose ou plataforma de hospedagem
ENV SUPABASE_URL=placeholder
ENV SUPABASE_KEY=placeholder

# Comando para iniciar a aplicação em modo de produção
CMD ["node", "server/index.mjs"] 