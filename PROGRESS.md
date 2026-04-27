# JobReady CRM - Progreso del Proyecto

Documento vivo que registra todos los pasos realizados y pendientes durante el desarrollo del proyecto.

---

## Lección 1 — Arquitectura del Proyecto ✅ COMPLETADA

**Fecha:** 2026-04-27

### Acciones realizadas
- Creada carpeta del proyecto `JobReady_CRM/` en el escritorio.
- Creado documento [`ARCHITECTURE.md`](./ARCHITECTURE.md) con:
  - Descripción del producto (3 frases).
  - Stack tecnológico (Frontend Angular 17+, Backend Node.js 20 + Express 4, MySQL 8).
  - 5 funcionalidades MVP.
  - Modelo de datos completo (4 tablas + tabla `users`).
  - Relaciones entre tablas y estructura de carpetas.
  - Flujo de datos.
- Creadas carpetas `frontend/` y `backend/`.

### Criterios de éxito
- [x] Documento `ARCHITECTURE.md` creado.
- [x] Diferencia frontend/backend documentada.
- [x] Flujo de datos explicado.
- [x] Tablas y relaciones definidas.

---

## Lección 2 — Backend con Node.js + Express + MySQL ✅ COMPLETADA

**Fecha:** 2026-04-27

### 1. Inicialización del proyecto
- `npm init -y` en `backend/`.
- Instaladas dependencias:
  - `express`, `express-validator`, `bcrypt`, `mysql2`, `cors`, `helmet`, `dotenv`, `jsonwebtoken`.
  - DevDeps: `nodemon`.
- `package.json` actualizado con scripts:
  - `npm run dev` → `nodemon src/app.js`
  - `npm start` → `node src/app.js`

### 2. Estructura de carpetas creada
```
backend/
├── .env
├── package.json
├── package-lock.json
├── node_modules/
└── src/
    ├── app.js
    ├── db/
    │   ├── connection.js
    │   └── schema.sql
    ├── middleware/
    │   ├── auth.middleware.js
    │   └── validate.middleware.js
    ├── models/        (vacía, reservada para futuras lecciones)
    └── routes/
        ├── auth.routes.js
        └── companies.routes.js
```

### 3. Configuración

**`.env`** (no se commitea):
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          (XAMPP MariaDB sin password)
DB_NAME=jobready_crm_db
JWT_SECRET=jobready_secret_key_2024_super_segura
FRONTEND_URL=http://localhost:4200
```

**Nota técnica sobre MySQL:** El sistema usa MariaDB de XAMPP (`C:\xampp\mysql\bin\mysql.exe`), accesible sin password como `root`. Inicialmente se configuró `DB_PASSWORD=root` pero se cambió a vacío tras detectar `Access denied`.

### 4. Base de datos
- MySQL/MariaDB de XAMPP arrancado y funcionando.
- Base de datos `jobready_crm_db` creada.
- 5 tablas creadas según `schema.sql`:
  - `users` (id, name, email, password, createdAt)
  - `companies` (id, userId FK, name, sector, website, notes, rating, createdAt)
  - `applications` (id, userId FK, companyId FK, position, status ENUM, appliedAt, notes, createdAt)
  - `interviews` (id, applicationId FK, interviewDate, type ENUM, notes, result, createdAt)
  - `follow_up_tasks` (id, applicationId FK, title, dueDate, done, createdAt)
- Todas las FK con `ON DELETE CASCADE`.

### 5. Endpoints implementados

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET    | `/api/health`            | Health check                   | No  |
| POST   | `/api/auth/register`     | Crear usuario + JWT            | No  |
| POST   | `/api/auth/login`        | Login → JWT                    | No  |
| GET    | `/api/auth/me`           | Datos del usuario autenticado  | JWT |
| GET    | `/api/companies`         | Listar empresas del usuario    | JWT |
| GET    | `/api/companies/:id`     | Detalle de empresa             | JWT |
| POST   | `/api/companies`         | Crear empresa                  | JWT |
| PUT    | `/api/companies/:id`     | Actualizar empresa             | JWT |
| DELETE | `/api/companies/:id`     | Eliminar empresa               | JWT |

### 6. Pruebas end-to-end realizadas
Todas las verificaciones pasaron correctamente:

- ✅ `GET /api/health` → `{"status":"ok"}`
- ✅ `POST /api/auth/register` → JWT + usuario creado en MySQL.
- ✅ `POST /api/auth/login` → JWT válido (213 chars).
- ✅ `GET /api/auth/me` con Bearer token → datos del usuario.
- ✅ `POST /api/companies` → empresa creada (id=1).
- ✅ `GET /api/companies` → lista con la empresa.
- ✅ `PUT /api/companies/1` → actualización parcial con COALESCE.
- ✅ `GET /api/companies/1` → detalle con valores actualizados.
- ✅ `DELETE /api/companies/1` → eliminada.
- ✅ `GET /api/companies` post-delete → lista vacía.

Usuario de prueba (`vasco.test@example.com`) eliminado tras las pruebas.

### Criterios de éxito
- [x] Servidor Express arranca sin errores.
- [x] Conexión a MySQL funcional.
- [x] Las 5 tablas creadas.
- [x] Estructura de carpetas según patrón.
- [x] Auth con JWT funcionando.
- [x] CRUD completo de companies.

---

## Lección 4 — Autenticación con JWT (refactor) ✅ COMPLETADA

**Fecha:** 2026-04-27

La Lección 2 ya implementó el grueso de auth, pero la Lección 4 establece convenciones distintas. Se refactorizó el código existente para alinearlo con esas convenciones.

### Cambios realizados

**`auth.routes.js`:**
- JWT payload cambiado de `{ userId, name, email }` → `{ id, email }`.
- Bcrypt rounds: 10 → **12** (más seguro, ligeramente más lento).
- Todas las respuestas ahora incluyen `success: true | false`.
- Mensajes de error en español alineados con la lección ("El email ya está registrado", "Credenciales incorrectas").
- Migrado a `pool.execute()` (statements preparados) en todas las queries.
- `express-validator` con mensajes personalizados (`.withMessage(...)`).

**`auth.middleware.js`:**
- Respuestas de error ahora con `success: false`.
- Mensaje de token inválido ampliado a "Token inválido o expirado".

**`companies.routes.js`:**
- Reemplazadas todas las referencias `req.user.userId` → `req.user.id` (10 ocurrencias) para alinearse con el nuevo payload JWT.

### Pruebas end-to-end de los 4 criterios

| # | Criterio | Resultado |
|---|----------|-----------|
| 1 | Registro crea usuarios con contraseña hasheada | ✅ Hash en DB con prefijo `$2b$12$`, longitud 60 |
| 2 | Login devuelve JWT válido | ✅ Token de 3 segmentos válido, expira en 7d |
| 3 | Rutas protegidas rechazan sin token | ✅ 401 sin header / token inválido / token corrupto |
| 4 | Errores claros con códigos HTTP correctos | ✅ 400 validación, 400 email duplicado, 401 credenciales, 200 éxito |

Casos probados:
- ✅ `POST /api/auth/register` (válido) → 201 con token + user.
- ✅ Verificado en MySQL: password hasheada con bcrypt 12 rounds.
- ✅ `POST /api/auth/login` con creds correctas → 200 + token.
- ✅ `POST /api/auth/login` con password incorrecta → 401 "Credenciales incorrectas".
- ✅ `POST /api/auth/login` con email inexistente → 401 (mismo mensaje, no filtra info).
- ✅ `GET /api/auth/me` sin token → 401 "Token no proporcionado".
- ✅ `GET /api/auth/me` con token inválido → 401 "Token inválido o expirado".
- ✅ `GET /api/auth/me` con token válido → 200 + datos del usuario.
- ✅ `GET /api/companies` sin token → 401.
- ✅ Validaciones: nombre <2 chars, email mal formado, password <6, email duplicado → 400 con mensaje específico.

Usuario de prueba (`vasco@jobready.com`) eliminado de la DB tras los tests.

### Criterios de éxito
- [x] El registro crea usuarios con contraseña hasheada.
- [x] El login devuelve un JWT válido.
- [x] Las rutas protegidas rechazan peticiones sin token.
- [x] Los errores devuelven mensajes claros y códigos HTTP correctos.

---

## Lección 5 — Setup del Frontend Angular ✅ COMPLETADA (implícita)

**Fecha:** 2026-04-27

La Lección 5 no se entregó explícitamente, pero se ejecutó como prerequisito de Lección 6.

### Acciones
- `ng new frontend --routing --style=scss --ssr=false --skip-git --skip-tests --defaults` con Angular CLI 20.
- `ng add @angular/material` (tema por defecto, animaciones BrowserAnimations).
- Instalación manual de `@angular/animations@20` (faltaba como peer en el bundle inicial).
- Estructura adicional creada:
  - `src/environments/environment.ts` con `apiUrl: http://localhost:3001/api`.
  - `src/app/core/models/` → `company.model.ts`, `user.model.ts`.
  - `src/app/core/services/` → `auth.service.ts`, `companies.service.ts`.
  - `src/app/core/auth/` → `auth.interceptor.ts` (HttpInterceptorFn), `auth.guard.ts` (CanActivateFn).
- `app.config.ts` actualizado con `provideHttpClient(withInterceptors([authInterceptor]))` y `provideAnimations()`.
- `index.html` ya incluye Roboto + Material Icons (añadidos por `ng add`).

### Servicios clave

**`AuthService`:**
- Persiste token y user en `localStorage` (`jobready_token`, `jobready_user`).
- `currentUser` expuesto como `signal<User | null>`.
- Métodos `login`, `register`, `logout`, `getToken`, `isAuthenticated`.

**`CompaniesService`:**
- `getAll()`, `getById(id)`, `create()`, `update()`, `delete()`.
- Mapea la respuesta del backend `{companies: [...]}` / `{company: {...}}` a `{data: ...}` (la convención que usa Lección 6).

**`authInterceptor`:**
- Inyecta `Authorization: Bearer <token>` si hay token en storage.
- Intercepta 401 → cierra sesión + redirige a `/login`.

**`authGuard`:**
- `CanActivateFn` que redirige a `/login` si no autenticado.

---

## Lección 6 — Componentes Principales (Lista, Formulario) ✅ COMPLETADA

**Fecha:** 2026-04-27

### Componentes creados

**`features/companies/companies-list.component.ts`**
- Standalone, usa `MatTable`, `MatToolbar`, `MatFormField`, `MatIcon`.
- `items` y `filteredItems` como `signal<Company[]>([])`.
- Filtro en tiempo real por `name + sector` (case-insensitive) en el método `filter(event)`.
- Columnas: name, sector, rating, actions.
- Botón "Nueva" → `routerLink="new"`.
- Iconos editar (→ `[routerLink]="[item.id]"`) y eliminar (con `confirm()`).
- Toolbar superior con nombre del usuario y botón "Salir" (logout).
- Estados: cargando, lista vacía con CTA.

**`features/companies/companies-form.component.ts`**
- Standalone, ReactiveForms con `FormBuilder.nonNullable.group`.
- Detecta modo edit vs create por `route.snapshot.params['id']`.
- En modo edit hace `getById` y `patchValue`.
- Validaciones:
  - `name`: required + minLength(2) — con `mat-error` específicos.
  - `website`: pattern `/^(https?:\/\/).+/i`.
  - `rating`: min(0), max(5).
- Submit construye payload limpio (omite campos vacíos) y llama `create` o `update`.
- Botones Cancelar / Guardar/Crear (deshabilitado si form inválido o saving).
- Manejo de error: muestra mensaje del backend.

**`features/auth/login.component.ts`** y **`features/auth/register.component.ts`**
- Componentes mínimos para autenticarse (necesarios para acceder a `/companies`).
- `MatCard` con form reactivo, validaciones email + password length.
- Tras éxito → `router.navigate(['/companies'])`.

### Routing (`app.routes.ts`)
| Path | Componente | Guard |
|------|-----------|-------|
| `''` | redirect a `/companies` | — |
| `login` | LoginComponent (lazy) | — |
| `register` | RegisterComponent (lazy) | — |
| `companies` | CompaniesListComponent (lazy) | authGuard |
| `companies/new` | CompaniesFormComponent (lazy) | authGuard |
| `companies/:id` | CompaniesFormComponent (lazy) | authGuard |
| `**` | redirect a `/companies` | — |

Todas las rutas con `loadComponent` (lazy chunks confirmados en build).

### Verificación

**Build:** ✅ `ng build` compila sin errores. Lazy chunks generados:
```
chunk-...-companies-list-component  17.99 kB
chunk-...-companies-form-component  14.99 kB
chunk-...-register-component        10.66 kB
chunk-...-login-component           10.07 kB
```

**Dev server:** ✅ `ng serve` arranca en `http://localhost:4200`. `index.html` referencia `app-root` y carga `main.js`.

**CORS backend:** ✅ Preflight OPTIONS desde `Origin: http://localhost:4200` devuelve `Access-Control-Allow-Origin` correcto.

**Flujo CRUD vía API (mismo que ejecuta el SPA):**
- ✅ Register → token + user persistidos.
- ✅ GET /api/companies (vacía) → `{companies:[]}` → la lista muestra mensaje "No hay empresas".
- ✅ POST `Stripe` y `Vercel` → 2 empresas creadas.
- ✅ GET /api/companies → lista de 2.
- ✅ GET /api/companies/:id → datos para precargar el formulario en edit.
- ✅ PUT /api/companies/2 → rating actualizado.
- ✅ DELETE /api/companies/2 → eliminada (queda Vercel).

**✅ Verificación visual realizada por el usuario (2026-04-27):** todo OK en el navegador — login, register, lista, formulario y CRUD funcionan según lo esperado.

### Criterios de éxito de Lección 6
- [x] La lista muestra los datos del backend (verificado vía API + binding correcto en componente).
- [x] El filtro de búsqueda funciona en tiempo real (signal `filteredItems` actualizado en `(input)`).
- [x] El formulario valida los campos antes de enviar (`form.invalid` deshabilita el botón).
- [x] Crear, editar y eliminar funcionan correctamente (CRUD probado API end-to-end + visual en navegador).
- [x] Validación visual en navegador realizada por el usuario.

---

## Lección 7 — Dashboard y Filtros Avanzados ✅ COMPLETADA

**Fecha:** 2026-04-27

### Adaptación importante
La lección de referencia asume que `companies` tiene un campo `status`, pero en nuestro esquema el `status` está en `applications` (que aún no se han implementado). Se adaptaron las métricas a los campos reales de `companies`: `sector` y `rating`.

### Backend: `/api/stats`

Nueva ruta `src/routes/stats.routes.js` (montada en `app.js`):

```
GET /api/stats   (auth requerido)
```

Devuelve:
```json
{
  "success": true,
  "data": {
    "total":       <int>,                          // COUNT(*)
    "avgRating":   <number>,                       // ROUND(AVG(NULLIF(rating,0)),2)
    "bySector":    [{ "sector": "...", "count": N }, ...],   // GROUP BY sector
    "byRating":    [{ "rating": 5, "count": N }, ...],       // GROUP BY rating DESC
    "recent":      [ { id, name, sector, rating, createdAt }, ...]   // ORDER BY createdAt DESC LIMIT 5
  }
}
```

Detalles SQL:
- `COALESCE(NULLIF(sector, ''), 'Sin sector')` agrupa empresas sin sector bajo una etiqueta.
- `NULLIF(rating, 0)` excluye sin-rating del promedio para no sesgarlo.

### Frontend

**Nuevos archivos:**
- `core/models/stats.model.ts` → interfaces `DashboardStats`, `SectorBucket`, `RatingBucket`, `RecentCompany`.
- `core/services/stats.service.ts` → `getDashboard(): Observable<DashboardStats>`.
- `features/dashboard/dashboard.component.ts` → componente standalone con:
  - 4 metric-cards: total empresas (highlight), rating medio, sectores distintos, sector top.
  - 2 cards con `mat-progress-bar` para distribución por sector y por rating (porcentaje sobre total).
  - Card "Actividad reciente" con últimas 5 empresas (links a edit).
  - `topSector` como `computed()` derivado del primer bucket de `bySector` (ya viene ordenado DESC).
  - Toolbar con nav entre Dashboard y Companies.
  - Estados loading + empty con CTA a `/companies/new`.

**Filtros avanzados en `companies-list.component.ts`** (refactor):
- `filterForm` reactivo con 3 controles: `search`, `sector`, `minRating`.
- `valueChanges.subscribe(() => applyFilters())` — actualización en cada cambio.
- `sectors` como `computed()` que extrae sectores únicos de los items cargados (rellena el `mat-select` automáticamente).
- `applyFilters()` aplica los 3 criterios:
  - search → busca en `name + sector + notes` (case-insensitive).
  - sector → coincidencia exacta.
  - minRating → `c.rating >= min`.
- Botón "Limpiar" (visible si `hasFilters()`) resetea el form.
- Contador `(N filtradas / M totales)` en la cabecera.
- Mensajes diferenciados para "no hay empresas" vs "ningún resultado con esos filtros".
- Tras eliminar, re-aplica filtros (no rompe la vista filtrada).

**Routing actualizado (`app.routes.ts`):**
- `''` y `**` redirigen ahora a `/dashboard` (antes a `/companies`).
- Nueva ruta `dashboard` con `loadComponent` + `authGuard`.
- Login/Register redirigen a `/dashboard` tras éxito.

**Toolbar consistente:** Dashboard, Companies y form de companies comparten links de navegación con `routerLinkActive` para resaltar la sección activa.

### Verificación

**Backend** — probado vía curl con un usuario seed + 5 empresas (Stripe/PayPal Fintech, Vercel/Netlify DevOps, Notion SaaS):

| Caso | Resultado |
|------|-----------|
| `/api/stats` con DB vacía para el user | `{total:0, avgRating:0, bySector:[], byRating:[], recent:[]}` ✅ |
| `/api/stats` con 5 empresas | `total:5, avgRating:"4.20", bySector:[Fintech:2,DevOps:2,SaaS:1], byRating:[5:2,4:2,3:1], recent: 5 items DESC` ✅ |

**Build frontend:** ✅ `ng build` compila. Nuevo lazy chunk `dashboard-component  49.33 kB`.

### Criterios de éxito de Lección 7
- [x] El dashboard muestra métricas reales de la base de datos (verificado vía API).
- [x] Los filtros reducen la lista correctamente (search + sector + rating, combinables).
- [x] El diseño es limpio y profesional (cards Material, gradient en métrica destacada, progress bars, hover en items recientes).
- [x] La navegación entre secciones es fluida (toolbar con `routerLinkActive`).
- [ ] **Validación visual en navegador → pendiente del usuario.**

---

## Lección 8 — Deploy y Portfolio ✅ COMPLETADA (local)

**Fecha:** 2026-04-27

### Acciones realizadas

**README.md profesional** en la raíz con:
- Descripción del producto y stack.
- Funcionalidades implementadas y roadmap.
- Requisitos previos + setup paso a paso (DB, backend, frontend).
- Tabla con todos los endpoints REST.
- Estructura completa del proyecto.
- Decisiones técnicas (signals, JWT, bcrypt 12, prepared statements, etc.).

**`.gitignore` raíz** que excluye:
- `node_modules/`, `dist/`, `.angular/`, `.cache/`
- `.env` (no se filtra ningún secreto)
- `.claude/`, `.vscode/`, `.idea/`
- Logs, OS files (`.DS_Store`, `Thumbs.db`), coverage, temporales.

**`backend/.env.example`** plantilla sin secretos, con comentarios y ejemplo `openssl rand -base64 64` para `JWT_SECRET`.

**Repositorio git inicializado:**
- `git init -b main`
- 47 archivos staged (~14k líneas).
- Verificado con `git check-ignore` que `node_modules`, `.env`, `dist/`, `.angular/`, `.claude/` están excluidos.
- **Primer commit y push a GitHub: PENDIENTES de tu autorización explícita.**

### Checklist final del proyecto

| Criterio | Estado |
|----------|--------|
| Login y registro funcionan | ✅ |
| CRUD principal completo (companies) | ✅ |
| Dashboard con métricas reales | ✅ |
| Filtros y búsqueda funcionan | ✅ |
| Formularios con validaciones | ✅ |
| JWT protege las rutas (guard + interceptor) | ✅ |
| README profesional escrito | ✅ |
| `.gitignore` configurado | ✅ |
| Variables de entorno en `.env.example` | ✅ |
| Repositorio git local | ✅ |
| Repositorio en GitHub | ⏳ pendiente del usuario (`gh repo create` + push) |

### Próximos pasos para el usuario

**Hacer el primer commit (cuando autorices):**
```bash
cd C:/Users/robev/Desktop/JobReady_CRM
git commit -m "feat: initial commit — JobReady CRM"
```

**Crear repo en GitHub y subir:**
```bash
gh auth login                                         # primera vez
gh repo create jobready-crm --public --source=. --remote=origin --push
# o manual:
# gh repo create jobready-crm --public
# git remote add origin https://github.com/<tu-user>/jobready-crm.git
# git push -u origin main
```

**Para el portfolio / LinkedIn:**
- Captura del dashboard con datos reales.
- Captura del CRUD de companies con filtros activos.
- Demo de 3 minutos: login → dashboard → crear empresa → filtrar → editar.
- Link al repo en CV con stack: `Angular 20, Node.js, Express, MySQL`.

---

## Lección 1 (Sprint pro) — Refactor y Arquitectura Profesional ✅ COMPLETADA

**Fecha:** 2026-04-27

### Objetivo
Llevar el proyecto del nivel "ejercicio académico" a un nivel defendible en entrevista: separar
responsabilidades en el backend, organizar el frontend con `core/features/shared`, mantener
componentes pequeños (<150 líneas) y añadir tests unitarios para los servicios principales.

### Backend — separación en 4 capas

Antes la lógica vivía toda en `routes/`. Ahora cada ruta delega:

```
backend/src/
├── routes/         → solo paths + cadena de middleware
├── validators/     → reglas express-validator (auth.validators, companies.validators)
├── controllers/    → HTTP (req/res), traducción de errores → status code
├── services/       → lógica de negocio + acceso a DB
├── middleware/     → auth.middleware, validate.middleware
└── db/             → connection (pool MySQL) + schema.sql
```

**Archivos nuevos:**
- `services/auth.service.js` (register, login, getProfile)
- `services/companies.service.js` (findAllByUser, findOneByUser, create, update, remove)
- `services/stats.service.js` (getDashboard)
- `controllers/auth.controller.js`, `controllers/companies.controller.js`, `controllers/stats.controller.js`
- `validators/auth.validators.js`, `validators/companies.validators.js`

**Cambios en rutas:** pasaron de tener toda la lógica embebida (50–100 líneas con try/catch repetido)
a 10–15 líneas que solo encadenan `validators → validate → controller`.

**Detalle adicional:** los servicios lanzan errores con `error.status` (400/401/404) y los
controllers los traducen a HTTP, evitando duplicar try/catch en cada handler.

Eliminada la carpeta `models/` vacía que arrastrábamos desde la Lección 2.

### Frontend — estructura `core/features/shared`

Añadida carpeta `app/shared/` con un **AppToolbarComponent** standalone reutilizable:
- Antes la toolbar (≈10 líneas) estaba duplicada en `dashboard`, `companies-list` y `companies-form`.
- Ahora se importa como `<app-toolbar>` y centraliza el `logout()` y la navegación.

**Templates y estilos extraídos** de los 3 componentes grandes a archivos `.html` y `.scss`
(separación View / Logic). El `.ts` queda solo con la lógica.

### Componentes < 150 líneas

| Componente | Antes | Después |
|---|---|---|
| `dashboard.component.ts` | 211 | **43** |
| `companies-list.component.ts` | 215 | **104** |
| `companies-form.component.ts` | 153 | **96** |
| `login.component.ts` | 83 | 83 |
| `register.component.ts` | 88 | 88 |
| `app-toolbar.component.ts` (nuevo) | — | 36 |

✅ Todos los componentes por debajo del límite de 150 líneas.

### Tests unitarios

**Backend (Jest)** — 17 tests / 3 suites:
- `tests/services/auth.service.test.js` — register OK / email duplicado (400) / login OK /
  usuario no existe (401) / password incorrecta (401) / getProfile OK / not found (404).
- `tests/services/companies.service.test.js` — list, findOne (existe / no existe), create con valores
  por defecto, update OK / 404, remove OK / 404.
- `tests/services/stats.service.test.js` — agregación completa + caso `avgRating=0` cuando no hay ratings.

Pool de MySQL mockeado con `jest.mock('../../src/db/connection')` para no tocar BD real.

**Frontend (Karma + Jasmine)** — 9 tests / 3 suites:
- `core/services/auth.service.spec.ts` — login persiste token+user, logout limpia localStorage,
  register hace POST.
- `core/services/companies.service.spec.ts` — getAll/getById mapeo, create/update/delete URLs y métodos.
- `core/services/stats.service.spec.ts` — extracción de `data` de la respuesta.

Usado `provideHttpClientTesting()` + `HttpTestingController` (Angular 20).

### Resultado de los tests

```
backend:  Tests: 17 passed, 17 total
frontend: TOTAL: 9 SUCCESS (Chrome Headless)
```

### Criterios de éxito (lección)
- [x] Backend separado en routes / controllers / services / validators.
- [x] Frontend con estructura `core/`, `features/`, `shared/`.
- [x] Ningún componente supera 150 líneas.
- [x] Tests unitarios básicos para los servicios principales (3 backend + 3 frontend).
- [x] Documentado en commit con mensaje explicando qué cambió y por qué.

---

## Pivote de dominio — De *personal tracker* a *ATS empresarial* 🔄

**Fecha:** 2026-04-27

### Por qué pivotamos
El planteamiento original de JobReady CRM era un *personal job tracker* donde cada usuario
registraba las empresas a las que se postulaba personalmente. La interpretación correcta es la
opuesta: **una aplicación para que una empresa lleve el registro de los postulantes** que
aplican a sus vacantes (Applicant Tracking System / ATS).

Lo que se aprovecha del trabajo previo:
- ✅ Arquitectura backend en 4 capas (Lección 1).
- ✅ Estructura frontend `core/features/shared`.
- ✅ Patrón de auth con JWT, guard, interceptor.
- ✅ Setup de tests Jest + Karma.
- ✅ Componentes < 150 líneas y separación template/styles.

Lo que cambia: el dominio (entidades) y la UI shell (sidebar+topbar SaaS en vez de toolbar Material).

### Decisiones del pivote
1. **Multi-tenant por organización** (`organizationId` discriminator). Cada empresa cliente
   tiene su espacio aislado; los reclutadores de la misma empresa comparten datos.
2. **Onboarding por inviteCode** — el primer registro crea una organización nueva (con un
   código de invitación generado); recruiters posteriores se unen aportando ese código.
3. **Roles básicos** — `admin` (gestiona la org + invita) y `recruiter` (gestiona pipeline).
4. **Pipeline de 7 etapas** — `applied → cv_review → interview → technical_test → offer → hired`
   (+ `rejected` terminal). MVP sin drag&drop (botones para mover etapa).
5. **Skills como JSON array** en `candidates.skills` — simple, suficiente para filtrado básico.
6. **Estilo visual SaaS plano** (sidebar + topbar custom CSS), reemplazando la toolbar Material.

### Plan en 6 fases
1. ⏳ Schema + ARCHITECTURE.md actualizado.
2. ⏳ Auth multi-tenant (organizations + roles).
3. ⏳ API: candidates, positions, applications.
4. ⏳ Frontend app shell (sidebar + topbar).
5. ⏳ Features: candidates, positions, pipeline kanban, dashboard nuevo.
6. ⏳ Docs finales.

---

## Fase 1 (pivote ATS) — Schema + ARCHITECTURE ✅ COMPLETADA

**Fecha:** 2026-04-27

### Entidades nuevas
- **organizations** — empresas cliente. Campos: `name`, `inviteCode` (UNIQUE).
- **users** — pasa a tener `organizationId` + `role ENUM('admin','recruiter')`.
- **candidates** — postulantes. Skills como `JSON`, `seniority` ENUM, `linkedinUrl`.
- **positions** — vacantes. `status ENUM('open','paused','closed')`, `seniority` objetivo.
- **applications** — relación candidato × posición + estado del pipeline. `organizationId`
  denormalizado para scoping fácil.
- **interviews** — vinculadas a una application.

### Estados del pipeline (`applications.status`)
`applied` · `cv_review` · `interview` · `technical_test` · `offer` · `hired` · `rejected`

### Aislamiento multi-tenant
Toda query con datos sensibles filtra por `organizationId = req.user.organizationId`. Índices
compuestos `(organizationId, …)` para que el scoping sea barato.

### Aplicado en local
```bash
/c/xampp/mysql/bin/mysql.exe -u root < backend/src/db/schema.sql
# 6 tablas creadas (organizations, users, candidates, positions, applications, interviews)
```

El schema es destructivo (`SET FOREIGN_KEY_CHECKS = 0` + `DROP IF EXISTS` + `CREATE`) porque no
había datos reales que migrar y queremos partir limpio.

### ARCHITECTURE.md
Reescrito completamente con el dominio nuevo: descripción del producto, modelo de datos,
relaciones, aislamiento por org, tabla de roles/permisos, decisiones técnicas.

---

## Pendiente

### Lecciones futuras / mejoras
- [ ] Rutas backend + UI para `applications`, `interviews`, `follow_up_tasks`.
- [ ] Filtros server-side con paginación (cuando crezcan los datos).
- [ ] Gráficos reales con Chart.js o similar (ahora usamos progress-bars).
- [ ] Validación más estricta en PUT (al menos 1 campo).
- [ ] Manejo centralizado de errores con interceptor + snackbar (MatSnackBar).
- [x] ~~Tests unitarios (Jest backend, Karma frontend).~~ ← Lección 1 (Sprint pro)
- [ ] Tests para controllers/rutas (supertest) y para componentes Angular.
- [ ] Dockerización + pipeline CI/CD.
- [ ] Deploy real (backend en Railway/Render, frontend en Vercel/Netlify, DB gestionada).

---

## Comandos útiles para retomar el trabajo

```bash
# Arrancar MySQL/MariaDB (XAMPP)
# Abrir XAMPP Control Panel → Start MySQL

# Backend
cd backend
npm run dev   # con nodemon
# o
npm start     # node directo

# Frontend
cd frontend
npx ng serve --port 4200 --no-open
# Navegador: http://localhost:4200

# Verificar tablas
/c/xampp/mysql/bin/mysql.exe -u root -e "USE jobready_crm_db; SHOW TABLES;"

# Test rápido del API
curl http://localhost:3001/api/health
```

## URLs útiles

- Backend API: http://localhost:3001/api
- Frontend SPA: http://localhost:4200
- Login: http://localhost:4200/login
- Companies: http://localhost:4200/companies (requiere login)
