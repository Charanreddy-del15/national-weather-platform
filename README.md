# WeatherVani India — National Weather Big Data Analytics Platform

A production-ready, scalable National Weather Big Data Analytics & Intelligence Platform built to collect, process, verify, classify, deduplicate, store, analyze, and visualize real-time weather-related information across all 28 States and Union Territories of India.

---

## Key System Architecture Features

- **Multi-Source Ingestion Engine**: Pluggable source connectors supporting Public Weather APIs (IMD, Open-Meteo), Government Feeds (CWC), RSS streams, authorized Social Media Hashtag monitors (`#IMD`, `#Weather`, `#Rain`, `#Flood`, `#Cyclone`, etc.), and public Citizen Reports.
- **AI/ML Classification Pipeline**: Automatic NLP classification of raw text into 16+ weather categories (Rainfall, Heavy Rainfall, Thunderstorm, Lightning, Flood, Flash Flood, Cyclone, Heatwave, Cold Wave, Fog, Dust Storm, Strong Winds, Hailstorm, Landslide, Cloudburst) with severity calculation and confidence scoring.
- **Trust & Verification Engine**: Multi-factor weighted reliability scoring ($0-100\%$) combining source reliability, location confidence, timestamp freshness, cross-source confirmation, AI confidence, and duplicate penalties.
- **Spatial-Temporal Deduplication**: Cosine text similarity, spatial Haversine proximity ($\le 20\text{km}$), and temporal clustering ($\le 4\text{ hours}$) that links duplicate records while preserving raw provenance.
- **Interactive Geospatial Dashboard**: Interactive Leaflet India map with color-coded severity markers, marker clustering, state/district vector overlays, KPI statistics, and real-time WebSocket live feed ticker.
- **Role-Based Control Room Admin Panel**: Comprehensive admin interface featuring Source Connector Management, Human Verification Queue, Hashtag Configurator, ML Model Telemetry, User RBAC Manager, Audit Logging, and System Health Monitoring.

---

## Monorepo Folder Structure

```
national-weather-platform/
├── frontend/                     # React 18 + Vite + TypeScript + Tailwind CSS + Leaflet + Recharts
├── backend/                      # Python FastAPI Application & SQLAlchemy Models
├── server-ts/                    # Runnable Express & WebSocket Backend API Server (Node 25 Out-of-the-Box)
├── ingestion/                    # Pluggable Source Connectors
├── ml/                           # AI/ML Classification & Verification Engine
├── infrastructure/               # Docker & Deployment Configuration
│   └── docker-compose.yml
├── docs/                         # Architecture, API & Database documentation
├── README.md
└── .env.example
```

---

## Quick Start (Running Locally)

### 1. Launch Backend API & Real-time Server (Node.js/TypeScript)
```bash
cd server-ts
npm install
npm run seed     # Populate database with 50+ realistic Indian weather events across 28 states
npm run dev      # Server starts on http://localhost:5000 and WebSocket on ws://localhost:5000/ws/events
```

### 2. Launch Frontend Dashboard
```bash
cd frontend
npm install
npm run dev      # Vite dev server opens on http://localhost:3000
```

---

## Running with Docker Compose (Production Setup)

```bash
docker-compose up --build
```
Spawns PostGIS spatial database, Redis cache, Kafka stream bus, FastAPI backend, and Vite frontend.

---

## Default Admin Credentials

- **Email**: `admin@weathervani.gov.in`
- **Password**: `Admin@1234`
- **Role**: `SUPER_ADMIN`
