# Proyecto Donaciones

Aplicación React/Vite para gestionar usuarios, roles y donaciones, con un backend Express, SQLite, JWT y pruebas con Jest/Supertest.

## JWT en desarrollo local

El backend usa `process.env.JWT_SECRET` cuando está configurado. Si no existe, utiliza una clave predeterminada únicamente para desarrollo local, por lo que `npm run backend` funciona sin crear un archivo `.env`. En producción, `JWT_SECRET` es obligatorio y debe configurarse mediante variables de entorno con un valor seguro.

## CI/CD

El workflow `.github/workflows/ci-cd.yml` se ejecuta en cada `push` a `main` y en cada `pull_request` hacia `main`.

El job de CI:

1. Descarga el repositorio.
2. Configura Node.js 20 LTS.
3. Instala dependencias con `npm ci`.
4. Ejecuta `npm run test:coverage -- --runInBand`.
5. Verifica los umbrales de cobertura configurados en Jest, actualmente 80% para statements, branches, functions y lines.
6. Guarda `coverage/` como artifact.
7. Ejecuta `npm run build` para comprobar el frontend.

Comandos equivalentes en local:

```powershell
npm ci
npm run test:coverage -- --runInBand
npm run build
```

El workflow incluye una etapa `deployment-pending` deshabilitada explícitamente. No existe todavía un proveedor de hosting configurado, por lo que no se realiza ningún despliegue ficticio. Para habilitar un deployment real será necesario definir el proveedor, la URL o proyecto de destino, el entorno de prueba y los secretos requeridos en GitHub Actions.

Para revisar una ejecución, abre la pestaña **Actions** del repositorio en GitHub, selecciona el workflow **CI/CD** y consulta el job `Tests, coverage and build`. El artifact `coverage` estará disponible cuando termine el job.
