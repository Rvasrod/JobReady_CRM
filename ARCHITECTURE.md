# JobReady CRM — Architecture Document

## Descripción del Producto

**JobReady CRM** es un **ATS (Applicant Tracking System) multi-tenant** para que una empresa
gestione su proceso de selección: candidatos, ofertas abiertas, aplicaciones, entrevistas y
seguimiento del pipeline. Cada organización tiene su propio espacio aislado y varios reclutadores
pueden colaborar dentro de la misma organización.

> **Pivote:** versiones anteriores del proyecto modelaban un *personal job tracker* (cada usuario
> registraba las empresas a las que se postulaba). El proyecto pivotó a un ATS empresarial el
> **2026-04-27**. Ver `PROGRESS.md` para el detalle del cambio.

## Stack Tecnológico

### Frontend
- Angular 20 (Standalone Components)
- Angular Material (forms, table, dialog, snackbar)
- Angular Signals + RxJS
- Angular Router con `loadComponent`
- Layout SaaS con sidebar+topbar custom (CSS, sin Tailwind)

### Backend
- Node.js 20 + Express 4
- express-validator
- JWT + bcrypt (12 rounds)
- mysql2 (`pool.execute()` con prepared statements)
- helmet + cors

### Base de Datos
- MySQL 8 / MariaDB

### Tests
- Backend: Jest (servicios, pool MySQL mockeado)
- Frontend: Karma + Jasmine (servicios HTTP, `HttpTestingController`)

## Funcionalidades MVP

1. **Autenticación multi-tenant** — registro crea organización nueva o se une a una existente vía
   `inviteCode`. JWT lleva `{ id, email, organizationId, role }`.
2. **Roles básicos** — `admin` (gestiona la organización + invita reclutadores) y `recruiter`
   (gestiona candidatos, ofertas y pipeline pero no la organización).
3. **Gestión de candidatos** — CRUD de personas postulantes con skills, seniority y notas.
4. **Gestión de ofertas/posiciones** — CRUD de vacantes que ofrece la organización.
5. **Aplicaciones (pipeline)** — relación candidato × posición con 7 estados:
   `applied → cv_review → interview → technical_test → offer → hired` (+ `rejected` terminal).
6. **Vista pipeline kanban** — visualización de candidatos por etapa con acciones para mover entre
   columnas (botón "siguiente etapa" en MVP; drag&drop en una iteración posterior).
7. **Dashboard de reclutamiento** — KPIs (candidatos activos, procesos abiertos, ofertas enviadas,
   contratados/mes) + resumen del pipeline + actividad reciente.

## Modelo de Datos

### Tabla: organizations
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador |
| name | VARCHAR(150) | Nombre de la empresa |
| inviteCode | VARCHAR(20) UNIQUE | Código que comparte el admin para que recruiters se unan |
| createdAt | TIMESTAMP | Fecha de creación |

### Tabla: users
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador |
| organizationId | INT (FK) | Organización a la que pertenece |
| name | VARCHAR(100) | Nombre del reclutador |
| email | VARCHAR(150) UNIQUE | Email |
| password | VARCHAR(255) | Hash bcrypt |
| role | ENUM | `admin` / `recruiter` |
| createdAt | TIMESTAMP | Fecha de creación |

### Tabla: candidates
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador |
| organizationId | INT (FK) | Organización propietaria |
| name | VARCHAR(150) | Nombre del candidato |
| email | VARCHAR(150) | Email de contacto |
| phone | VARCHAR(30) | Teléfono (opcional) |
| seniority | ENUM | `junior` / `mid` / `senior` |
| skills | JSON | Array de tags (`["Angular","Node.js"]`) |
| linkedinUrl | VARCHAR(255) | Perfil LinkedIn (opcional) |
| notes | TEXT | Notas internas del reclutador |
| createdBy | INT (FK) | Usuario que añadió al candidato |
| createdAt | TIMESTAMP | Fecha de alta |

### Tabla: positions
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador |
| organizationId | INT (FK) | Organización que oferta el puesto |
| title | VARCHAR(150) | Título (`"Senior Angular Developer"`) |
| description | TEXT | Descripción del puesto |
| seniority | ENUM | Seniority objetivo |
| status | ENUM | `open` / `paused` / `closed` |
| createdBy | INT (FK) | Usuario creador |
| createdAt | TIMESTAMP | Fecha de creación |

### Tabla: applications
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador |
| organizationId | INT (FK) | Organización (denormalizado para scoping) |
| candidateId | INT (FK) | Candidato que aplica |
| positionId | INT (FK) | Posición a la que aplica |
| status | ENUM | `applied`, `cv_review`, `interview`, `technical_test`, `offer`, `hired`, `rejected` |
| appliedAt | DATE | Fecha de aplicación |
| notes | TEXT | Notas específicas de esta aplicación |
| createdAt | TIMESTAMP | Fecha de creación |
| updatedAt | TIMESTAMP | Última actualización (para "última actividad") |

### Tabla: interviews
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador |
| applicationId | INT (FK) | Aplicación a la que pertenece |
| interviewDate | DATETIME | Fecha y hora |
| type | ENUM | `phone` / `video` / `presential` |
| notes | TEXT | Notas previas a la entrevista |
| result | TEXT | Resultado / feedback posterior |
| createdAt | TIMESTAMP | Fecha de creación |

## Relaciones

```
organizations (1) ──── (N) users
organizations (1) ──── (N) candidates
organizations (1) ──── (N) positions
organizations (1) ──── (N) applications
candidates    (1) ──── (N) applications
positions     (1) ──── (N) applications
applications  (1) ──── (N) interviews
users         (1) ──── (N) candidates  (createdBy)
users         (1) ──── (N) positions   (createdBy)
```

## Aislamiento multi-tenant

Toda query que devuelve datos sensibles **debe** filtrar por `organizationId = req.user.organizationId`.
Los services siempre reciben `organizationId` como parámetro y los controllers lo inyectan desde
`req.user`. La middleware `auth.middleware.js` decodifica el JWT y rellena `req.user` con
`{ id, email, organizationId, role }`.

## Roles y permisos

| Acción | admin | recruiter |
|---|---|---|
| Ver/editar candidatos, posiciones, applications de su org | ✅ | ✅ |
| Crear candidatos, posiciones, applications | ✅ | ✅ |
| Mover etapas en el pipeline | ✅ | ✅ |
| Ver código de invitación de su org | ✅ | ❌ |
| Eliminar la organización / cambiar nombre | ✅ | ❌ |
| Ver/editar otros usuarios de la org | ✅ | ❌ |

Las restricciones se aplican con un middleware `requireRole('admin')` además del scoping por org.

## Estructura de Carpetas

```
JobReady_CRM/
├── ARCHITECTURE.md          → este documento
├── PROGRESS.md              → bitácora del proyecto
├── README.md
│
├── backend/
│   ├── tests/services/      → tests Jest
│   └── src/
│       ├── app.js
│       ├── db/              → connection.js + schema.sql
│       ├── middleware/      → auth, validate, requireRole
│       ├── validators/      → reglas express-validator por recurso
│       ├── controllers/     → HTTP, mapping a status code
│       ├── services/        → lógica + acceso a DB (scoped por orgId)
│       └── routes/          → paths + cadena de middleware
│
└── frontend/
    └── src/app/
        ├── core/
        │   ├── auth/         → guard, interceptor
        │   ├── models/       → Organization, User, Candidate, Position, Application…
        │   └── services/     → AuthService, CandidatesService, PositionsService… (+ .spec.ts)
        ├── shared/
        │   ├── components/   → AppShell (sidebar+topbar), badges, dialog
        │   └── styles/       → tokens.scss (paleta SaaS)
        └── features/
            ├── auth/         → login, register (con campo "empresa" o "código")
            ├── candidates/   → list, form, detail
            ├── positions/    → list, form, detail
            ├── pipeline/     → vista kanban
            └── dashboard/    → KPIs + pipeline resumen + actividad reciente
```

## Flujo de Datos

1. **Reclutador** se autentica → JWT con `organizationId` + `role`.
2. **Frontend** envía requests HTTP con `Authorization: Bearer <token>`.
3. **Backend** decodifica JWT, scopea queries por `organizationId`, valida permisos según `role`.
4. **DB** devuelve datos del tenant correspondiente.
5. **Frontend** actualiza UI con Signals.

## Decisiones técnicas clave

- **Multi-tenancy por discriminator** (`organizationId` en cada tabla relevante) en lugar de
  bases de datos separadas por tenant — más simple para MVP, sigue siendo seguro si todas las
  queries scopean correctamente.
- **`organizationId` denormalizado en `applications`** para evitar joins en cada query de scoping.
- **Skills como JSON array** en lugar de tabla pivote — suficiente para filtrado por
  `JSON_CONTAINS`, simplifica el modelo. Migrable a tabla aparte si crece.
- **Estado del pipeline como ENUM** en `applications.status` — los 7 estados son de negocio y no
  cambian con frecuencia. Si en el futuro queremos pipeline configurable por org, migraremos a
  una tabla `pipeline_stages`.
