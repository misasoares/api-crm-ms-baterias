# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar arquivos de dependência
COPY package*.json ./
COPY prisma ./prisma/

# 2. Instalar dependências (incluindo devDependencies para o build)
RUN npm ci

# 3. Gerar o Prisma Client
RUN npx prisma generate

# 4. Copiar todo o código fonte
COPY . .

# 5. Buildar a aplicação
RUN npm run build

# 6. Remover dependências de desenvolvimento para deixar a imagem leve
RUN npm prune --production

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# 7. Copiar apenas o necessário do estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# 8. Copiar o arquivo de configuração do Prisma (que deve estar na raiz do projeto)
COPY prisma.config.js ./prisma.config.js 

# 9. Expor a porta da aplicação
EXPOSE 3000

# 10. COMANDO DE INICIALIZAÇÃO (Corrigido)
# - Roda a migration primeiro
# - Inicia o servidor no caminho correto (dist/src/main)
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && node dist/src/main"]