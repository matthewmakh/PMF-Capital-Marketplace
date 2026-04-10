FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npx next build
RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps /app/node_modules/bcryptjs ./node_modules/bcryptjs

COPY <<'EOF' /app/entrypoint.sh
#!/bin/sh
echo "=== Running schema migration ==="
node prisma/reset-passwords.js 2>&1 || echo "WARNING: migration/seed failed"
echo "=== Starting server ==="
exec node server.js
EOF

RUN chmod +x /app/entrypoint.sh
USER nextjs
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
CMD ["/app/entrypoint.sh"]
