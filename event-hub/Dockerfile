FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Skip ESLint during build
RUN npx next build --no-lint

# Production image
FROM base AS runner
ENV NODE_ENV=production

# Create a non-root user and set proper permissions
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build output and necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/docker-entrypoint.sh ./

# Make entrypoint script executable
RUN chmod +x ./docker-entrypoint.sh

# Set ownership to nextjs user
RUN chown -R nextjs:nodejs .
USER nextjs

# Expose the port
EXPOSE 3000

# Set the entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]

# Set the start command
CMD ["node", "server.js"] 