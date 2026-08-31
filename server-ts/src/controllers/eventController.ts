import { Request, Response } from 'express';
import { query, run } from '../db/database';
import { WeatherEvent, EventFilterQuery } from '../types';
import { AuthRequest } from '../middleware/auth';
import { DeduplicationService } from '../services/deduplicator';

export class EventController {
  public static async getEvents(req: Request, res: Response) {
    try {
      const {
        startDate,
        endDate,
        eventCategory,
        state,
        district,
        city,
        verificationStatus,
        sourceType,
        minSeverity,
        search,
        limit = 50,
        offset = 0,
      } = req.query as any;

      let conditions: string[] = [];
      let params: any[] = [];

      if (startDate) {
        conditions.push(`timestamp >= ?`);
        params.push(startDate);
      }
      if (endDate) {
        conditions.push(`timestamp <= ?`);
        params.push(endDate);
      }
      if (eventCategory && eventCategory !== 'ALL') {
        conditions.push(`event_category = ?`);
        params.push(eventCategory);
      }
      if (state && state !== 'ALL') {
        conditions.push(`state = ?`);
        params.push(state);
      }
      if (district && district !== 'ALL') {
        conditions.push(`district = ?`);
        params.push(district);
      }
      if (city) {
        conditions.push(`city LIKE ?`);
        params.push(`%${city}%`);
      }
      if (verificationStatus && verificationStatus !== 'ALL') {
        conditions.push(`verification_status = ?`);
        params.push(verificationStatus);
      }
      if (sourceType && sourceType !== 'ALL') {
        conditions.push(`source_type = ?`);
        params.push(sourceType);
      }
      if (minSeverity) {
        conditions.push(`severity >= ?`);
        params.push(parseFloat(minSeverity));
      }
      if (search) {
        conditions.push(`(raw_text LIKE ? OR city LIKE ? OR district LIKE ? OR state LIKE ? OR hashtags LIKE ?)`);
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = await query<{ count: number }>(`SELECT COUNT(*) as count FROM weather_events ${whereClause}`, params);
      const total = countResult[0]?.count || 0;

      const sql = `
        SELECT * FROM weather_events 
        ${whereClause} 
        ORDER BY timestamp DESC 
        LIMIT ? OFFSET ?
      `;
      params.push(Number(limit), Number(offset));

      const rows = await query<WeatherEvent>(sql, params);
      const formatted = rows.map((r) => ({
        ...r,
        is_duplicate: Boolean(r.is_duplicate),
        hashtags: typeof r.hashtags === 'string' ? JSON.parse(r.hashtags) : r.hashtags,
        weather_values: typeof r.weather_values === 'string' ? JSON.parse(r.weather_values) : r.weather_values,
      }));

      return res.json({
        total,
        limit: Number(limit),
        offset: Number(offset),
        events: formatted,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getMapEvents(req: Request, res: Response) {
    try {
      const { state, eventCategory, verificationStatus } = req.query as any;

      let conditions: string[] = [];
      let params: any[] = [];

      if (state && state !== 'ALL') {
        conditions.push(`state = ?`);
        params.push(state);
      }
      if (eventCategory && eventCategory !== 'ALL') {
        conditions.push(`event_category = ?`);
        params.push(eventCategory);
      }
      if (verificationStatus && verificationStatus !== 'ALL') {
        conditions.push(`verification_status = ?`);
        params.push(verificationStatus);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const sql = `
        SELECT event_id, event_category, severity, state, district, city, latitude, longitude, verification_status, trust_score, raw_text, timestamp, media_type
        FROM weather_events 
        ${whereClause} 
        ORDER BY timestamp DESC 
        LIMIT 500
      `;

      const rows = await query<any>(sql, params);
      return res.json({ mapEvents: rows });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getStats(req: Request, res: Response) {
    try {
      const totalResult = await query<{ count: number }>(`SELECT COUNT(*) as count FROM weather_events`);
      const todayResult = await query<{ count: number }>(`SELECT COUNT(*) as count FROM weather_events WHERE timestamp >= date('now')`);
      const verifiedResult = await query<{ count: number }>(`SELECT COUNT(*) as count FROM weather_events WHERE verification_status = 'VERIFIED'`);
      const unverifiedResult = await query<{ count: number }>(`SELECT COUNT(*) as count FROM weather_events WHERE verification_status = 'UNVERIFIED'`);
      const flaggedResult = await query<{ count: number }>(`SELECT COUNT(*) as count FROM weather_events WHERE verification_status = 'FLAGGED'`);
      const highSeverityResult = await query<{ count: number }>(`SELECT COUNT(*) as count FROM weather_events WHERE severity >= 0.75`);
      const duplicateResult = await query<{ count: number }>(`SELECT COUNT(*) as count FROM weather_events WHERE is_duplicate = 1`);
      const sourcesOnlineResult = await query<{ count: number }>(`SELECT COUNT(*) as count FROM sources WHERE is_active = 1`);

      return res.json({
        total_reports: totalResult[0]?.count || 0,
        reports_today: todayResult[0]?.count || 0,
        verified_reports: verifiedResult[0]?.count || 0,
        unverified_reports: unverifiedResult[0]?.count || 0,
        flagged_reports: flaggedResult[0]?.count || 0,
        high_severity_events: highSeverityResult[0]?.count || 0,
        duplicate_reports: duplicateResult[0]?.count || 0,
        sources_online: sourcesOnlineResult[0]?.count || 0,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rows = await query<WeatherEvent>(`SELECT * FROM weather_events WHERE event_id = ?`, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Weather event not found.' });
      }

      const event = rows[0];
      const parsedEvent = {
        ...event,
        is_duplicate: Boolean(event.is_duplicate),
        hashtags: typeof event.hashtags === 'string' ? JSON.parse(event.hashtags) : event.hashtags,
        weather_values: typeof event.weather_values === 'string' ? JSON.parse(event.weather_values) : event.weather_values,
      };

      // Nearby reports within 50km
      const allRows = await query<WeatherEvent>(`SELECT * FROM weather_events WHERE event_id != ? LIMIT 100`, [id]);
      const nearby = allRows
        .filter((r) => DeduplicationService.haversineKm(event.latitude, event.longitude, r.latitude, r.longitude) <= 50)
        .slice(0, 5)
        .map((r) => ({
          ...r,
          hashtags: typeof r.hashtags === 'string' ? JSON.parse(r.hashtags) : r.hashtags,
          weather_values: typeof r.weather_values === 'string' ? JSON.parse(r.weather_values) : r.weather_values,
        }));

      return res.json({
        event: parsedEvent,
        nearby_reports: nearby,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async updateEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { verification_status, event_category, severity, notes } = req.body;

      const existing = await query<WeatherEvent>(`SELECT * FROM weather_events WHERE event_id = ?`, [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Event not found.' });
      }

      const oldEvt = existing[0];
      const now = new Date().toISOString();

      await run(`
        UPDATE weather_events 
        SET verification_status = COALESCE(?, verification_status),
            event_category = COALESCE(?, event_category),
            severity = COALESCE(?, severity),
            updated_at = ?
        WHERE event_id = ?
      `, [verification_status, event_category, severity, now, id]);

      // Record Audit Log
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await run(`
        INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, old_value, new_value, ip_address, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        auditId,
        req.user?.id || 'admin_sys',
        req.user?.full_name || 'System Admin',
        'UPDATE_EVENT_VERIFICATION',
        'WEATHER_EVENT',
        id,
        JSON.stringify({ status: oldEvt.verification_status, category: oldEvt.event_category }),
        JSON.stringify({ status: verification_status, category: event_category, notes }),
        req.ip || '127.0.0.1',
        now,
      ]);

      const updated = await query<WeatherEvent>(`SELECT * FROM weather_events WHERE event_id = ?`, [id]);
      return res.json({ message: 'Event updated successfully.', event: updated[0] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
