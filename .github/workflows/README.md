# GitHub Actions - Release & Publish

Este workflow automatiza la publicación de la librería en NPM y la creación de releases en GitHub.

## ⚙️ Configuración

### 1. Primera publicación (manual)

**Para la primera vez**, debes publicar el package manualmente desde tu máquina:

```bash
# 1. Asegúrate de estar logueado en npm
npm login

# 2. Verifica que el build esté limpio
pnpm build

# 3. Publica la primera versión
pnpm publish --access public
```

Esto creará el package `@cristiancosano/pallet-builder` en npm.

### 2. Configurar Token de NPM en GitHub

Para publicaciones automáticas desde GitHub Actions, necesitas un token de npm:

1. Ve a [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. **Generate New Token** → **Granular Access Token**
3. Configura:
   - **Token name**: `GitHub Actions - pallet-builder`
   - **Expiration**: 90+ días (o no expiration)
   - **Packages and scopes**: 
     - Select packages → `@cristiancosano/pallet-builder`
     - Permissions: **Read and write**
4. Copia el token generado
5. Ve a tu repo en GitHub → **Settings** → **Secrets and variables** → **Actions**
6. **New repository secret**:
   - Name: `NPM_TOKEN`
   - Value: pega el token
7. **Add secret**

✅ **¡Listo!** El workflow usará este token para autenticar y publicará con provenance firmado (OIDC).

**¿Qué es Provenance?**

El flag `--provenance` hace que npm genere attestations firmadas (usando OIDC) que prueban:
- ✅ El package fue construido en GitHub Actions
- ✅ Desde qué repositorio, commit y workflow
- ✅ Inmutabilidad y trazabilidad de la build
- ✅ Compatible con verificación de supply chain

Esto añade una capa extra de seguridad sin necesidad de gestión manual de firmas.

### 3. Permisos del GITHUB_TOKEN

El workflow ya está configurado con los permisos necesarios:
- `contents: write` para crear releases
- `id-token: write` para autenticación OIDC con npm

## 🚀 Uso

### Primera publicación (v0.1.0)

1. **Publica manualmente la versión inicial**:
   ```bash
   npm login
   pnpm build
   pnpm publish --access public
   ```

2. **Configura el token en GitHub** (ver sección anterior)

3. **Crea el tag en git**:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

### Siguientes releases (automáticas)

Las siguientes releases son completamente automáticas:

### Siguientes releases (automáticas)

Una vez configurado Trusted Publishing, las siguientes releases son completamente automáticas:

1. **Actualiza la versión en package.json**:
   ```bash
   # Para versión patch (bug fixes)
   pnpm version patch
   
   # Para versión minor (nuevas features)
   pnpm version minor
   
   # Para versión major (breaking changes)
   pnpm version major
   ```
   Esto actualiza `package.json` y crea automáticamente un commit y tag

2. **Push del tag al repositorio**:
   ```bash
   git push origin main --tags
   ```

3. **El workflow se ejecutará automáticamente** y:
   - ✅ Ejecutará todos los tests unitarios
   - ✅ Verificará la compilación TypeScript
   - ✅ Creará una release en GitHub (en paralelo)
   - ✅ Publicará el package en npmjs (en paralelo)

## 📋 Flujo del Workflow

```mermaid
graph TD
    A[Push tag v*] --> B[Job: test]
    B --> C{Tests OK?}
    C -->|✅ Sí| D[Job: github-release]
    C -->|✅ Sí| E[Job: npm-publish]
    C -->|❌ No| F[Workflow falla]
    D --> G[Release creada en GitHub]
    E --> H[Package publicado en NPM]
```

## 🔍 Verificación

Después de que el workflow termine exitosamente:

1. **Verifica la release en GitHub**:
   ```
   https://github.com/cristiancosano/pallet-builder/releases
   ```

2. **Verifica la publicación en NPM**:
   ```bash
   npm view @cristiancosano/pallet-builder
   ```

3. **Verifica el provenance (attestation)**:
   ```bash
   npm view @cristiancosano/pallet-builder --json | jq .dist
   ```
   Verás información de provenance y sigstore attestations

4. **Prueba la instalación**:
   ```bash
   npm install @cristiancosano/pallet-builder@latest
   ```

## ⚠️ Notas Importantes

- Los tags deben seguir el formato `v*` (ejemplo: `v0.1.0`, `v1.2.3`)
- Si los tests fallan, no se crea la release ni se publica en NPM
- El proyecto usa **pnpm 10.x** — asegúrate de que `pnpm-lock.yaml` esté commiteado
- El comando `pnpm version` actualiza automáticamente el `package.json` y crea un commit y tag
- La publicación usa `--access public` porque es un scoped package
- La publicación usa `--provenance` para generar attestations firmadas verificables
- La release de GitHub se genera automáticamente con las notas del changelog
- El token de npm debe tener permisos de **Read and write** para el package específico
