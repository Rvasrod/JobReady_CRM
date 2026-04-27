# JobReady CRM

> Tu CRM de búsqueda de empleo

Mini CRM para gestionar empresas objetivo, candidaturas, entrevistas y tareas de seguimiento durante el proceso de búsqueda de trabajo. Construido como proyecto final del Sprint 5 — AccioSoft Dev Academy.

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
```

API en `http://localhost:3001/api`. Health check: `GET /api/health`.

### 3. Frontend

```bash
cd frontend
npm install
npx ng serve --port 4200
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
│   └── src/
│       ├── app.js           → Servidor Express
│       ├── db/
│       │   ├── connection.js  → Pool MySQL
│       │   └── schema.sql     → DDL
│       ├── middleware/
│       │   ├── auth.middleware.js     → Verifica JWT
│       │   └── validate.middleware.js → express-validator
│       └── routes/
│           ├── auth.routes.js
│           ├── companies.routes.js
│           └── stats.routes.js
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
            │   └── services/ → AuthService, CompaniesService, StatsService
            └── features/
                ├── auth/         → login, register
                ├── companies/    → list (con filtros), form (create/edit)
                └── dashboard/    → métricas + actividad reciente
```

## Decisiones técnicas

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
- [ ] Tests unitarios (Jest backend, Karma frontend)
- [ ] Dockerización + CI/CD

## Autor

Desarrollado como proyecto final del **Sprint 5 — AccioSoft Dev Academy**.

## Licencia

MIT
