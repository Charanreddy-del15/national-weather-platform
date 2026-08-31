import { Request, Response } from 'express';
import { AIClassifierService } from '../services/aiClassifier';
import { TrustEngineService } from '../services/trustEngine';
import { DeduplicationService } from '../services/deduplicator';
import { GeoEngineService } from '../services/geoEngine';
import { query, run } from '../db/database';
import { WeatherEvent } from '../types';
import { RealtimeWebSocketService } from '../services/webSocketServer';

export class CitizenController {
  public static async submitReport(req: Request, res: Response) {
    try {
      const {
        reporter_name = 'Anonymous Citizen',
        description,
        event_category,
        location,
        latitude,
        longitude,
        captcha_token,
      } = req.body;

      if (!description || description.trim().length < 5) {
        return res.status(400).json({ error: 'Detailed report description is required (min 5 characters).' });
      }

      // Geo resolution
      const geo = GeoEngineService.resolveLocation(
        location,
        latitude ? parseFloat(latitude) : undefined,
        longitude ? parseFloat(longitude) : undefined
      );

      // AI Classification
      const classification = AIClassifierService.classifyText(description);
      const category = event_category && event_category !== 'OTHER' ? event_category : classification.category;

      const mediaFile = (req as any).file;
      let media_url = undefined;
      let media_type: 'IMAGE' | 'VIDEO' | 'NONE' = 'NONE';

      if (mediaFile) {
        media_url = `/uploads/${mediaFile.filename}`;
        media_type = mediaFile.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE';
      }

      const existingRows = await query<WeatherEvent>(`SELECT * FROM weather_events ORDER BY created_at DESC LIMIT 100`);
      const parsedExisting = existingRows.map(r => ({
        ...r,
        hashtags: typeof r.hashtags === 'string' ? JSON.parse(r.hashtags) : r.hashtags,
        weather_values: typeof r.weather_values === 'string' ? JSON.parse(r.weather_values) : r.weather_values,
      }));

      const candidatePartial: Partial<WeatherEvent> = {
        latitude: geo.latitude,
        longitude: geo.longitude,
        normalized_text: description.toLowerCase(),
        event_category: category,
        timestamp: new Date().toISOString(),
      };

      const dedup = DeduplicationService.findDuplicate(candidatePartial, parsedExisting);

      const trustResult = TrustEngineService.evaluateTrust({
        source_type: 'CITIZEN_REPORT',
        source_reliability: 65,
        location_confidence: geo.location_confidence,
        timestamp_age_hours: 0,
        cross_source_count: 0,
        ai_confidence: classification.confidence,
        is_duplicate: dedup.is_duplicate,
        duplicate_score: dedup.duplicate_score,
      });

      const event_id = `cit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const newEvent: WeatherEvent = {
        event_id,
        source_id: 'src_citizen_portal',
        source_type: 'CITIZEN_REPORT',
        author_name: reporter_name,
        timestamp: now,
        ingestion_timestamp: now,
        raw_text: description,
        normalized_text: description.toLowerCase(),
        event_category: category,
        event_subcategory: classification.subcategory,
        severity: classification.severity,
        country: 'India',
        state: geo.state,
        district: geo.district,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        location_confidence: geo.location_confidence,
        media_type,
        media_url,
        hashtags: ['#CitizenReport', `#${geo.state.replace(/\s+/g, '')}`],
        weather_values: {},
        verification_status: trustResult.recommended_status === 'VERIFIED' ? 'UNDER_REVIEW' : trustResult.recommended_status,
        verification_score: trustResult.verification_score,
        trust_score: trustResult.trust_score,
        ai_confidence: classification.confidence,
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
        newEvent.event_id, newEvent.source_id, newEvent.source_type, newEvent.source_url || null, newEvent.author_name,
        newEvent.timestamp, newEvent.ingestion_timestamp, newEvent.raw_text, newEvent.normalized_text,
        newEvent.event_category, newEvent.event_subcategory, newEvent.severity, newEvent.country, newEvent.state,
        newEvent.district, newEvent.city, newEvent.latitude, newEvent.longitude, newEvent.location_confidence,
        newEvent.media_type, newEvent.media_url || null, JSON.stringify(newEvent.hashtags), JSON.stringify(newEvent.weather_values),
        newEvent.verification_status, newEvent.verification_score, newEvent.trust_score, newEvent.ai_confidence,
        newEvent.duplicate_score, newEvent.is_duplicate ? 1 : 0, newEvent.parent_event_id || null, newEvent.created_at, newEvent.updated_at
      ]);

      RealtimeWebSocketService.broadcastEvent(newEvent);

      return res.status(201).json({
        message: 'Citizen report submitted successfully. Report is currently under verification.',
        event_id,
        verification_status: newEvent.verification_status,
        trust_score: newEvent.trust_score,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
