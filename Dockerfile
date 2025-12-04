# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copiar dependências
COPY package*.json ./
COPY prisma ./prisma/

# 2. Instalar TUDO (Crucial para ler o prisma.config.ts depois)
RUN npm ci

# 3. Gerar o cliente Prisma
RUN npx prisma generate

# 4. Copiar código fonte
COPY . .

# 5. Buildar o projeto
RUN npm run build

# --- ATENÇÃO: NÃO RODAMOS 'npm prune' ---
# Precisamos das devDependencies (typescript, ts-node, @types) para
# o Prisma conseguir ler o seu arquivo prisma.config.ts na inicialização.

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# 6. Copiar tudo do builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# 7. Copiar o seu arquivo de configuração
COPY prisma.config.ts ./prisma.config.ts

# 8. Expor porta
EXPOSE 3000

# 9. COMANDO DE INICIALIZAÇÃO CORRIGIDO:
# - Aponta para o prisma.config.ts
# - Aponta para o caminho correto do NestJS (dist/src/main)
CMD ["/bin/sh", "-c", "npx prisma migrate deploy --config prisma.config.ts && node dist/src/main"]