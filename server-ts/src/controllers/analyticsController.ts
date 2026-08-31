import { Request, Response } from 'express';
import { query } from '../db/database';

export class AnalyticsController {
  public static async getTimeline(req: Request, res: Response) {
    try {
      const rows = await query<{ date: string; count: number; heavy_rain: number; flood: number; thunderstorm: number }>(`
        SELECT 
          substr(timestamp, 1, 10) as date,
          COUNT(*) as count,
          SUM(CASE WHEN event_category IN ('RAINFALL', 'HEAVY_RAINFALL') THEN 1 ELSE 0 END) as heavy_rain,
          SUM(CASE WHEN event_category IN ('FLOOD', 'FLASH_FLOOD') THEN 1 ELSE 0 END) as flood,
          SUM(CASE WHEN event_category IN ('THUNDERSTORM', 'LIGHTNING') THEN 1 ELSE 0 END) as thunderstorm
        FROM weather_events 
        GROUP BY substr(timestamp, 1, 10)
        ORDER BY date ASC 
        LIMIT 30
      `);

      return res.json({ timeline: rows });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getGeographic(req: Request, res: Response) {
    try {
      const stateRows = await query<{ state: string; count: number; avg_severity: number }>(`
        SELECT state, COUNT(*) as count, ROUND(AVG(severity), 2) as avg_severity
        FROM weather_events 
        GROUP BY state 
        ORDER BY count DESC
      `);

      const districtRows = await query<{ district: string; state: string; count: number }>(`
        SELECT district, state, COUNT(*) as count 
        FROM weather_events 
        GROUP BY district, state 
        ORDER BY count DESC 
        LIMIT 15
      `);

      return res.json({
        state_analytics: stateRows,
        district_analytics: districtRows,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getEventsDistribution(req: Request, res: Response) {
    try {
      const categoryRows = await query<{ category: string; count: number }>(`
        SELECT event_category as category, COUNT(*) as count 
        FROM weather_events 
        GROUP BY event_category 
        ORDER BY count DESC
      `);

      const severityRows = await query<{ range: string; count: number }>(`
        SELECT 
          CASE 
            WHEN severity >= 0.8 THEN 'CRITICAL (0.8-1.0)'
            WHEN severity >= 0.6 THEN 'HIGH (0.6-0.8)'
            WHEN severity >= 0.4 THEN 'MODERATE (0.4-0.6)'
            ELSE 'LOW (0.0-0.4)'
          END as range,
          COUNT(*) as count
        FROM weather_events
        GROUP BY range
      `);

      return res.json({
        categories: categoryRows,
        severity_distribution: severityRows,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getVerification(req: Request, res: Response) {
    try {
      const statusRows = await query<{ status: string; count: number }>(`
        SELECT verification_status as status, COUNT(*) as count 
        FROM weather_events 
        GROUP BY verification_status
      `);

      const scoreRows = await query<{ avg_trust: number; avg_verification: number; duplicate_pct: number }>(`
        SELECT 
          ROUND(AVG(trust_score), 1) as avg_trust,
          ROUND(AVG(verification_score), 1) as avg_verification,
          ROUND(SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as duplicate_pct
        FROM weather_events
      `);

      return res.json({
        status_breakdown: statusRows,
        metrics: scoreRows[0] || { avg_trust: 0, avg_verification: 0, duplicate_pct: 0 },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async getSourceAnalytics(req: Request, res: Response) {
    try {
      const rows = await query<{ source_type: string; count: number; avg_trust: number }>(`
        SELECT source_type, COUNT(*) as count, ROUND(AVG(trust_score), 1) as avg_trust
        FROM weather_events 
        GROUP BY source_type 
        ORDER BY count DESC
      `);

      return res.json({ source_analytics: rows });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
