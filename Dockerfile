# syntax=docker/dockerfile:1.7-labs
#
# Image runtime : cgr.dev/chainguard/node (zero-CVE, rebuild quotidien).
# Déviation §13.1 — voir docs/security-overrides.md (palier 3).
#
# Pourquoi Chainguard et plus distroless :
#  - Distroless `:nonroot` peut accuser un retard de plusieurs jours
#    avant d'intégrer les patches Debian (libc, openssl, etc.). On a
#    constaté 6 CVE (1 CRITICAL, 5 HIGH) au 2026-05-18 avec fix amont
#    déjà publié mais pas encore reflété dans `:nonroot`.
#  - Chainguard publie un rebuild quotidien, l'image arrive
#    typiquement clean au scan Trivy même quelques heures après une
#    disclosure CVE.
#
# Pour les stages builder, on reste sur node:22-alpine (jeté à la
# fin, n'apparaît pas dans Trivy image scan).

# -----------------------------------------------------------------------------
# Stage 1 : deps
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 2 : builder
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
RUN pnpm build

# -----------------------------------------------------------------------------
# Stage 3 : runner (Chainguard Node, non-root par défaut)
# -----------------------------------------------------------------------------
FROM cgr.dev/chainguard/node:latest AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Chainguard Node tourne en UID 65532 (`nonroot`) par défaut.
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static
COPY --from=builder --chown=nonroot:nonroot /app/public ./public

USER nonroot
EXPOSE 3000

# Chainguard Node a `node` comme entrypoint → CMD passe le script directement.
CMD ["server.js"]
