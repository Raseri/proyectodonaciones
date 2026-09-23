# Proyecto Donaciones

Aplicación React/Vite para gestionar usuarios, roles y donaciones, con un backend Express, SQLite, JWT y pruebas con Jest/Supertest.

## JWT en desarrollo local

El backend usa `process.env.JWT_SECRET` cuando está configurado. Si no existe, utiliza una clave predeterminada únicamente para desarrollo local, por lo que `npm run backend` funciona sin crear un archivo `.env`. En producción, `JWT_SECRET` es obligatorio y debe configurarse mediante variables de entorno con un valor seguro.

## Seguridad con OWASP ZAP

Este proyecto incluye una integración sencilla con OWASP ZAP para revisar las categorías que te interesan:

- Control de Acceso Roto (OWASP 01)
- Fallos Criptográficos (OWASP 04)
- Fallos de Identificación y Autenticación (OWASP 07)

### Cómo ejecutarlo

1. Arranca el backend localmente:

```bash
npm run backend
```

2. En otra terminal ejecuta:

```bash
npm run security:zap:baseline
```

3. Si quieres un escaneo más completo, usa:

```bash
npm run security:zap:full
```

La salida se guardará en la carpeta `reports/` con un JSON del análisis.

> Nota: en la imagen Docker estable de ZAP, la opción de escaneo completo se usa con `-quick` y no con `-cha`, porque `-cha` no es compatible con esa versión.

> Recomendación: usa `TARGET_URL` si necesitas apuntar a otra URL distinta, por ejemplo `TARGET_URL=http://localhost:3000 npm run security:zap:baseline`.
>
> En Windows, si ZAP no está en PATH, puedes usar Docker como alternativa:
>
> ```powershell
> npm run backend
> npm run security:zap:docker
> ```
>
> O bien configura la ruta explícita:
>
> ```powershell
> $env:ZAP_PATH = "C:\Program Files\OWASP ZAP\zap.bat"
> npm run security:zap:baseline
> ```

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
