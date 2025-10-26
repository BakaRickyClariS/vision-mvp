FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# ✅ 新增，確保目錄存在
RUN mkdir -p /app/uploads

EXPOSE 8080
CMD ["node", "dist/index.js"]
