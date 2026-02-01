# Docker Setup for ComprendeYa

This document explains how to run ComprendeYa using Docker and docker-compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

1. **Create environment file**

   Copy the example environment file and add your API keys:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your actual API keys:
   - `ANTHROPIC_API_KEY`: Your Anthropic (Claude) API key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `YOUTUBE_API_KEY`: Your YouTube Data API key

2. **Start all services**

   ```bash
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database (port 5433 on host, 5432 in container)
   - Backend API (port 8000)
   - Frontend (port 3000)
   - Prefect UI (port 4200)

3. **Run database migrations**

   After the services are up, run the database migrations:

   ```bash
   docker-compose exec backend uv run alembic upgrade head
   ```

4. **Access the services**

   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Prefect UI**: http://localhost:4200

## Service Details

### Database (PostgreSQL)

- **Container name**: `comprende_ya_db`
- **Port**: 5433 (host) → 5432 (container)
  - Mapped to 5433 on host to avoid conflicts with local PostgreSQL instances
  - Services inside Docker network use port 5432
- **Credentials**:
  - User: `postgres`
  - Password: `postgres`
  - Database: `comprende_ya` (for app data)
  - Database: `prefect` (for Prefect workflows)
- **Data persistence**: Stored in `postgres_data` Docker volume

### Backend (FastAPI)

- **Container name**: `comprende_ya_backend`
- **Port**: 8000
- **Built from**: `backend/Dockerfile`
- **Dependencies**: Requires database and Prefect to be healthy
- **Volumes**:
  - `./backend/temp`: For temporary audio files
  - `./backend/alembic`: For database migrations

### Frontend (TanStack Start)

- **Container name**: `comprende_ya_frontend`
- **Port**: 3000
- **Built from**: `frontend/Dockerfile`
- **Dependencies**: Requires backend to be running

### Prefect Server

- **Container name**: `comprende_ya_prefect`
- **Port**: 4200
- **Image**: `prefecthq/prefect:3-latest`
- **Purpose**: Provides workflow orchestration and UI for monitoring video processing flows
- **Data persistence**: Stored in `prefect_data` Docker volume

## Common Commands

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f prefect
```

### Restart services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop all services

```bash
docker-compose down
```

### Stop and remove volumes (WARNING: deletes all data)

```bash
docker-compose down -v
```

### Rebuild after code changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Execute commands in containers

```bash
# Open shell in backend container
docker-compose exec backend sh

# Run alembic migrations
docker-compose exec backend uv run alembic upgrade head

# Create new migration
docker-compose exec backend uv run alembic revision --autogenerate -m "description"
```

## Development Workflow

For active development, you might prefer running services locally instead of in Docker:

1. **Keep only database and Prefect in Docker**:

   ```bash
   docker-compose up -d db prefect
   ```

2. **Run backend locally**:

   ```bash
   cd backend
   uv run fastapi dev src/main.py
   ```

3. **Run frontend locally**:

   ```bash
   cd frontend
   npm run dev
   ```

This gives you hot-reloading and faster development cycles.

## Troubleshooting

### Backend fails to start

- **Check API keys**: Ensure all required API keys are set in `.env`
- **Check database**: Ensure database is healthy with `docker-compose ps`
- **View logs**: `docker-compose logs backend`

### Database connection errors

- Wait for database to be fully initialized (check with `docker-compose ps`)
- Verify connection string in docker-compose.yaml
- Ensure database is healthy: `docker-compose exec db pg_isready -U postgres`

### Frontend can't connect to backend

- Ensure backend is running: `docker-compose ps`
- Check CORS settings in `backend/src/main.py`
- Verify API URL in frontend environment

### Prefect flows not appearing

- Check that backend has `PREFECT_API_URL` set correctly
- Verify Prefect server is running: http://localhost:4200
- Check backend can reach Prefect: `docker-compose exec backend ping prefect`

## Production Considerations

For production deployments:

1. **Use secrets management** instead of `.env` file
2. **Use external PostgreSQL** instance instead of containerized database
3. **Add reverse proxy** (nginx/traefik) for SSL/TLS
4. **Set up backup** for database volumes
5. **Configure resource limits** in docker-compose.yaml
6. **Use production-grade** Prefect setup with external database
7. **Enable authentication** for Prefect UI

## Network Architecture

All services communicate over a custom bridge network (`comprende_ya_network`):

```
┌─────────────┐     ┌──────────┐     ┌──────────┐
│  Frontend   │────▶│ Backend  │────▶│ Database │
│   :3000     │     │  :8000   │     │  :5432   │
└─────────────┘     └────┬─────┘     └──────────┘
                         │
                         ▼
                    ┌──────────┐
                    │ Prefect  │
                    │  :4200   │
                    └──────────┘
```

This allows containers to communicate using service names as hostnames.
