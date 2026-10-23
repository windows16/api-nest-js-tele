# API NestJS de gestión y auditoría

API backend desarrollada con [NestJS](https://nestjs.com/) y TypeScript.

La API proporciona funcionalidades para:

- Autenticación de usuarios mediante Supabase.
- Gestión de usuarios.
- Gestión de roles y permisos.
- Gestión de clientes.
- Gestión de productos.
- Gestión de ventas.
- Consulta de registros de auditoría.
- Documentación interactiva mediante Swagger.

## Requisitos previos

- [Node.js](https://nodejs.org/)
- npm
- Una cuenta de Supabase
- Un proyecto de Google Cloud si deseas desplegar la API en Cloud Run

## Instalación

Clona el repositorio:

```bash
git clone https://github.com/windows16/api-nest-js-tele.git
cd api-nest-js-tele
```

Instala las dependencias:

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

FRONTEND_URL=http://localhost:5173,http://localhost:3004
```

### Variables requeridas

| Variable | Descripción |
|---|---|
| `PORT` | Puerto donde escuchará la API. Cloud Run proporciona este valor automáticamente. |
| `SUPABASE_URL` | URL del proyecto de Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada de servicio de Supabase. |
| `FRONTEND_URL` | Lista de orígenes permitidos para CORS, separados por comas. |
| `NODE_ENV` | Entorno de ejecución, por ejemplo `development` o `production`. |

> Nunca subas el archivo `.env` al repositorio. La variable `SUPABASE_SERVICE_ROLE_KEY` es privada y debe configurarse como un secreto o variable protegida en el entorno de despliegue.

## Ejecutar en desarrollo

Inicia la API normalmente:

```bash
npm run start
```

Inicia la API en modo observación:

```bash
npm run start:dev
```

Inicia la API en modo depuración:

```bash
npm run start:debug
```

Por defecto, la API estará disponible en:

```text
http://localhost:3000
```

## Compilar la aplicación

Para generar la versión de producción:

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta:

```text
dist/
```

## Ejecutar en producción

Después de compilar el proyecto, ejecuta:

```bash
npm run start:prod
```

El script de producción ejecuta:

```bash
node dist/main
```

## Pruebas

Ejecutar las pruebas unitarias:

```bash
npm run test
```

Ejecutar las pruebas en modo observación:

```bash
npm run test:watch
```

Ejecutar las pruebas end-to-end:

```bash
npm run test:e2e
```

Generar el informe de cobertura:

```bash
npm run test:cov
```

## Linting y formato

Formatear el código:

```bash
npm run format
```

Ejecutar el análisis estático:

```bash
npm run lint
```

## Documentación Swagger

La documentación Swagger está disponible en:

```text
http://localhost:3000/api/docs
```

El documento OpenAPI en formato JSON está disponible en:

```text
http://localhost:3000/api/docs/openapi.json
```

En producción, reemplaza `localhost:3000` por la URL asignada por Cloud Run.

## Prefijo de la API

Todas las rutas de la API utilizan el prefijo global:

```text
/api
```

Por ejemplo, una ruta de autenticación puede tener una URL similar a:

```text
/api/auth/login
```

Las rutas de usuarios utilizan el prefijo definido por sus controladores. Por ejemplo:

```text
/api/v1/profile
```

## Autenticación

La API utiliza Supabase para autenticar a los usuarios.

Las rutas protegidas aceptan el token mediante la cabecera:

```http
Authorization: Bearer ACCESS_TOKEN
```

También se pueden utilizar las cookies de autenticación generadas por la API:

```text
nest_access_token
nest_refresh_token
```

Para probar las rutas protegidas desde Swagger:

1. Abre la documentación Swagger.
2. Pulsa el botón **Authorize**.
3. Introduce el token Bearer.
4. Pulsa **Authorize**.
5. Ejecuta las rutas protegidas.

## Despliegue en Google Cloud Run mediante la interfaz web

Google Cloud Run permite conectar un repositorio de GitHub mediante Cloud Build o Developer Connect para crear despliegues automáticos cada vez que se actualiza una rama. ([docs.cloud.google.com](https://docs.cloud.google.com/run/docs/continuous-deployment?utm_source=openai))

### Requisitos para Cloud Run

Necesitas:

- Un proyecto activo de Google Cloud.
- Facturación habilitada en el proyecto.
- Acceso al repositorio de GitHub.
- Permisos para utilizar Cloud Run y Cloud Build.
- El repositorio:

```text
windows16/api-nest-js-tele
```

- La rama que deseas desplegar, por ejemplo:

```text
main
```

### Habilitar las APIs necesarias

Desde Google Cloud Console, habilita las siguientes APIs:

- Cloud Run Admin API
- Cloud Build API
- Artifact Registry API

También puedes abrir la sección de APIs y servicios desde el menú principal de Google Cloud:

```text
Google Cloud Console → APIs y servicios → Biblioteca
```

Busca cada API y pulsa **Habilitar**.

### Crear el servicio desde Cloud Run

1. Abre [Google Cloud Console](https://console.cloud.google.com/).

2. Selecciona el proyecto de Google Cloud donde deseas desplegar la API.

3. En el menú principal, entra en:

   ```text
   Cloud Run → Services
   ```

4. Haz clic en:

   ```text
   Create service
   ```

5. Selecciona:

   ```text
   Continuously deploy new revisions from a source repository
   ```

6. En el proveedor de compilación, selecciona:

   ```text
   Cloud Build
   ```

7. Haz clic en:

   ```text
   Set up with Cloud Build
   ```

8. En el proveedor del repositorio, selecciona:

   ```text
   GitHub
   ```

9. Si es la primera vez que conectas GitHub con Google Cloud, pulsa:

   ```text
   Authenticate
   ```

   Autoriza la aplicación de Google Cloud Build y concede acceso al repositorio correspondiente.

10. Selecciona:

    ```text
    Repository: windows16/api-nest-js-tele
    ```

11. Selecciona la rama que deseas desplegar:

    ```text
    Branch: main
    ```

    Si tu rama principal se llama `master`, selecciona `master`.

12. Configura el directorio del repositorio como:

    ```text
    /
    ```

    La raíz del repositorio debe contener archivos como:

    ```text
    package.json
    tsconfig.json
    nest-cli.json
    src/
    ```

13. En la configuración de compilación, selecciona:

    ```text
    Google Cloud Buildpacks
    ```

    Cloud Run puede utilizar buildpacks para construir automáticamente una imagen de contenedor desde el código fuente. ([docs.cloud.google.com](https://docs.cloud.google.com/run/docs/quickstarts/deploy-continuously?utm_source=openai))

14. Define el nombre del servicio:

    ```text
    api-nest-js-tele
    ```

15. Selecciona una región cercana a tus usuarios, por ejemplo:

    ```text
    us-central1
    ```

16. En la sección de autenticación, selecciona:

    ```text
    Allow unauthenticated invocations
    ```

    Esta opción permite que el frontend y otros clientes consuman la API públicamente.

17. En la configuración del contenedor, utiliza el puerto:

    ```text
    8080
    ```

    La aplicación no debe fijar exclusivamente este puerto, ya que Cloud Run proporciona el valor mediante la variable `PORT`.

18. Haz clic en:

    ```text
    Create
    ```

19. Espera a que Cloud Build compile el proyecto y Cloud Run cree la primera revisión.

20. Cuando finalice el despliegue, Cloud Run mostrará la URL pública de la API.

### Configurar las variables de entorno en Cloud Run

Después de crear el servicio:

1. Abre:

   ```text
   Cloud Run → Services
   ```

2. Selecciona:

   ```text
   api-nest-js-tele
   ```

3. Pulsa:

   ```text
   Edit and deploy new revision
   ```

4. Abre:

   ```text
   Container(s), Volumes, Networking, Security
   ```

5. Entra en la pestaña:

   ```text
   Variables & Secrets
   ```

6. Agrega las siguientes variables:

   ```text
   NODE_ENV=production
   ```

   ```text
   SUPABASE_URL=https://tu-proyecto.supabase.co
   ```

   ```text
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   ```

   ```text
   FRONTEND_URL=https://tu-frontend.com
   ```

7. No es necesario establecer manualmente `PORT`. Cloud Run proporciona esta variable automáticamente.

8. Pulsa:

   ```text
   Deploy
   ```

> La variable `SUPABASE_SERVICE_ROLE_KEY` debe almacenarse preferiblemente en Secret Manager y asociarse al servicio de Cloud Run como un secreto, en lugar de escribirla directamente como texto plano.

### Configurar el puerto

La aplicación ya está preparada para Cloud Run porque utiliza el puerto proporcionado por la variable `PORT` y escucha en `0.0.0.0`:

```typescript
const port = Number(process.env.PORT ?? 3000);
await app.listen(port, '0.0.0.0');
```

Cloud Run requiere que el contenedor escuche en el puerto indicado por `PORT`. ([docs.cloud.google.com](https://docs.cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service?hl=en&utm_source=openai))

### Consultar la URL de la API

Cuando termine el despliegue:

1. Entra en:

   ```text
   Cloud Run → Services
   ```

2. Selecciona el servicio:

   ```text
   api-nest-js-tele
   ```

3. Copia la URL que aparece en la parte superior.

Por ejemplo:

```text
https://api-nest-js-tele-xxxxxxxxxx-uc.a.run.app
```

### Comprobar Swagger en Cloud Run

La documentación Swagger estará disponible en:

```text
https://TU_URL_DE_CLOUD_RUN/api/docs
```

El documento OpenAPI estará disponible en:

```text
https://TU_URL_DE_CLOUD_RUN/api/docs/openapi.json
```

Ejemplo:

```text
https://api-nest-js-tele-xxxxxxxxxx-uc.a.run.app/api/docs
```

### Configurar el frontend

Después de obtener la URL pública de Cloud Run, configura el frontend usando esa URL como dirección de la API.

Por ejemplo:

```env
API_URL=https://TU_URL_DE_CLOUD_RUN/api
```

También debes actualizar la variable `FRONTEND_URL` en Cloud Run para que contenga la URL real del frontend:

```text
FRONTEND_URL=https://tu-frontend.com
```

Si tienes varios frontends, sepáralos por comas:

```text
FRONTEND_URL=https://tu-frontend.com,https://www.tu-frontend.com
```

### Despliegues automáticos

Cuando se configura la opción de despliegue continuo desde GitHub, Cloud Run puede crear una nueva revisión cada vez que se envía un commit a la rama configurada. ([docs.cloud.google.com](https://docs.cloud.google.com/run/docs/continuous-deployment?utm_source=openai))

El flujo será:

```text
Commit en GitHub
        ↓
Cloud Build
        ↓
Instalación de dependencias
        ↓
Compilación de NestJS
        ↓
Nueva revisión de Cloud Run
        ↓
API actualizada
```

### Revisar los logs

Para revisar los logs de la API:

1. Entra en:

   ```text
   Cloud Run → Services
   ```

2. Selecciona:

   ```text
   api-nest-js-tele
   ```

3. Abre la pestaña:

   ```text
   Logs
   ```

También puedes revisar los logs del proceso de compilación desde:

```text
Cloud Build → History
```

## Solución de problemas

### El contenedor no inicia

Revisa que:

- `package.json` tenga el script `start:prod`.
- La aplicación escuche en `0.0.0.0`.
- La aplicación utilice `process.env.PORT`.
- Las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configuradas.
- El directorio seleccionado en Cloud Build sea `/`.

### Error relacionado con Supabase

Verifica que las siguientes variables existan en Cloud Run:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

La aplicación no puede iniciar correctamente sin estas variables.

### Error de CORS

Verifica que `FRONTEND_URL` contenga exactamente la URL del frontend, sin una barra final innecesaria:

```text
https://tu-frontend.com
```

Si utilizas varios orígenes:

```text
https://tu-frontend.com,https://www.tu-frontend.com
```

### Swagger devuelve error 404

Comprueba que estés utilizando la ruta completa:

```text
/api/docs
```

No utilices únicamente:

```text
/docs
```

### La API solicita autenticación

Las rutas protegidas necesitan un token de Supabase en la cabecera:

```http
Authorization: Bearer ACCESS_TOKEN
```

Las rutas públicas, como el inicio de sesión, no requieren un token.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run start` | Inicia la API en modo normal |
| `npm run start:dev` | Inicia la API en modo desarrollo |
| `npm run start:debug` | Inicia la API en modo depuración |
| `npm run build` | Compila la API |
| `npm run start:prod` | Ejecuta la versión compilada |
| `npm run lint` | Ejecuta el análisis estático |
| `npm run format` | Formatea el código |
| `npm run test` | Ejecuta las pruebas unitarias |
| `npm run test:e2e` | Ejecuta las pruebas end-to-end |
| `npm run test:cov` | Genera la cobertura de pruebas |

## Recursos

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de Swagger en NestJS](https://docs.nestjs.com/openapi/introduction)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Google Cloud Run](https://cloud.google.com/run/docs)
- [Despliegue continuo desde un repositorio](https://cloud.google.com/run/docs/continuous-deployment)
- [Despliegue de código fuente en Cloud Run](https://cloud.google.com/run/docs/deploying-source-code)

## Licencia

Este proyecto es privado y no tiene una licencia pública definida.
