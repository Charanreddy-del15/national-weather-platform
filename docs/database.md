# Database Schema & Spatial Indexing Design

The platform uses PostgreSQL 15 with the PostGIS extension enabled. A fallback SQLite spatial engine is provided for development environments.

## Unified Schema: `weather_events`

| Column | Type | Description |
|---|---|---|
| `event_id` | UUID / String | Primary key |
| `source_id` | String | Foreign key to connector source |
| `source_type` | String | GOVT_API, RSS, PUBLIC_SOCIAL, CITIZEN, PROVIDER |
| `author_name` | String | Originating author or authority name |
| `raw_text` | Text | Original raw text payload |
| `normalized_text` | Text | Cleaned, tokenized text |
| `event_category` | String | Classified category (Heavy Rain, Cyclone, etc.) |
| `severity` | Integer | Severity scale (1 = Minimal, 5 = Extreme) |
| `country` | String | Default "India" |
| `state` | String | Indian State / UT |
| `district` | String | District name |
| `city` | String | City or village |
| `latitude` | Float | WGS84 Latitude |
| `longitude` | Float | WGS84 Longitude |
| `geom` | Geometry(Point, 4326) | PostGIS spatial point geometry |
| `location_confidence` | Float | Confidence score (0.0 to 1.0) |
| `trust_score` | Float | Multi-factor verification score |
| `verification_status` | String | UNVERIFIED, UNDER_REVIEW, VERIFIED, REJECTED, FLAGGED, DUPLICATE |
| `is_duplicate` | Boolean | True if flagged as near-duplicate |
| `parent_event_id` | String | Parent event ID if duplicate |
| `created_at` | Timestamp | Ingestion timestamp |

## Spatial & Performance Indexes

```sql
CREATE INDEX idx_weather_events_geom ON weather_events USING GIST (geom);
CREATE INDEX idx_weather_events_time_status ON weather_events (created_at DESC, verification_status);
CREATE INDEX idx_weather_events_state_district ON weather_events (state, district);
CREATE INDEX idx_weather_events_category ON weather_events (event_category);
```
