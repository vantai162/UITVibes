---
description: "UITVibes Microservices — Global development guidelines for all agents"
---

# Copilot Instructions for UITVibes

## Project Overview

**UITVibes** is a social media platform with:

- **Backend**: .NET 8 microservices (AuthService, UserService, PostService, MessageService, NotificationService) orchestrated by .NET Aspire
- **Frontend**: React Native 0.81.5 with Expo Router (file-based routing)
- **Infrastructure**: PostgreSQL (per-service), Redis (caching/realtime), RabbitMQ (async messaging), Firebase (push notifications)

## Development Quick Start

### Backend

```bash
cd Backend
dotnet run --project UITVibes-Microservices.AppHost/UITVibes-Microservices.AppHost.csproj
# Docker Desktop must be running
# Services start at: http://localhost:5512 (API Gateway)
# Aspire dashboard: http://0.0.0.0:15144
```

### Frontend

```bash
cd frontend
npm install
npm start  # or: npm run android | npm run ios | npm run web
```

## Core Architecture Principles

1. **Microservices Pattern**: Each service has its own database (database-per-service)
2. **API Gateway**: All frontend requests → ApiService (YARP reverse proxy)
3. **Async Communication**: RabbitMQ for cross-service events
4. **Real-time Features**: SignalR for chat + online status (Redis backplane)
5. **JWT Security**: Validated in API Gateway, services trust incoming requests

## Key Guidelines

### Backend Development

- ✅ Use DTOs for all API contracts (domain models stay internal)
- ✅ Publish RabbitMQ events for cross-service notifications
- ✅ Soft delete with `IsDeleted` flag (never hard delete)
- ✅ Migrations run automatically on AppHost startup
- ✅ Respect database-per-service: no direct cross-service queries

### Frontend Development

- ✅ All API calls in `frontend/services/api.ts` (centralized client)
- ✅ Use `useApp()` hook for global state (auth, feed, messages, notifications)
- ✅ Token management automatic via `httpClient.ts` (auto-refresh on 401)
- ✅ Android emulator: use `10.0.2.2` instead of `localhost`
- ✅ Nested Stacks auto-hide parent tab bar (e.g., `message/chat/[id]`)

## Common Development Tasks

**Add API Endpoint**:

1. Create DTO in `[Service]/DTOs/`
2. Update service interface & implementation
3. Create controller method with route
4. Call from frontend via `frontend/services/api.ts`

**Cross-Service Events**:

1. Publish in source service (e.g., AuthService publishes `UserCreated`)
2. Create consumer HostedService in target service
3. Register in target `Program.cs`
4. Process event (e.g., UserService creates profile)

**Real-time Features**:

1. Use SignalR in MessageService for chat + online tracking
2. Frontend calls `invokeHub()` from `signalrService.ts`
3. Frontend listens with `conn.on("EventName", callback)`
4. Heartbeat via `RefreshOnline` every ~4.5 min

## Debugging Resources

- **Aspire Dashboard**: http://0.0.0.0:15144 (logs, traces, resource health)
- **Service Swagger**: http://localhost:[port]/swagger
- **RabbitMQ Management**: http://localhost:15672 (user: guest, password: guest)
- **Frontend DevTools**: React Native Debugger or browser console

## Specialized Agents Available

- **[Notification Service Backend Specialist](.github/agents/notification-service.agent.md)** — Firebase push notifications, Outbox pattern, RabbitMQ consumers
- **[Frontend Notification Integration Specialist](.github/agents/frontend-notification.agent.md)** — Device tokens, Firebase setup, in-app notification UI, real-device testing

## Documentation & Guides

- **[Architecture Guide & AI Productivity](.github/AGENTS.md)** — Comprehensive patterns, component/hook samples, testing strategies, database migrations
- **[Troubleshooting Guide](.github/TROUBLESHOOTING.md)** — Common backend/frontend issues, debugging steps, development workflow tips
- **[API Implementation Guide](.github/API_IMPLEMENTATION.md)** — Step-by-step endpoint creation, frontend integration, patterns, testing
- **[Backend API ↔ Frontend Sync Skill](.github/skills/backend-api-frontend-sync/SKILL.md)** — Connecting UI to real API, mock data removal
- **[Frontend UI/UX Enhancements Skill](.github/skills/frontend-ui-ux-enhancements/SKILL.md)** — Component improvements, animations
- **[Project README](README.md)** — Features, system requirements (Vietnamese)
- **[Frontend README](frontend/README.md)** — Expo setup instructions
