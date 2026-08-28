Desarrollar un mantenedor de usuarios utilizando React como frontend integrado en un proyecto Laravel (mediante Inertia.js)

El sistema debe permitir visualizar usuarios en un listado con filtros, registrar nuevos usuarios, ver la ficha de un usuario organizada en tabs, eliminar usuarios.

El backend en Laravel solo debe proveer lo mínimo necesario: rutas, controladores con la lógica CRUD básica, y modelos. El foco de la evaluación es la calidad del código frontend.

# Arquitectura del sistema 
El sistema se basa en una aplicación monolítica Laravel con frontend React integrado mediante Inertia.js. No existe API REST separada, las vistas React se sirven directamente desde los controladores Laravel.

## Flujo de la aplicación
El siguiente flujo detalla cómo interactúan las capas del sistema:
```
Usuario (Browser)
|
|
React (Frontend - Inertia.js)
|
| <-- Componentes reutilizables, Custom Hooks, Estructura modular
| <-- Manejo de estado local, validaciones, UX
| (Inertia visits / requests)
|
Laravel (Backend)
|
| <-- Controladores, Validación server-side, Lógica CRUD
| <-- Rutas Inertia que retornan vistas con props
|
PostgreSQL (base de datos)
| <-- Modelos: Usuario, Dirección, Nota, Rol
| <-- Migraciones y Seeders
```

# Stack tecnológico requerido
El proyecto final debe incluir los componentes y tecnologías definidos, los apartados no especificados tienen libre elección, mientras se mantenga la arquitectura de aplicación principal.


| Componente             | Tecnología                        | Versión Mínima |
| ---------------------- | --------------------------------- | -------------- |
| Backend                | Laravel                           | 11.x           |
| Frontend               | React                             | 19.x           |
| Integración Front/Back | Inertia.js                        | 2.x            |
| Base de datos          | PostgreSQL                        | 14.x           |
| Estilos                | Bootstrap 5 + React Bootstrap     | 5.3.x          |
| Tabla                  | DataTables (datatables.net-react) | 2.x            |
| Build tool             | Vite                              | 7.x            |

# Funcionalidades
## 1. Vista de listado de usuarios (Index)
Vista principal con tabla paginada de usuarios

| Columna         | Descripción                                |
| --------------- | ------------------------------------------ |
| Nombre completo | Nombre + Apellido                          |
| Email           | Correo electrónico                         |
| RUT/RUN         | Documento de Identidad                     |
| Rol             | Rol asignado (Admin, Editor, Visualizador) |
| Estado          | Activo / Inactivo                          |
| Fecha creación  | Fecha formateada                           |
| Acciones        | Ver detalle, Eliminar                      |
### Requisitos específicos
- Paginación server-side
- Buscador de texto general
- Panel de filtros lateral (slide-out) con
	- Filtro por Rol (select)
	- Filtro por Estado (select)
	- Botón "Aplicar" y "Limpiar"
- Confirmar antes de eliminar
- Botón para ir al formulario de registro

## 2. Vista de registro de usuario (Form)
Formulario para crear un nuevo usuarios con toda su información
Sección: Datos Personales

| Campo            | Tipo     | Validación                                          |
| ---------------- | -------- | --------------------------------------------------- |
| Nombre           | Text     | Requerido, máx 100                                  |
| Apellido         | Text     | Requerido, más 100                                  |
| Email            | email    | Requerido, formato email, único                     |
| RUT/RUN          | Text     | Requerido                                           |
| Teléfono         | Number   | Opcional                                            |
| Rol              | Select   | Requerido (opciones desde backend)                  |
| Estado           | Select   | Requerido (opciones desde backend, Activo/Inactivo) |
| Calle            | Text     | Requerido                                           |
| Ciudad           | Text     | Requerido                                           |
| Código Postal    | Text     | Opcional                                            |
| Nota/Observación | Textarea | Al menos una nota requerida                         |

### Requisitos específicos
- Validaciones en frontend antes de enviar
- Errores inline por campo
- Botón "Guardar" y "Cancelar" (vuelve al listado)
- Al guardar exitosamente, redirigir al listado con mensaje de éxito (toast o similar)
- Manejo visible de errores del backend

## 3. Vista de Ficha/Detalle del usuarios (Show)
Vista de detalle con información organizada en tabs. Solo lectura

Encabezado:
- Resumen del usuarios (nombre, email, rol, estado)
- Botón volver al listado

Tabs:

| Tab                 | Contenido                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Información general | Datos completos del usuario (nombre, apellido, email, RUT/RUN, teléfono, rol, estado, fecha creación) |
| Direcciones         | Datos de dirección del usuario (calle, ciudad, código postal)                                         |
| Notas               | Tabla con las notas/observaciones registradas (texto, fecha de creación)                              |
### Requisitos específicos
- Cada tab es un componente independiente
- Los datos de cada tab se cargan al activar el tab (lazy loading via endpoint)
- Manejar 3 estados: cargando (skeleton/loader), sin datos (mensaje vacío), con datos.


# Requisitos de arquitectura
## Requisitos de Código Frontend
El código debe ser limpio, ordenado y mantenible. Se espera que el candidato aplique buenas prácticas de desarrollo frontend por criterio propio, demostrando capacidad para estructurar un proyecto de forma profesional

Se valorará:
- Organización clara de archivos y carpetas
- Código sin repetición innecesaria
- Separación de responsabilidades
- Componentes pensados para ser reutilizables cuando tenga sentido
- Legibilidad  y consistencia en convenciones de nombres

## Requisitos del Backend (mínimo necesario)
- Modelos: Usuario, Dirección, Nota, Rol
- Migraciones y seeders (datos precargados para probar)
- Controlador(es) con lógica básica
- Rutas que sirvan las vistas vía Inertia
- Endpoints para: listar paginado con filtros, crear, eliminar, obtener datos por tab
- Validación server-side en store.

## Requisitos No Funcionales
- El proyecto debe ejecutarse sin errores
- Código limpio siguiendo buenas prácticas, sin warnings en consola
- Mensajes de feedback al usuario en éxito y error.

# Criterios de evaluación

| Criterio                                      | Peso |
| --------------------------------------------- | ---- |
| Estructura y organización del código          | 25%  |
| Reutilización de componentes                  | 25%  |
| Separación lógica/presentación (custom hooks) | 20%  |
| Funcionalidad completa                        | 15%  |
| Manejo de estados y errores                   | 10%  |
| Experiencia de usuario                        | 5%   |
# Contenidos README
Instrucciones paso a paso para levantar el proyecto (instalación de dependencias, configuración de base de datos, migraciones, seeders, compilación de assets y ejecución del servidor), más cualquier consideración adicional.