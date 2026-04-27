# JobReady CRM — Presentación (5 minutos)

Guion completo para defender el proyecto. Estructura: problema → solución → demo → stack → roadmap.

---

## Antes de empezar (setup, 2 min antes de presentar)

1. Asegúrate de tener:
   - MySQL/XAMPP arriba.
   - Backend corriendo: `cd backend && npm start`.
   - Frontend corriendo: `cd frontend && npx ng serve --port 4200 --no-open`.
2. Abre el navegador en `http://localhost:4200/dashboard` con sesión iniciada.
3. **Pre-carga estos datos** para que el dashboard se vea con sustancia:
   - Stripe — Fintech — rating 5
   - PayPal — Fintech — rating 4
   - Vercel — DevOps — rating 5
   - Notion — SaaS — rating 4
   - Figma — SaaS — rating 3
4. Tab del navegador a fullscreen, zoom 110%.
5. Terminal con código abierta en otra pestaña por si te preguntan.

---

## SECCIÓN 1 — El problema (30 seg)

> "Buscar trabajo es un proyecto en sí mismo: mandas decenas de candidaturas en paralelo, cada una en un estado distinto, con entrevistas en distintas fases y notas dispersas en hojas de cálculo, mails y la cabeza.
>
> Sin un sistema, pierdes el seguimiento: olvidas a qué empresa contestaste, qué te dijeron en la entrevista, o cuál es la siguiente acción.
>
> Las hojas de cálculo se quedan cortas en cuanto quieres filtrar por estado o ver métricas. Y los CRM comerciales son caros y están pensados para vendedores, no para candidatos."

---

## SECCIÓN 2 — La solución (30 seg)

> "**JobReady CRM** es un mini CRM diseñado específicamente para la búsqueda de empleo.
>
> Te permite:
> - Centralizar todas tus empresas objetivo con sector, web, rating y notas.
> - Ver de un vistazo en un dashboard cuántas tienes, en qué sectores te concentras, cuál es tu rating medio.
> - Filtrar la lista en tiempo real por nombre, sector o rating mínimo.
>
> Es una webapp completa: frontend, backend y base de datos, con autenticación JWT y datos privados por usuario."

---

## SECCIÓN 3 — Demo en vivo (3 min)

> "Os enseño el flujo completo."

### Demo paso a paso

| Tiempo | Acción en pantalla | Qué decir |
|--------|--------------------|-----------|
| 0:00 | URL `http://localhost:4200` → te lleva a `/login` | "La raíz redirige a login. Si no tienes sesión, no entras: lo veremos en un momento." |
| 0:10 | Click "Regístrate" → form de register | "Registro estándar: nombre, email, password de 6+. La contraseña se hashea con bcrypt 12 rounds en el backend, no se guarda en plano." |
| 0:25 | Crear cuenta nueva → redirect a `/dashboard` | "Tras registrarte recibes un JWT que se guarda en localStorage. A partir de ahora, todas las peticiones a la API llevan el token automáticamente vía un interceptor." |
| 0:40 | **Dashboard** con métricas | "Aquí está el dashboard. 4 métricas principales: total empresas, rating medio, sectores distintos y sector top. Más abajo, distribución por sector y por rating con barras de progreso. Y la actividad reciente." |
| 1:10 | Click en una empresa de "Actividad reciente" → form de edición precargado | "Cualquier empresa de la lista reciente es clicable y te lleva al formulario de edición con los datos precargados." |
| 1:25 | Click en toolbar "Companies" | "Voy a la lista completa." |
| 1:35 | **Filtros** — escribir "stripe" | "Filtro de búsqueda en tiempo real. Busca en nombre, sector y notas." |
| 1:50 | Limpiar búsqueda, abrir el select de Sector → elegir "Fintech" | "Filtro por sector — el dropdown se autopobla con los sectores reales de tus empresas, no es una lista hardcoded." |
| 2:05 | Combinar con "Rating mínimo" → 4 estrellas | "Los filtros son combinables. Aquí veo solo Fintech con rating 4 o más." |
| 2:20 | Click "Limpiar" | "Botón limpiar resetea todo." |
| 2:25 | Click "Nueva" → form de creación | "Validaciones reactivas: el botón crear está deshabilitado mientras el form sea inválido. Aquí, nombre vacío → error visible. Website con formato inválido → error." |
| 2:50 | Rellenar y crear → vuelve a la lista con la nueva | "Crea, vuelve a la lista, ya aparece." |
| 3:00 | Botón salir → cierra sesión, va a /login. Intentar acceder a /dashboard → te rebota | "Logout limpia el token. Si intento ir directo a una ruta protegida, el guard me devuelve a login. Sin token, no se ve nada." |

---

## SECCIÓN 4 — Stack y arquitectura (30 seg)

> "**Backend:** Node.js 20 con Express 4. MySQL como base de datos, accedida con `pool.execute()` que usa prepared statements — sin riesgo de SQL injection. Auth con JWT firmado, password con bcrypt 12 rounds. Validación con express-validator.
>
> **Frontend:** Angular 20 con standalone components y signals. Sin NgModules. Reactive Forms con tipado seguro. Angular Material para la UI. Lazy loading por componente: cada ruta solo carga lo que necesita.
>
> **Decisiones clave:**
> - Signals en lugar de BehaviorSubject para estado local: menos boilerplate y mejor rendimiento.
> - Interceptor HTTP que añade el Bearer token y maneja 401 globalmente.
> - Filtros client-side porque el dataset esperado es pequeño (<200 empresas por usuario). Si crece, se migra a server-side."

---

## SECCIÓN 5 — Próximos pasos (30 seg)

> "El MVP cubre empresas. El siguiente paso es completar el modelo:
>
> 1. **Candidaturas** vinculadas a empresas, con estado (aplicada / entrevista / oferta / rechazada).
> 2. **Entrevistas** vinculadas a candidaturas, con tipo (teléfono/video/presencial), fecha y notas.
> 3. **Tareas de seguimiento** con fecha límite y estado done.
>
> En cuanto al producto:
> - Gráficos reales con Chart.js en lugar de progress bars.
> - Notificaciones cuando una entrevista esté próxima.
> - Export a CSV para llevarte tus datos.
>
> Y técnico:
> - Tests con Jest y Karma.
> - Dockerización + CI/CD.
> - Deploy real (Railway para backend, Vercel para frontend, PlanetScale para DB)."

---

## Cierre

> "El código está en GitHub: **github.com/Rvasrod/JobReady_CRM**. Gracias."

---

## Preguntas que pueden hacerte (anticípalas)

**¿Por qué no usaste un ORM como Sequelize o Prisma?**
> "Para un MVP de 5 tablas, mysql2 con prepared statements me daba todo lo necesario sin la curva de aprendizaje y la magia de un ORM. Si el modelo creciera, migraría a Prisma."

**¿Por qué Angular y no React?**
> "Angular trae batteries-included (router, forms, HTTP, DI) sin tener que elegir librerías. Para una app con muchos formularios y validaciones, Reactive Forms es muy potente. Y los signals de Angular 17+ resuelven el problema de estado local sin necesidad de Redux/NgRx."

**¿Cómo escala?**
> "Hoy todo es client-side y por usuario, así que escala bien hasta unos cientos de empresas por cuenta. Si crece, los siguientes pasos serían: paginación + filtros server-side, índices en `userId` y `createdAt` (ya están las FK), y mover el JWT a httpOnly cookies para mayor seguridad."

**¿Qué fue lo más difícil?**
> "Decidir el alcance del MVP. La tentación era implementar las 4 entidades a la vez, pero priorizamos companies + dashboard porque ya demuestran el valor end-to-end: auth, CRUD, filtros, métricas. El resto es repetición del mismo patrón."

**¿Cuánto tiempo te llevó?**
> "Sprint 5 del bootcamp — unas X semanas a tiempo parcial."

---

## Tips para la presentación

- **Habla del problema antes que del código.** Los técnicos quieren ver código, los demás quieren entender qué resuelves.
- **Demo > slides.** 3 minutos demostrando es más memorable que cualquier diapositiva.
- **Si algo falla en la demo, sigue.** No te quedes intentando arreglarlo en directo — di "tengo screenshots por si pasa esto" y avanza.
- **Termina mirando a la audiencia, no a la pantalla.** "Repo en GitHub. Gracias. ¿Preguntas?"
- **Cronométrate.** 5 minutos pasan rápido. Practica en voz alta 2 veces antes.
