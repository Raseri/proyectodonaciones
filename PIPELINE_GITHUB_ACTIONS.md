# Pipeline con GitHub Actions

## Pipeline automático del Sprint 1

El archivo `.github/workflows/ci-cd.yml` se ejecuta automáticamente cuando:

- se hace `push` a la rama `main`;
- se crea o actualiza un `pull_request` hacia `main`;
- se ejecuta manualmente desde **GitHub > Actions**.

El pipeline tiene dos etapas principales.

### 1. Tests and coverage

1. Descarga el repositorio.
2. Configura Node.js 20.
3. Instala dependencias con `npm ci`.
4. Ejecuta `npm run test:coverage -- --runInBand`.
5. Jest comprueba el umbral global de 80 % configurado en `jest.config.js`.
6. Inicia el backend y verifica `GET /api/health`.
7. Guarda el reporte `coverage/` como artifact.

### 2. Build frontend

Esta etapa solo se ejecuta si las pruebas anteriores pasan.

1. Instala nuevamente las dependencias en un runner limpio.
2. Ejecuta `npm run build`.
3. Guarda la carpeta `dist/` como artifact llamado `frontend-dist`.

## Resultado esperado

```text
Push / Pull Request
        |
        v
     npm ci
        |
        v
Tests + Coverage >= 80 %
        |
        v
Backend Health Check
        |
        v
   Vite Build
        |
        v
Artifacts: coverage + dist
```

Si alguna prueba falla, la cobertura baja del umbral o el frontend no compila, GitHub Actions marca la ejecución en rojo y no continúa a la siguiente etapa.

## Cómo activarlo en GitHub

1. Copiar el proyecto a un repositorio de GitHub.
2. Confirmar que la rama principal se llama `main`.
3. Subir la carpeta `.github/workflows/` junto con el resto del proyecto.
4. Hacer commit y push.
5. Abrir la pestaña **Actions** del repositorio.
6. Seleccionar **CI - Tests and Build**.

No se necesita crear ningún Secret para el pipeline principal. Los valores JWT definidos allí son temporales y exclusivos del entorno de CI.

## SonarQube y OWASP ZAP

Los workflows `sonar.yml` y `zap-security.yml` quedaron en ejecución manual durante el Sprint 1. Esto evita que un servicio externo todavía no configurado haga fallar el pipeline principal.

SonarQube requerirá posteriormente:

- `SONAR_TOKEN`
- `SONAR_HOST_URL`

configurados en **Settings > Secrets and variables > Actions**.

## Despliegue

Este pipeline deja un build de producción (`dist/`) listo como artifact, pero no despliega todavía a un proveedor. Cuando se defina Firebase Hosting, Render, Vercel u otro destino, puede añadirse una tercera etapa de deployment sin cambiar las etapas de tests y build.
