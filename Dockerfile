# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar
RUN npm ci

# Gerar cliente
RUN npx prisma generate

# Copiar código
COPY . .

# Buildar
RUN npm run build

# Limpar dev
RUN npm prune --production

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copiar arquivos do build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# --- MUDANÇA 1: Copiar o arquivo .mjs ---
COPY prisma.config.mjs ./prisma.config.mjs

# Expor porta
EXPOSE 3000

# --- MUDANÇA 2: Usar o .mjs na configuração ---
CMD ["/bin/sh", "-c", "npx prisma migrate deploy --config prisma.config.mjs && node dist/src/main"]