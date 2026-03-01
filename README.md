# ms-ga-noti — Notification Service

GymAPI notification orchestration hub. Consumes Kafka domain events, renders templates, and dispatches to RabbitMQ delivery queues (email/push/SMS).

| Property     | Value                                   |
|--------------|-----------------------------------------|
| Language     | Node.js 20 + TypeScript (strict)        |
| Framework    | Express                                 |
| Database     | MongoDB (Mongoose)                      |
| Messaging    | Kafka (consume) + RabbitMQ (dispatch)   |
| Port         | 8091                                    |
| Base Path    | `/gymapi/v1/notifications`              |

## Quick Start

```bash
cp .env.example .env
docker-compose up -d
npm install
npm run dev
```

## Health Check

```
GET http://localhost:8091/health
→ 200 {"status":"ok","service":"ms-ga-noti"}
```

## API Endpoints

| Method | Path                                          | Permission              |
|--------|-----------------------------------------------|-------------------------|
| POST   | `/gymapi/v1/notifications/send`               | `notification:manage`   |
| GET    | `/gymapi/v1/notifications`                    | `notification:read_own` |
| PUT    | `/gymapi/v1/notifications/:id/read`           | `notification:read_own` |
| GET    | `/gymapi/v1/notifications/preferences/:id`    | `notification:read_own` |
| PUT    | `/gymapi/v1/notifications/preferences/:id`    | `notification:read_own` |
| GET    | `/gymapi/v1/notifications/templates`          | `notification:manage`   |
| POST   | `/gymapi/v1/notifications/templates`          | `notification:manage`   |
| PUT    | `/gymapi/v1/notifications/templates/:id`      | `notification:manage`   |
| DELETE | `/gymapi/v1/notifications/templates/:id`      | `notification:manage`   |

## Scripts

```bash
npm run dev          # ts-node-dev hot reload
npm run build        # compile TypeScript → dist/
npm run start        # run compiled output
npm run typecheck    # type check without emitting
npm run lint         # ESLint strict TypeScript rules
npm run test         # Jest
npm run test:coverage
```

## Architecture

```
Kafka → EventProcessor → NotificationService → RabbitMQ
                               ↓
                           MongoDB (noti_db)
RabbitMQ → email.worker → SendGrid/SES
         → push.worker  → FCM/APNs
         → sms.worker   → Twilio
```
