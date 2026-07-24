# ── Étape 1 : Build React avec Node.js ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les manifests de dépendances d'abord (meilleur cache Docker)
COPY package*.json ./
RUN npm install --include=dev

# Copier le reste du code source
COPY . .

# Compiler l'application
RUN npm run build

# ── Étape 2 : Servir avec Nginx Alpine ──────────────────────────────────────────
FROM nginx:1.25-alpine

# Copier les fichiers compilés depuis l'étape builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la config nginx customisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port HTTP
EXPOSE 80

# Nginx en foreground
CMD ["nginx", "-g", "daemon off;"]
