# High-Level System Architecture

## Logical Pipeline Overview

```
DATA SOURCES (IMD, Satellite, RSS, Social Hashtags, Citizen Reports)
       │
       ▼
SOURCE CONNECTORS Framework (connect, fetch, normalize, validate, publish)
       │
       ▼
INGESTION LAYER & STREAM QUEUE (Kafka / Redis / Event Bus)
       │
       ▼
DATA NORMALIZATION (Unified Weather Event Schema)
       │
       ▼
SPATIAL-TEMPORAL DEDUPLICATION ENGINE (Haversine + Cosine Similarity)
       │
       ▼
AI/ML NLP CLASSIFICATION PIPELINE (Category & Severity Scoring)
       │
       ▼
TRUST & VERIFICATION ENGINE (Multi-Factor Weighted Trust Score 0-100)
       │
       ▼
GEOLOCATION ENGINE (Indian States, UTs, Districts & Boundaries)
       │
       ▼
CENTRAL STORAGE (PostGIS / SQLite + Spatial Indexing)
       │
       ▼
REST & REAL-TIME WEBSOCKET API (Port 5000)
       │
       ▼
WEB DASHBOARD & CONTROL ROOM ADMIN PANEL (React 18 + Leaflet + Recharts)
```

## Component Boundaries

1. **Ingestion Layer**: Isolates external network formats (JSON, XML, HTML, REST, WebSockets) into a standardized `UnifiedWeatherEvent` object.
2. **AI/ML Engine**: Pluggable transformer/LLM architecture designed so models can be swapped out without altering backend database schemas.
3. **Trust & Verification**: Objective scoring engine allowing automatic routing to `VERIFIED`, `UNDER_REVIEW`, or `FLAGGED` queues for human control room officers.
4. **Realtime Broadcast**: Low-latency WebSocket connections streaming new ground observations directly into active dashboard instances without browser polling.
