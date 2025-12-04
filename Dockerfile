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

# Copiar código fonte
COPY . .

# Buildar
RUN npm run build

# Limpar dependências de desenvolvimento
RUN npm prune --production

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copiar arquivos do build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# --- MUDANÇA 1: Copiar o arquivo .cjs ---
COPY prisma.config.cjs ./prisma.config.cjs

# Expor porta
EXPOSE 3000

# --- MUDANÇA 2: Usar o flag --config apontando para o .cjs ---
CMD ["/bin/sh", "-c", "npx prisma migrate deploy --config prisma.config.cjs && node dist/src/main"]