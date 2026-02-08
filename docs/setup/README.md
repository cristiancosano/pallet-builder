# Configuración e Instalación

Esta carpeta contiene guías para la configuración del entorno de desarrollo, instalación, y despliegue del proyecto.

## 🚀 Inicio Rápido

### Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18.x o superior ([Descargar](https://nodejs.org/))
- **pnpm** 8.x o superior ([Instalar](https://pnpm.io/installation))
- **Git** ([Descargar](https://git-scm.com/downloads))
- Editor de código (recomendado: [VS Code](https://code.visualstudio.com/))

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/usuario/pallet-builder.git
cd pallet-builder

# 2. Instalar dependencias
pnpm install

# 3. Iniciar servidor de desarrollo
pnpm dev

# 4. Abrir en el navegador
# http://localhost:3000
```

## 📋 Comandos Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia servidor de desarrollo
pnpm build        # Build de producción
pnpm preview      # Preview del build de producción

# Calidad de código
pnpm lint         # Ejecuta ESLint
pnpm lint:fix     # Arregla problemas de linting automáticamente
pnpm type-check   # Verifica tipos de TypeScript

# Tests (cuando estén implementados)
pnpm test         # Ejecuta tests
pnpm test:watch   # Tests en modo watch
pnpm test:coverage # Tests con coverage
```

## ⚙️ Configuración del Editor

### VS Code (Recomendado)

#### Extensiones Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens",
    "christian-kohler.path-intellisense",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

#### Settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### WebStorm / IntelliJ IDEA

1. Abrir Preferencias → Languages & Frameworks → TypeScript
2. Habilitar "TypeScript Language Service"
3. Configurar ESLint en Preferencias → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
4. Habilitar "Run eslint --fix on save"

## 🌍 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# API Configuration (si aplica en el futuro)
VITE_API_URL=http://localhost:3001
VITE_API_KEY=your_api_key_here

# Feature Flags
VITE_ENABLE_PHYSICS=false
VITE_ENABLE_EXPORT=true

# Analytics (opcional)
VITE_ANALYTICS_ID=
```

**Notas**:
- Las variables deben comenzar con `VITE_` para estar disponibles en el cliente
- No commitear `.env.local` (está en .gitignore)
- Ver `.env.example` para plantilla de variables

## 🐳 Docker (Opcional)

### Desarrollo con Docker

```bash
# Build de imagen
docker build -t pallet-builder .

# Ejecutar contenedor
docker run -p 3000:3000 pallet-builder

# Docker Compose
docker-compose up
```

### Dockerfile

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Build
RUN pnpm build

# Producción
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Troubleshooting

### Problema: El servidor de desarrollo no inicia

```bash
# Limpiar caché y reinstalar
rm -rf node_modules .vite
pnpm install
pnpm dev
```

### Problema: Errores de TypeScript

```bash
# Verificar tipos
pnpm type-check

# Regenerar archivos de tipos
rm -rf node_modules/.vite
pnpm dev
```

### Problema: Errores de ESLint

```bash
# Arreglar automáticamente
pnpm lint:fix

# Si persiste, verificar configuración
cat eslint.config.js
```

### Problema: Conflictos de dependencias

```bash
# Reinstalación limpia
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problema: Performance lenta en desarrollo

```bash
# Verificar que no estés corriendo múltiples instancias
ps aux | grep vite

# Aumentar memoria de Node si es necesario
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm dev
```

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

O conecta el repositorio directamente desde [vercel.com](https://vercel.com).

### Netlify

```bash
# Build command
pnpm build

# Publish directory
dist
```

### GitHub Pages

```bash
# Instalar gh-pages
pnpm add -D gh-pages

# Añadir a package.json scripts
"deploy": "pnpm build && gh-pages -d dist"

# Deploy
pnpm deploy
```

### Servidor Propio (nginx)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /var/www/pallet-builder/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caché para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## 📊 Optimización de Build

### Análisis de Bundle

```bash
# Instalar visualizador
pnpm add -D rollup-plugin-visualizer

# Generar análisis
pnpm build
# El reporte se genera en dist/stats.html
```

### Variables de Configuración

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Tamaño de chunk warning
    chunkSizeWarningLimit: 1000,
    
    // Sourcemaps para debugging
    sourcemap: false,
    
    // Minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})
```

## 🔐 Seguridad

### Actualizaciones de Dependencias

```bash
# Verificar actualizaciones
pnpm outdated

# Actualizar dependencias
pnpm update

# Auditar vulnerabilidades
pnpm audit
```

### Headers de Seguridad (nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## 📚 Referencias

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [pnpm Documentation](https://pnpm.io/motivation)
- [React Production Build](https://reactjs.org/docs/optimizing-performance.html)

---

¿Problemas con la instalación? [Abre un issue](https://github.com/usuario/pallet-builder/issues)
