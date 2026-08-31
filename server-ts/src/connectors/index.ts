import { WeatherEvent, SourceType } from '../types';
import { AIClassifierService } from '../services/aiClassifier';
import { TrustEngineService } from '../services/trustEngine';
import { DeduplicationService } from '../services/deduplicator';
import { GeoEngineService } from '../services/geoEngine';
import { query, run } from '../db/database';
import { RealtimeWebSocketService } from '../services/webSocketServer';

export interface BaseConnector {
  sourceId: string;
  sourceType: SourceType;
  connect(): Promise<boolean>;
  fetch(): Promise<any[]>;
  normalize(rawItem: any): Partial<WeatherEvent>;
  validate(event: Partial<WeatherEvent>): boolean;
  publish(event: Partial<WeatherEvent>): Promise<WeatherEvent>;
}

export class WeatherApiConnector implements BaseConnector {
  sourceId = 'src_open_meteo';
  sourceType: SourceType = 'PUBLIC_API';

  async connect(): Promise<boolean> {
    return true;
  }

  async fetch(): Promise<any[]> {
    // Simulates fetching real-time satellite & weather observations for key Indian monitoring stations
    return [
      {
        station: 'IMD Station Visakhapatnam',
        lat: 17.6868,
        lng: 83.2185,
        location: 'Visakhapatnam, Andhra Pradesh',
        temp: 29.4,
        rainfall_24h: 145.2,
        wind_speed: 68.5,
        humidity: 92,
        description: 'Severe cyclonic storm approach with heavy rainfall and gusty winds observed.',
        timestamp: new Date().toISOString(),
      },
      {
        station: 'IMD Station Mumbai High',
        lat: 19.0760,
        lng: 72.8777,
        location: 'Mumbai, Maharashtra',
        temp: 28.1,
        rainfall_24h: 192.5,
        wind_speed: 55.0,
        humidity: 95,
        description: 'Incessant torrential monsoon rains causing widespread waterlogging in low lying areas.',
        timestamp: new Date().toISOString(),
      }
    ];
  }

  normalize(rawItem: any): Partial<WeatherEvent> {
    const classification = AIClassifierService.classifyText(rawItem.description, {
      rainfall_mm: rawItem.rainfall_24h,
      wind_speed_kmh: rawItem.wind_speed,
      temperature_c: rawItem.temp
    });

    const geo = GeoEngineService.resolveLocation(rawItem.location, rawItem.lat, rawItem.lng);

    return {
      source_id: this.sourceId,
      source_type: this.sourceType,
      author_name: rawItem.station,
      timestamp: rawItem.timestamp,
      ingestion_timestamp: new Date().toISOString(),
      raw_text: rawItem.description,
      normalized_text: rawItem.description.toLowerCase(),
      event_category: classification.category,
      event_subcategory: classification.subcategory,
      severity: classification.severity,
      country: 'India',
      state: geo.state,
      district: geo.district,
      city: geo.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      location_confidence: geo.location_confidence,
      media_type: 'NONE',
      hashtags: ['#IMD', '#WeatherAPI', '#Monsoon'],
      weather_values: {
        rainfall_mm: rawItem.rainfall_24h,
        temperature_c: rawItem.temp,
        wind_speed_kmh: rawItem.wind_speed,
        humidity_percent: rawItem.humidity,
      },
      ai_confidence: classification.confidence,
    };
  }

  validate(event: Partial<WeatherEvent>): boolean {
    return !!(event.raw_text && event.state && event.latitude && event.longitude);
  }

  async publish(candidate: Partial<WeatherEvent>): Promise<WeatherEvent> {
    const existingRows = await query<WeatherEvent>(`SELECT * FROM weather_events ORDER BY created_at DESC LIMIT 100`);
    const parsedExisting = existingRows.map(r => ({
      ...r,
      hashtags: typeof r.hashtags === 'string' ? JSON.parse(r.hashtags) : r.hashtags,
      weather_values: typeof r.weather_values === 'string' ? JSON.parse(r.weather_values) : r.weather_values,
    }));

    const dedup = DeduplicationService.findDuplicate(candidate, parsedExisting);

    const trustResult = TrustEngineService.evaluateTrust({
      source_type: this.sourceType,
      source_reliability: 95,
      location_confidence: candidate.location_confidence || 0.9,
      timestamp_age_hours: 0.1,
      cross_source_count: 2,
      ai_confidence: candidate.ai_confidence || 0.9,
      is_duplicate: dedup.is_duplicate,
      duplicate_score: dedup.duplicate_score,
    });

    const event_id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const fullEvent: WeatherEvent = {
      event_id,
      source_id: candidate.source_id || this.sourceId,
      source_type: candidate.source_type || this.sourceType,
      source_url: candidate.source_url || 'https://mausam.imd.gov.in',
      author_name: candidate.author_name || 'Automated Feed',
      timestamp: candidate.timestamp || now,
      ingestion_timestamp: now,
      raw_text: candidate.raw_text!,
      normalized_text: candidate.normalized_text!,
      event_category: candidate.event_category || 'RAINFALL',
      event_subcategory: candidate.event_subcategory || 'general',
      severity: candidate.severity || 0.5,
      country: 'India',
      state: candidate.state!,
      district: candidate.district!,
      city: candidate.city!,
      latitude: candidate.latitude!,
      longitude: candidate.longitude!,
      location_confidence: candidate.location_confidence || 0.9,
      media_type: candidate.media_type || 'NONE',
      media_url: candidate.media_url,
      hashtags: candidate.hashtags || [],
      weather_values: candidate.weather_values || {},
      verification_status: trustResult.recommended_status,
      verification_score: trustResult.verification_score,
      trust_score: trustResult.trust_score,
      ai_confidence: candidate.ai_confidence || 0.85,
      duplicate_score: dedup.duplicate_score,
      is_duplicate: dedup.is_duplicate,
      parent_event_id: dedup.parent_event_id,
      created_at: now,
      updated_at: now,
    };

    await run(`
      INSERT INTO weather_events (
        event_id, source_id, source_type, source_url, author_name, timestamp, ingestion_timestamp,
        raw_text, normalized_text, event_category, event_subcategory, severity, country, state, district,
        city, latitude, longitude, location_confidence, media_type, media_url, hashtags, weather_values,
        verification_status, verification_score, trust_score, ai_confidence, duplicate_score, is_duplicate,
        parent_event_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      fullEvent.event_id, fullEvent.source_id, fullEvent.source_type, fullEvent.source_url, fullEvent.author_name,
      fullEvent.timestamp, fullEvent.ingestion_timestamp, fullEvent.raw_text, fullEvent.normalized_text,
      fullEvent.event_category, fullEvent.event_subcategory, fullEvent.severity, fullEvent.country, fullEvent.state,
      fullEvent.district, fullEvent.city, fullEvent.latitude, fullEvent.longitude, fullEvent.location_confidence,
      fullEvent.media_type, fullEvent.media_url, JSON.stringify(fullEvent.hashtags), JSON.stringify(fullEvent.weather_values),
      fullEvent.verification_status, fullEvent.verification_score, fullEvent.trust_score, fullEvent.ai_confidence,
      fullEvent.duplicate_score, fullEvent.is_duplicate ? 1 : 0, fullEvent.parent_event_id, fullEvent.created_at, fullEvent.updated_at
    ]);

    RealtimeWebSocketService.broadcastEvent(fullEvent);
    return fullEvent;
  }
}
