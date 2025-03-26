FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment during build
ENV NODE_ENV production

# Generate Prisma client
RUN npx prisma generate

# Use production build script
RUN npm run build:prod

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Use the PORT environment variable (Cloud Run sets this to 8080)
ENV PORT 8080

# Uncomment the following line for glibc support in Alpine
# RUN apk --no-cache add ca-certificates

# Create a non-root user and set proper permissions
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy build output and necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/.env.production ./.env.production

# Set the correct permission for prerender cache
RUN mkdir .next
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Make entrypoint script executable
RUN chmod +x ./docker-entrypoint.sh

# Set ownership to nextjs user
RUN chown -R nextjs:nodejs .
USER nextjs

# Expose the port
EXPOSE 8080

# Set the entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]

# Set the start command
CMD ["node", "server.js"] 