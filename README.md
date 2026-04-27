# JobReady CRM

> Tu CRM de búsqueda de empleo

[![Repo](https://img.shields.io/badge/GitHub-Rvasrod%2FJobReady__CRM-181717?logo=github)](https://github.com/Rvasrod/JobReady_CRM)
[![Angular](https://img.shields.io/badge/Angular-20-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#licencia)

Mini CRM para gestionar empresas objetivo, candidaturas, entrevistas y tareas de seguimiento durante el proceso de búsqueda de trabajo. Construido como proyecto final del Sprint 5 — AccioSoft Dev Academy.

**Repositorio:** https://github.com/Rvasrod/JobReady_CRM

---

## Tecnologías

**Frontend:** Angular 20 (Standalone Components) · Angular Material · Angular Signals · RxJS · Reactive Forms
**Backend:** Node.js 20 · Express 4 · JWT · bcrypt · express-validator · helmet · cors
**Base de datos:** MySQL 8 / MariaDB

## Funcionalidades

- ✅ Registro y login con JWT (password hasheada con bcrypt 12 rounds)
- ✅ CRUD completo de empresas objetivo (nombre, sector, web, rating, notas)
- ✅ Dashboard con métricas reales (total, rating medio, distribución por sector y rating)
- ✅ Filtros avanzados en la lista (búsqueda por texto, sector, rating mínimo)
- ✅ Validaciones reactivas con feedback visual
- ✅ Rutas protegidas con guard + interceptor JWT
- ✅ Diseño responsive con Angular Material
- ✅ **Backend en 4 capas** (routes / validators / controllers / services)
- ✅ **Frontend `core/features/shared`** con componentes < 150 líneas
- ✅ **Tests unitarios** — 17 Jest (backend) + 9 Karma/Jasmine (frontend)
- 🔜 Candidaturas con estado del proceso (próxima iteración)
- 🔜 Registro de entrevistas con notas (próxima iteración)
- 🔜 Tareas de seguimiento por candidatura (próxima iteración)

## Cómo ejecutarlo en local

### Requisitos previos
- Node.js 20+
- MySQL 8 o MariaDB (XAMPP funciona)
- Angular CLI 20+ (`npm i -g @angular/cli`)

### 1. Base de datos

```sql
mysql -u root < backend/src/db/schema.sql
```

Esto crea la base `jobready_crm_db` y las 5 tablas (`users`, `companies`, `applications`, `interviews`, `follow_up_tasks`).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env       # edita las variables
npm run dev                # nodemon, recarga automática
# o: npm start             # node directo
npm test                   # ejecuta los tests Jest
```

API en `http://localhost:3001/api`. Health check: `GET /api/health`.

### 3. Frontend

```bash
cd frontend
npm install
npx ng serve --port 4200
npx ng test --watch=false --browsers=ChromeHeadless   # ejecuta los tests Karma
```

App en `http://localhost:4200`. Te redirige a `/login` (regístrate la primera vez) → `/dashboard`.

## API REST

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/health` | Health check | No |
| POST | `/api/auth/register` | Crear usuario + JWT | No |
| POST | `/api/auth/login` | Login → JWT | No |
| GET | `/api/auth/me` | Usuario autenticado | JWT |
| GET | `/api/companies` | Lista de empresas del usuario | JWT |
| GET | `/api/companies/:id` | Detalle de empresa | JWT |
| POST | `/api/companies` | Crear empresa | JWT |
| PUT | `/api/companies/:id` | Actualizar empresa | JWT |
| DELETE | `/api/companies/:id` | Eliminar empresa | JWT |
| GET | `/api/stats` | Métricas para dashboard | JWT |

## Estructura del proyecto

```
JobReady_CRM/
├── README.md
├── ARCHITECTURE.md          → Documento de diseño
├── PROGRESS.md              → Bitácora del desarrollo (Lecciones 1-8)
├── .gitignore
│
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── tests/
│   │   └── services/         → tests Jest (auth, companies, stats)
│   └── src/
│       ├── app.js             → Servidor Express
│       ├── db/
│       │   ├── connection.js  → Pool MySQL
│       │   └── schema.sql     → DDL
│       ├── middleware/        → auth + validate
│       ├── validators/        → reglas express-validator por recurso
│       ├── controllers/       → req/res, mapping a HTTP
│       ├── services/          → lógica de negocio + acceso a DB
│       └── routes/            → solo paths + cadena de middleware
│
└── frontend/
    └── src/
        ├── environments/
        │   └── environment.ts
        └── app/
            ├── app.ts / app.config.ts / app.routes.ts
            ├── core/
            │   ├── auth/
            │   │   ├── auth.guard.ts        → CanActivateFn
            │   │   └── auth.interceptor.ts  → Bearer + 401
            │   ├── models/  → Company, User, DashboardStats
            │   └── services/ → AuthService, CompaniesService, StatsService (+ .spec.ts)
            ├── shared/
            │   └── components/
            │       └── app-toolbar.component.ts → toolbar reutilizable
            └── features/
                ├── auth/         → login, register
                ├── companies/    → list (con filtros), form (create/edit)
                └── dashboard/    → métricas + actividad reciente
```

## Decisiones técnicas

- **Backend en 4 capas** (`routes → validators → controllers → services`) → cada capa hace una cosa. Los servicios lanzan errores con `.status` y los controllers los traducen a HTTP, sin try/catch duplicado en cada handler.
- **Frontend `core/features/shared`** → `shared/` para componentes reutilizables (ej. `AppToolbarComponent`), `core/` para infraestructura (auth, services, models), `features/` para pantallas.
- **Componentes < 150 líneas** → templates y estilos extraídos a `.html` y `.scss` separados. Solo lógica en el `.ts`.
- **Tests unitarios** → Jest en backend (pool MySQL mockeado) y Karma+Jasmine en frontend (`HttpTestingController` para servicios HTTP).
- **Standalone Components** (Angular 17+) en lugar de NgModules → menos boilerplate, lazy loading directo desde rutas con `loadComponent`.
- **Signals** para estado local de componentes (`items`, `filteredItems`, `loading`, `stats`) → mejor rendimiento que BehaviorSubject + async pipe en casos simples.
- **Reactive Forms** con `nonNullable.group` y validadores → tipos seguros en el form value.
- **JWT en localStorage + interceptor** que añade `Authorization: Bearer <token>` y maneja 401 → logout automático.
- **bcrypt 12 rounds** en backend → estándar OWASP para 2024+.
- **Pool MySQL con `pool.execute()`** (prepared statements) → previene SQL injection.
- **express-validator** + middleware centralizado de errores 400.
- **Filtros client-side** en la lista → el dataset esperado es pequeño (<200 empresas por usuario). Si crece, migrar a server-side con paginación.

## Roadmap

- [ ] Endpoints + UI de candidaturas (`applications`)
- [ ] Endpoints + UI de entrevistas (`interviews`)
- [ ] To-do de seguimiento (`follow_up_tasks`)
- [ ] Gráficos reales (Chart.js) en lugar de progress bars
- [ ] Notificaciones MatSnackBar para feedback de éxito
- [x] ~~Tests unitarios (Jest backend, Karma frontend)~~ ✅
- [ ] Tests de controllers/rutas (supertest) y de componentes Angular
- [ ] Dockerización + CI/CD

## Autor

Desarrollado como proyecto final del **Sprint 5 — AccioSoft Dev Academy**.

## Licencia

MIT
