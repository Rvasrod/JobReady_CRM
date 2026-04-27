# JobReady CRM - Architecture Document

## Descripción del Producto

JobReady CRM es una aplicación web para gestionar el proceso de búsqueda de empleo, permitiendo seguir candidaturas, entrevistas y tareas de seguimiento en un único lugar. Diseñada para mantener organizada y medible la búsqueda de trabajo.

## Stack Tecnológico

### Frontend
- Angular 17+ (Standalone Components)
- Angular Material (UI)
- Angular Signals
- RxJS
- Angular Router

### Backend
- Node.js 20 + Express 4
- express-validator
- JWT + bcrypt
- mysql2
- cors + helmet

### Base de Datos
- MySQL 8

## Funcionalidades MVP

1. **Gestión de empresas objetivo** - CRUD de empresas con sector, web, notas y rating
2. **Candidaturas con estado del proceso** - Seguimiento de aplicaciones con estados (applied/interview/offer/rejected)
3. **Registro de entrevistas con notas** - Programación y registro de entrevistas (phone/video/presential)
4. **Tareas de seguimiento** - To-do list vinculada a cada candidatura
5. **Dashboard con métricas** - Estadísticas visuales de la búsqueda de empleo

## Modelo de Datos

### Tabla: companies
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| userId | INT (FK) | Referencia al usuario |
| name | VARCHAR(255) | Nombre de la empresa |
| sector | VARCHAR(100) | Sector/industria |
| website | VARCHAR(255) | URL de la empresa |
| notes | TEXT | Notas adicionales |
| rating | INT | Puntuación 1-5 |
| createdAt | DATETIME | Fecha de creación |

### Tabla: applications
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| userId | INT (FK) | Referencia al usuario |
| companyId | INT (FK) | Referencia a empresa |
| position | VARCHAR(255) | Puesto solicitado |
| status | ENUM | applied/interview/offer/rejected |
| appliedAt | DATE | Fecha de aplicación |
| notes | TEXT | Notas adicionales |
| createdAt | DATETIME | Fecha de creación |

### Tabla: interviews
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| applicationId | INT (FK) | Referencia a candidatura |
| date | DATETIME | Fecha/hora de entrevista |
| type | ENUM | phone/video/presential |
| notes | TEXT | Notas de la entrevista |
| result | TEXT | Resultado/comentarios |
| createdAt | DATETIME | Fecha de creación |

### Tabla: follow_up_tasks
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK) | Identificador único |
| applicationId | INT (FK) | Referencia a candidatura |
| title | VARCHAR(255) | Título de la tarea |
| dueDate | DATE | Fecha límite |
| done | BOOLEAN | Tarea completada |
| createdAt | DATETIME | Fecha de creación |

## Relaciones entre Tablas

```
users (1) ──── (N) companies
users (1) ──── (N) applications
companies (1) ──── (N) applications
applications (1) ──── (N) interviews
applications (1) ──── (N) follow_up_tasks
```

## Estructura de Carpetas

```
JobReady_CRM/
├── ARCHITECTURE.md
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/       (auth, services, models)
│       │   ├── features/   (companylist, applications, interviews, tasks, dashboard)
│       │   └── shared/     (componentes reutilizables)
│       └── environments/
└── backend/
    └── src/
        ├── routes/     (API endpoints)
        ├── middleware/  (auth JWT, validaciones)
        ├── services/   (lógica de negocio)
        └── db/         (conexión MySQL)
```

## Flujo de Datos

1. **Usuario** → Autenticación (JWT) → Backend
2. **Frontend** → HTTP Requests → API REST
3. **Backend** → Validación → MySQL → Respuesta JSON
4. **Frontend** → Actualiza UI con Signals → Usuario