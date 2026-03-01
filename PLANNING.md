# ms-ga-noti — Notification Service: Project Initialization Plan

## Background

`ms-ga-noti` is the **notification orchestration hub** for GymAPI — a Node.js/TypeScript/Express microservice that:
- Consumes Kafka domain events (identity, booking, payment, membership, customer, trainer topics)
- Checks user preferences, renders Handlebars templates, and dispatches to RabbitMQ queues
- Runs separate email/push/SMS workers that deliver via SendGrid, FCM, and Twilio
- Exposes REST API at `POST /gymapi/v1/notifications` (port 8091)
- Stores data in MongoDB (`noti_db`)

This plan covers **project initialization + git push**. Feature implementation follows an **API-First** approach using OpenAPI (Swagger).

---

## Proposed Changes

### Project Bootstrap

#### [NEW] `package.json`
- `name: ms-ga-noti`, `version: 1.0.0`
- **Runtime deps**: `express`, `mongoose`, `kafkajs`, `amqplib`, `handlebars`, `winston`, `dotenv`, `cors`, `helmet`, `uuid`, `reflect-metadata`, `inversify`
- **Dev deps**: `typescript`, `ts-node-dev`, `@types/*`, `jest`, `ts-jest`, `supertest`, `@types/supertest`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`, `openapi-typescript`
- Scripts: `dev`, `build`, `start`, `test`, `lint`, `format`, `codegen`

#### [NEW] `openapi/swagger.yaml`
- OpenAPI 3.0 specification for all notification, preference, and template endpoints.

#### [NEW] `tsconfig.json`
- `target: ES2022`, `module: commonjs`, `strict: true`, `outDir: ./dist`, `rootDir: ./src`
- Path aliases for clean imports

#### [NEW] `.env.example`
All env vars from the spec:
```
PORT, APP_ENV, MONGODB_URI, KAFKA_BROKERS, KAFKA_GROUP_ID,
RABBITMQ_URL, MAX_RETRIES, EMAIL_PROVIDER, SENDGRID_API_KEY,
FROM_EMAIL, FROM_NAME, FCM_SERVER_KEY, TWILIO_*
```

#### [NEW] `.gitignore`
Standard Node.js gitignore (node_modules, dist, .env, *.log)

---

### Source Code Structure

#### [NEW] `src/config/index.ts`
Full configuration object pulled from env vars (port, mongo, kafka, rabbitmq, email, push, sms) — exactly as defined in ms-ga-noti.md.

#### [NEW] `src/shared/errors/`
- `app-error.ts` — Base `AppError(message, statusCode)`
- `not-found-error.ts`
- `validation-error.ts`
- `index.ts` — barrel export

#### [NEW] `src/shared/logger/index.ts`
Winston logger with `info/warn/error` levels, structured JSON output, `X-Correlation-ID` support.

#### [NEW] `src/shared/utils/template.engine.ts`
`TemplateEngine` class wrapping `Handlebars.compile()` — renders body templates with variable substitution.

#### [NEW] `src/infrastructure/database/connection.ts`
`connectMongoDB()` — connects to MongoDB via `mongoose.connect(config.mongodb.uri)`, graceful disconnect on SIGTERM.

#### [NEW] `src/app.ts`
Express app factory: applies `helmet`, `cors`, `express.json()`, correlation middleware, health check route `GET /health`, placeholder router mount for `/gymapi/v1/notifications`.

#### [NEW] `src/server.ts`
Entry point: connects MongoDB, starts Express on configured port. Handles graceful shutdown.

---

### Docker & Dev Infrastructure

#### [NEW] `Dockerfile`
Multi-stage build:
1. `builder` stage: `node:20-alpine`, `npm ci`, `npm run build`
2. `production` stage: copy `dist/` + `node_modules`, `CMD ["node", "dist/server.js"]`

#### [NEW] `docker-compose.yml`
Services per ms-ga-noti.md spec:
- `app`: built from Dockerfile, port 8091, env from `.env`
- `mongo`: `mongo:7`, port 27018→27017, named volume `noti_mongo_data`
- `rabbitmq`: `rabbitmq:3-management-alpine`, ports 5672 + 15672, health check

#### [NEW] `README.md`
Quick-start: clone, `cp .env.example .env`, `docker-compose up`, endpoints list.

---

### Git

- `git init` in `e:\Workplace\ms-ga-noti`
- Add remote: `git@github.com:pploc/ms-ga-noti.git`
- Initial commit with all scaffolded files
- `git push -u origin main`

---

## Feature Phases (Upcoming — not in this plan)

| Phase | Scope |
|-------|-------|
| 0 | API-First Design: OpenAPI (Swagger) spec + CodeGen for types |
| 3 | Domain entities + repository interfaces (using generated types) |
| 4 | MongoDB schemas + repository impls + Kafka consumer + RabbitMQ publisher |
| 5 | Application services + event handlers (identity, booking, payment, membership, customer, trainer) |
| 6 | REST API controllers, routes, auth middleware, permission middleware |
| 7 | Email / Push / SMS workers |
| 8 | Seed default templates, unit + integration tests |
| 9 | Setup Inversify DI container and decorators |

---

## Verification Plan

### Automated — TypeScript Build Check
After scaffolding, run:
```bash
cd e:\Workplace\ms-ga-noti
npm install
npm run build
```
✅ Pass = no TypeScript compilation errors.

### Automated — Server Startup (basic smoke test)
```bash
npm run dev
```
✅ Pass = server starts on port 8091, MongoDB connection attempt logged.

### Manual — Health Endpoint
With server running:
```bash
curl http://localhost:8091/health
```
Expected: `200 OK` with `{"status":"ok"}`.

### Manual — Git Push Verification
```bash
git log --oneline -1
git remote -v
```
Then confirm repository appears at `https://github.com/pploc/ms-ga-noti` with initial commit.
