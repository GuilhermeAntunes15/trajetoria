FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ./node_modules/.bin/prisma generate
# As variáveis abaixo existem só para satisfazer a validação de ambiente durante o build e não
# ficam gravadas na imagem; o runtime recebe os valores reais.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
  AUTH_SECRET="build-time-placeholder-value" \
  APP_URL="http://localhost:3000" \
  npm run build
RUN node scripts/collect-prisma-runtime.mjs /prisma-runtime

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
  && adduser -u 1001 -S nextjs -G nodejs \
  && mkdir -p /app/.uploads \
  && chown -R nextjs:nodejs /app/.uploads

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /prisma-runtime ./node_modules

USER nextjs
EXPOSE 3000

CMD ["sh","-c","node node_modules/prisma/build/index.js migrate deploy && node server.js"]
