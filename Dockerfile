FROM node:18-alpine

WORKDIR /app

# Instala as dependências globais necessárias
RUN apk add --no-cache git

# Copia arquivos de configuração
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe as portas 
EXPOSE 3000
EXPOSE 24678

# Comando para iniciar o servidor de desenvolvimento
CMD ["npm", "run", "dev"] 