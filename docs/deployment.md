# Production Deployment & Security Hardening Guide

## 1. Production Docker Orchestration
Ensure Docker Engine 24+ and Docker Compose v2 are installed on target host.

```bash
# Clone repository
git clone https://github.com/gov-india/national-weather-platform.git
cd national-weather-platform

# Configure production environment variables
cp .env.example .env
nano .env   # Update SECRET_KEY, POSTGRES_PASSWORD, CORS_ORIGINS

# Build and start services in detached mode
docker-compose -f docker-compose.yml up -d --build
```

## 2. Security Hardening Checklists
- [x] **No Hardcoded Credentials**: Secrets loaded dynamically via environment variables.
- [x] **Strict CORS Scoping**: Backend rejects requests outside specified domain origins.
- [x] **RBAC Enforcement**: Admin and verification endpoints enforce JWT bearer token validation.
- [x] **Input Validation**: All payloads validated via Pydantic v2 schemas.
- [x] **File Upload Controls**: Citizen photo/video uploads checked for MIME type and size limits ($50\text{MB}$ max).
- [x] **Audit Trail**: Administrative actions logged with before/after diffs, user IDs, and client IP addresses.
