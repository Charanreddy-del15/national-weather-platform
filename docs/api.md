# API Documentation — NWDAP-India REST & WebSocket Services

Base URL: `/api/v1`

## Authentication Endpoints

### `POST /api/v1/auth/login`
Authenticates users and returns JWT access tokens.
- **Request Body**: `{ "username": "admin@weather.gov.in", "password": "password" }`
- **Response**: `{ "access_token": "...", "token_type": "bearer", "role": "Super Admin" }`

---

## Event Management Endpoints

### `GET /api/v1/events`
Query paginated weather events with dynamic filters.
- **Query Params**: `page`, `limit`, `state`, `district`, `category`, `status`, `severity_min`, `source_type`
- **Response**: List of unified weather event objects with spatial coordinates.

### `GET /api/v1/events/map`
Returns GeoJSON FeatureCollection optimized for Leaflet / MapLibre map rendering within bounding box coordinates.
- **Query Params**: `min_lat`, `max_lat`, `min_lng`, `max_lng`, `category`, `status`

### `POST /api/v1/events/{id}/verify`
Admin moderation endpoint to update verification status.
- **Request Body**: `{ "status": "VERIFIED", "reason": "Confirmed by district disaster control room" }`

---

## Analytics Endpoints

### `GET /api/v1/analytics/timeline`
- **Query Params**: `days` (default 7)
- **Response**: Time-series histogram grouped by hour/day and event category.

### `GET /api/v1/analytics/geographic`
- **Response**: State-wise and district-wise aggregation of reports and severe events.

---

## Citizen Reporting Endpoint

### `POST /api/v1/citizen/reports`
- **Multipart Form**: `category`, `description`, `state`, `district`, `city`, `latitude`, `longitude`, `file`
- **Response**: Created report with status `UNVERIFIED` and assigned event ID.

---

## Real-Time WebSocket

### `WS /ws/events`
Connect to receive live JSON event broadcasts when new high-severity or verified events are processed by the ingestion engine.
