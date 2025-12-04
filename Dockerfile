# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci

# Gerar o Prisma Client
RUN npx prisma generate

# Copiar o código fonte
COPY . .

# Buildar a aplicação
RUN npm run build

# Remover dependências de desenvolvimento
RUN npm prune --production

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copiar apenas o necessário do estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# --- AQUI ESTÁ A MUDANÇA ---
# Copie o arquivo de configuração JS que criamos (não o TS)
COPY prisma.config.js ./prisma.config.js 

# Expor a porta da aplicação
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/main"]