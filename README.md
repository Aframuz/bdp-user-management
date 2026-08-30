# Mantenedor de usuarios

Aplicación monolítica Laravel + React para listar, buscar, filtrar, registrar, consultar y eliminar usuarios. Las páginas se sirven con Inertia.js; únicamente la tabla server-side y el contenido lazy de los tabs utilizan respuestas JSON internas.

## Stack

- Laravel 11.56 / PHP 8.3
- React 19.2 + TypeScript estricto
- Inertia.js 2
- PostgreSQL 16
- Bootstrap 5.3 + React Bootstrap + Tabler Icons (`@tabler/icons-react`)
- DataTables core 2.3 + adaptador oficial `datatables.net-react`
- SweetAlert2 11 para los toasts de feedback
- Vite 7.3
- PHPUnit, Vitest, Testing Library y Playwright
- Docker Compose y pnpm 11

> **Compatibilidad de versiones:** Laravel 11 es un requisito de la prueba, pero ya no recibe soporte de seguridad. Composer documenta los avisos conocidos que afectan al framework fijado. Para un proyecto real expuesto públicamente se debe migrar al major soportado antes de desplegar. El paquete oficial `datatables.net-react` usa actualmente versión 1.x; el motor DataTables instalado y evaluado es 2.x, que es la versión tecnológica solicitada.

## Puesta en marcha con Docker

Solo es necesario tener Docker con Compose. PHP, Composer, Node, pnpm y PostgreSQL se ejecutan dentro de contenedores.

```bash
cp .env.example .env
docker compose build
docker compose run --rm app composer install
docker compose run --rm vite pnpm install --frozen-lockfile
docker compose run --rm app php artisan key:generate
docker compose up -d db app vite
docker compose exec app php artisan migrate --seed
```

La aplicación queda disponible en <http://localhost:8000> y Vite en el puerto `5173`. El healthcheck de Laravel está disponible en <http://localhost:8000/up>.

También puede ejecutarse la preparación completa con:

```bash
make setup
make up
```

Para reiniciar los datos de demostración:

```bash
docker compose exec app php artisan migrate:fresh --seed
```

Los seeders crean 36 usuarios para comprobar paginación y filtros. `Ana Demo` contiene dirección y nota; `Bruno Sin Datos` permite verificar los estados vacíos de los tabs.

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

Los tokens de marca están al inicio de `resources/js/app.css`; ese fichero se limita a fuentes,
tokens, el puente de variables/variantes de Bootstrap y SweetAlert2, foco y transiciones de
documento. Los estilos de componentes están aislados en CSS Modules BEM. Color, radios, sombras
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

No se incluyen edición, autenticación, permisos, exportación, modo oscuro ni validación adicional del dígito verificador del RUT porque no forman parte del enunciado.

## Notas de operación

- **No ejecutes los E2E con el servidor de desarrollo de Vite levantado.** `vite dev` escribe
  `public/hot`, y `app-test` monta el mismo directorio: entonces sirve etiquetas HMR que apuntan a
  un `localhost:5173` inalcanzable desde el navegador de Playwright y la página queda en blanco.
  Basta con `docker compose stop vite` antes de `make test-e2e`.
- **`SESSION_DRIVER` de `.env.testing` debe ser `file`.** `php artisan serve` solo propaga una lista
  blanca de variables de entorno a su proceso hijo, así que las definidas en `compose.yaml` para
  `app-test` no llegan y este archivo es la única fuente. Con el driver `array` el token CSRF se
  regenera en cada petición y todo POST responde 419. PHPUnit mantiene `array` vía `phpunit.xml`.
