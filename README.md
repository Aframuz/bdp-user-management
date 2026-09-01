# Mantenedor de usuarios

Aplicación monolítica Laravel + React para listar, buscar, filtrar, registrar, consultar y eliminar usuarios. Las páginas se sirven con Inertia.js; únicamente la tabla server-side y el contenido lazy de los tabs utilizan respuestas JSON internas.

Una live demo está disponible en <https://usuarios.aframuz.dev/usuarios> 

## Stack

- Laravel 11.56 / PHP 8.3
- React 19.2 + TypeScript estricto
- Inertia.js 3
- PostgreSQL 16
- Bootstrap 5.3 + React Bootstrap + Tabler Icons (`@tabler/icons-react`)
- DataTables core 2.3 + adaptador oficial `datatables.net-react`
- SweetAlert2 11 para los toasts de feedback
- Vite 7.3
- PHPUnit, Vitest, Testing Library y Playwright
- Docker Compose y pnpm 11


## Puesta en marcha con Docker

Solo es necesario tener Docker con Compose y Git. PHP, Composer, Node, pnpm y PostgreSQL se ejecutan dentro de contenedores: no hace falta instalar nada de eso en el equipo.

### Requisitos

- **Windows**: Docker Desktop 4.25+ con el backend WSL 2 activado.
- **macOS**: Docker Desktop 4.25+ (Apple Silicon o Intel).
- **Linux**: Docker Engine 24.0+ y Docker Compose 2.20+ (plugin `docker compose`, no el `docker-compose` v1).
- Git. `make` es opcional: cada paso está también disponible como comando suelto.
- Puertos libres en el host: `8000` (Laravel), `5173` (Vite) y `5432` (PostgreSQL).
- ~4 GB de RAM asignados a Docker y ~3 GB de disco para las imágenes.

### 1. Preparar el entorno

#### Windows

1. Instalar Docker Desktop y, en *Settings → General*, dejar marcado **Use the WSL 2 based engine**.
2. En *Settings → Resources → WSL Integration*, habilitar la distribución que se vaya a usar (por ejemplo Ubuntu).
3. Abrir la terminal de esa distribución (`wsl` desde PowerShell, o la app de Ubuntu) y trabajar siempre desde ahí: es donde existen `make`, `cp` y el resto de los comandos de este README.
4. Clonar el repositorio **dentro del sistema de archivos de WSL** (`~/...`), no en una ruta de Windows montada en `/mnt/c`:

   ```bash
   git clone https://github.com/Aframuz/bdp-user-management.git
   cd bdp-user-management
   ```

   Todos los servicios montan el proyecto completo como bind mount. Sobre `/mnt/c` esos accesos cruzan la capa de traducción de WSL, y tanto `composer install` como el hot reload de Vite se vuelven notoriamente lentos.

Los saltos de línea no requieren configuración adicional: `.gitattributes` fuerza `eol=lf` en todo el repositorio, así que los archivos se clonan con el formato que esperan los contenedores incluso con `core.autocrlf=true`.

> Si se prefiere PowerShell en lugar de WSL, la única diferencia en los comandos es `cp .env.example .env` → `Copy-Item .env.example .env`. `make` no viene con Windows, así que en ese caso hay que instalarlo aparte (Chocolatey, Scoop o winget) o usar la secuencia manual del paso 2.

#### macOS

1. Instalar Docker Desktop y verificar en *Settings → General* que **VirtioFS** sea la *file sharing implementation* (es el valor por defecto desde 4.25 y el más rápido para bind mounts).
2. Clonar el repositorio:

   ```bash
   git clone https://github.com/Aframuz/bdp-user-management.git
   cd bdp-user-management
   ```

#### Linux

1. Instalar Docker Engine y el plugin de Compose, y agregar el usuario al grupo `docker` (`sudo usermod -aG docker $USER` y volver a iniciar sesión) para no anteponer `sudo` a cada comando.
2. Clonar el repositorio:

   ```bash
   git clone https://github.com/Aframuz/bdp-user-management.git
   cd bdp-user-management
   ```

### 2. Levantar el proyecto

Los mismos comandos sirven en WSL, macOS y Linux:

```bash
cp .env.example .env
docker compose build
docker compose run --rm app composer install
docker compose run --rm vite pnpm install --frozen-lockfile
docker compose run --rm app php artisan key:generate
docker compose up -d db app vite
docker compose exec app php artisan migrate --seed
```

**El equivalente completo con `make`:**

```bash
make setup   # .env, build, dependencias, APP_KEY y migraciones con seeders
make up      # levanta db, app y vite en segundo plano
```

La primera ejecución descarga las imágenes base y compila las extensiones de PHP, así que toma varios minutos; las siguientes reutilizan la caché de capas.

### 3. Verificar

La aplicación queda disponible en <http://localhost:8000> y Vite en el puerto `5173`. El healthcheck de Laravel está disponible en <http://localhost:8000/up>.

```bash
docker compose ps          # db, app y vite en estado running/healthy
docker compose logs -f app vite
```

Los seeders crean 36 usuarios para comprobar paginación y filtros. `Ana Demo` contiene dirección y nota; `Bruno Sin Datos` permite verificar los estados vacíos de los tabs.

Para reiniciar los datos de demostración:

```bash
docker compose exec app php artisan migrate:fresh --seed   # o: make reset-db
```

### Problemas frecuentes

| Síntoma | Causa y solución |
| --- | --- |
| `bind: address already in use` en `5432` | Hay un PostgreSQL instalado en el host ocupando el puerto. Detener ese servicio, o quitar el mapeo `5432:5432` del servicio `db` en `compose.yaml` (los contenedores se comunican por la red interna de Compose). |
| Windows: build y hot reload muy lentos | El repositorio está en `/mnt/c`. Volver a clonarlo dentro del sistema de archivos de WSL (`~/`). |
| Linux: archivos generados en `storage/` o `bootstrap/cache` quedan como `root` | Los contenedores corren como `root` y en Linux el UID se propaga tal cual al bind mount. Recuperar la propiedad con `sudo chown -R $USER:$USER .`. En Docker Desktop (Windows/macOS) no ocurre, porque remapea la propiedad. |
| Linux: `permission denied` sobre `/var/run/docker.sock` | El usuario no está en el grupo `docker`. Ver el paso 1 de Linux. |
| `docker compose: 'compose' is not a docker command` | Compose v1. Instalar el plugin v2 (`docker-compose-plugin`) o actualizar Docker Desktop. |
| `No application encryption key has been specified` | Falta el paso `php artisan key:generate`, o se creó el `.env` sin copiarlo desde `.env.example`. |

## Desarrollo y build

```bash
# Logs
docker compose logs -f app vite

# Compilación optimizada
docker compose run --rm vite pnpm build

# Detener servicios sin borrar PostgreSQL
docker compose down

# Borrar también el volumen de datos (acción destructiva)
docker compose down --volumes
```

Vite separa Index, Create y Show en chunks. DataTables y sus estilos solo se cargan con Index; las relaciones de dirección y notas solo se solicitan al activar su tab.

## Tests y controles de calidad

La base de datos de pruebas `usuarios_test` está aislada de desarrollo.

```bash
# PHPUnit contra PostgreSQL
docker compose --profile test run --rm app-test php artisan test

# Unitarios frontend
docker compose run --rm vite pnpm test

# TypeScript, ESLint y Pint
docker compose run --rm vite pnpm typecheck
docker compose run --rm vite pnpm lint
docker compose run --rm app vendor/bin/pint --test

# Build y recorridos E2E en Chromium/viewport móvil
# (el servicio e2e compila los assets antes de ejecutar Playwright)
docker compose --profile test run --rm e2e
```

Los E2E cubren búsqueda, filtros, alta, errores frontend/backend, tabs lazy, estados vacíos, cancelación/confirmación de borrado, consola sin warnings/errores, accesibilidad automática y viewport móvil. La imagen Playwright tiene la misma versión que el paquete del lockfile.

## Integración y despliegue continuos

GitHub Actions cubre dos flujos, descritos paso a paso en
[`docs/ci-cd.md`](docs/ci-cd.md):

- **`ci.yml`** — en cada push a `develop` y en cada PR a `develop`/`main`: Pint, PHPUnit
  contra PostgreSQL real, `tsc`, ESLint, Vitest, build de Vite y Playwright
  sobre el stack completo de `compose.yaml`.
- **`deploy.yml`** — en cada push a `main`: reutiliza `ci.yml` con
  `workflow_call`, publica dos imágenes en GHCR (`app` con php-fpm y `web` con
  Caddy, ambas desde `docker/php/Dockerfile.prod`) y las despliega por SSH en
  una instancia de Oracle Cloud con `compose.prod.yaml`. Ahí el stack escucha en
  `127.0.0.1:8080` y el Apache del host termina el TLS y hace de proxy inverso,
  porque la instancia ya sirve otros sitios en los puertos 80 y 443.

El despliegue aplica las migraciones, espera a los healthchecks y comprueba
`https://<dominio>/up` desde el runner; si algo falla,
`deploy/remote-deploy.sh` restaura la versión anterior. Un rollback manual se
lanza desde *Actions → Deploy → Run workflow* indicando el SHA a desplegar.

Para correr la misma suite en local antes de abrir el PR:

```bash
make ci

# Solo las imágenes de producción, sin publicarlas
make build-prod
```

## Estructura relevante

```text
app/
├── Http/Controllers/       # páginas, DataTables y tabs
├── Http/Requests/          # validación server-side
├── Http/Resources/         # forma de los payloads JSON e Inertia
├── Support/                # DataTableQuery (protocolo server-side)
└── Models/                 # Usuario, Direccion, Nota y Rol
resources/js/
├── Components/Common/      # AsyncSection, campos, diálogo, buscador, migas
├── Components/Usuarios/    # tabla, panel de filtros, columnas y tabs
├── Hooks/                  # listado, formulario, reglas y lazy loading
├── Layouts/
├── Pages/Usuarios/         # composición: Index, Create y Show
├── Services/
├── Types/
├── Utils/                  # rutas, validación, fechas y toasts
└── app.css                 # tokens, puente Bootstrap y estilos de documento
tests/
├── Feature/                # CRUD, DataTables y tabs
├── frontend/               # Vitest/Testing Library
└── e2e/                    # Playwright
```

### Decisiones de estructura

- **Presentación separada de la lógica.** `Pages/Usuarios/Index.tsx` solo compone;
  el estado del listado (búsqueda con debounce, filtros aplicados frente a borradores,
  recarga y borrado) vive en `Hooks/useUsuariosTable.ts`, y el de la ficha en
  `Hooks/useLazyUserTabs.ts`.
- **Una sola fuente de verdad por concepto.** `Components/Usuarios/usuariosColumns.tsx`
  define las columnas y de ahí se derivan la cabecera, la configuración de DataTables y
  sus `slots`; `Utils/routes.ts` centraliza las URLs; `Hooks/usuarioFormRules.ts` describe
  la validación como datos y es el espejo declarado de `StoreUsuarioRequest`.
- **Piezas reutilizables.** `FieldWrapper` da a `FormField`, `SelectField` y `TextareaField`
  el mismo cableado accesible; `ConfirmDialog`, `SearchInput`, `Breadcrumbs`, `StatusBadge` y
  `AsyncSection` no saben nada del dominio de usuarios.
- **Los cuatro estados en un único lugar.** `AsyncSection` resuelve cargando / error / vacío /
  con datos, de modo que cada tab solo describe su marcado.
- **Bootstrap primero, CSS local después.** El layout, espaciado y comportamiento responsive
  usan utilidades de Bootstrap. Los estilos visuales que Bootstrap no puede expresar viven
  junto a su componente en `*.module.css`, con nombres BEM y alcance local generado por Vite.

## Contratos internos

- `GET /usuarios/data` implementa el protocolo DataTables (`draw`, `start`, `length`, búsqueda, orden, `recordsTotal`, `recordsFiltered`, `data`) y acepta `rol`/`estado`.
- `GET /usuarios/{id}/tabs/{general|direcciones|notas}` devuelve `{ "data": ... }` y solo se invoca al activar el tab.
- `POST /usuarios` crea usuario, dirección y primera nota dentro de una transacción.
- Roles y estados de formulario/filtros provienen siempre del backend.

## Personalización y accesibilidad

Los tokens de marca están al inicio de `resources/js/app.css`; ese archivo se limita a fuentes,
tokens, el puente de variables/variantes de Bootstrap y SweetAlert2, foco, transiciones de página
y movimiento accesible.
Los estilos de componentes están aislados en CSS Modules BEM. Color, radios, sombras
y duración de movimiento pueden cambiarse sin modificar componentes. La interfaz incluye skip link, landmarks,
foco visible, labels y errores asociados, regiones vivas, modal/Offcanvas accesibles, tabs
navegables por teclado, tablas con caption y soporte para `prefers-reduced-motion`.

## Matriz de cumplimiento

| Requisito | Implementación |
| --- | --- |
| Tabla con siete columnas y acciones | DataTables React en Index |
| Paginación y búsqueda server-side | Endpoint `/usuarios/data` |
| Panel lateral, rol/estado, Aplicar/Limpiar | Offcanvas controlado |
| Confirmación de borrado | Modal con estados cancelar/procesando/error |
| Formulario y validaciones frontend/backend | Hook TypeScript + Form Request |
| Errores inline, error general y feedback de éxito | Campos accesibles + Alert + toast de SweetAlert2 |
| Ficha con tres componentes tab | `GeneralTab`, `DireccionesTab`, `NotasTab` sobre `AsyncSection` |
| Lazy loading y estados loading/empty/data/error | `useLazyUserTabs` con caché y reintento |
| Modelos, migraciones, factories y seeders | PostgreSQL con relaciones/cascadas |
| Código frontend modular y reutilizable | Pages solo componen; lógica en Hooks; primitivas sin dominio en Components/Common |
| Sin warnings y ejecución reproducible | lint, typecheck, build y lockfiles |
| README de instalación completo | Docker-first y comandos de validación |


## Notas de operación

- **No ejecutes los E2E con el servidor de desarrollo de Vite levantado.** `vite dev` escribe
  `public/hot`, y `app-test` monta el mismo directorio: entonces sirve etiquetas HMR que apuntan a
  un `localhost:5173` inalcanzable desde el navegador de Playwright y la página queda en blanco.
  Basta con `docker compose stop vite` antes de `make test-e2e`.
- **`SESSION_DRIVER` de `.env.testing` debe ser `file`.** `php artisan serve` solo propaga una lista
  blanca de variables de entorno a su proceso hijo, así que las definidas en `compose.yaml` para
  `app-test` no llegan y este archivo es la única fuente. Con el driver `array` el token CSRF se
  regenera en cada petición y todo POST responde 419. PHPUnit mantiene `array` vía `phpunit.xml`.

## Consideraciones adicionales
- Se utilizó `pnpm` en lugar de `npm` o `yarn` por su rapidez y determinismo. La lockfile se mantiene actualizada con `pnpm install --frozen-lockfile`.
- Se utilizó `prettier` para formatear el código y mantener un estilo consistente en todo el proyecto.
- No usé deferred props porque el payload inicial en index es pequeño, y la lista de usuarios se carga desde un endpoint separado `usuarios/data` que utiliza DataTables para cargar sus datos y manejar paginación, búsqueda, ordenamiento y filtrado en el servidor en vez de en el cliente. Si bien la demo contiene pocos datos, lo pensé en un entorno donde la cantidad de usuarios es considerable.
- No usé ProvidesInertiaProperties para mantener legibilidad del código,  no existen props reutilizables a través de otros controladores que lo justifiquen.
- Seguí las convenciones de Inertia para construir el formulario.
- El color principal de la marca fue extraida de la página bolsadeproductos.cl, sin embargo no pasa tests de accesibilidad de contraste. Se deja deliberadamente el color y se omiten tests de accesibilidad de contraste en el flujo de CI/CD. Se recomienda cambiar el color a uno que cumpla con los estándares de accesibilidad.