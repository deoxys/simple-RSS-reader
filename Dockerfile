FROM node:23-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:23 AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:23 AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/server ./server

COPY --from=builder /app/prisma ./prisma

RUN ls -la node_modules

COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

EXPOSE 3000

CMD ["./startup.sh"]

FROM node:23-alpine AS dev
WORKDIR /app

ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN chmod +x ./startup.sh

RUN npx prisma generate


EXPOSE 3000

CMD ["./startup.sh"]