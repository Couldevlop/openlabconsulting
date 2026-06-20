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
# Clé SITE Turnstile (publique) — inlinée au build car NEXT_PUBLIC_*.
# Passée par release.yml via la variable Actions du même nom. Absente →
# build sans CAPTCHA (le widget affiche le placeholder dev). Le secret
# serveur (TURNSTILE_SECRET_KEY) n'est JAMAIS un build-arg (OWASP A05).
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
RUN pnpm build

# -----------------------------------------------------------------------------
# Stage 2b : sharp pour glibc
# -----------------------------------------------------------------------------
# Le stage `deps` (Alpine/musl) compile sharp pour musl libc. Or le runner
# Chainguard est basé sur glibc → le binaire natif musl ne charge pas
# ("Could not load the sharp module using the linux-x64 runtime"), ce qui
# casse tout traitement d'image Payload (uploads médias, AVIF/WebP).
# On réinstalle donc sharp sur une base glibc (node:22-slim = Debian) pour
# récupérer les bons binaires `@img/sharp-linux*-x64` et on les copie dans
# le runner. Version épinglée sur celle du package.json (sharp ^0.34.5).
FROM node:22-slim AS sharp-glibc
WORKDIR /sharp
RUN npm install --no-save --omit=dev --cpu=x64 --os=linux --libc=glibc sharp@0.34.5

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

# Écrase le sharp musl (issu du standalone Alpine) par la build glibc.
# `sharp` (JS) + `@img/*` (binaires natifs linux-x64 glibc) — cf. stage sharp-glibc.
COPY --from=sharp-glibc --chown=nonroot:nonroot /sharp/node_modules/sharp ./node_modules/sharp
COPY --from=sharp-glibc --chown=nonroot:nonroot /sharp/node_modules/@img ./node_modules/@img

USER nonroot
EXPOSE 3000

# Chainguard Node a `node` comme entrypoint → CMD passe le script directement.
CMD ["server.js"]

# -----------------------------------------------------------------------------
# Stage 4 : migrator (image INTERNE — applique les migrations Payload)
# -----------------------------------------------------------------------------
# Pourquoi un stage dédié et pas le runner Chainguard :
#  - Le runner standalone n'embarque ni la CLI Payload, ni payload.config,
#    ni migrations/ (Next standalone élague tout ce que l'app n'importe pas
#    au runtime) → `payload migrate` y est impossible.
#  - Gonfler le runner avec le toolchain casserait l'objectif zéro-CVE.
#  → On publie une image migrator séparée (`…/website-migrate:X.Y.Z`),
#    utilisée UNIQUEMENT par le Job Helm `migrate` (post-upgrade). Jamais
#    exposée à Internet.
#
# On passe par `tsx scripts/payload-migrate.ts` (API JS directe) et NON par
# le binaire `payload` : ce dernier casse sous Node 22 + ESM strict (cf. note
# en tête de payload.config.ts). node:22-alpine fournit /bin/sh + node + le
# node_modules complet (tsx, payload, db-postgres). HOME/TMPDIR=/tmp pour
# rester compatible avec readOnlyRootFilesystem (cache esbuild/tsx → /tmp).
FROM node:22-alpine AS migrator
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOME=/tmp
ENV TMPDIR=/tmp
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Le Job surcharge command/args ; CMD = défaut pratique (run local de l'image).
CMD ["node_modules/.bin/tsx", "scripts/payload-migrate.ts"]
