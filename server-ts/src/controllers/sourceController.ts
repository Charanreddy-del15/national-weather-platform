import { Request, Response } from 'express';
import { query, run } from '../db/database';
import { DataSource } from '../types';
import { WeatherApiConnector } from '../connectors';

export class SourceController {
  public static async getSources(req: Request, res: Response) {
    try {
      const sources = await query<DataSource>(`SELECT * FROM sources ORDER BY created_at DESC`);
      return res.json({ sources });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async addSource(req: Request, res: Response) {
    try {
      const { name, source_type, endpoint_url, polling_interval_sec = 300 } = req.body;
      if (!name || !source_type || !endpoint_url) {
        return res.status(400).json({ error: 'Name, source_type, and endpoint_url are required.' });
      }

      const id = `src_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      await run(`
        INSERT INTO sources (id, name, source_type, endpoint_url, polling_interval_sec, is_active, reliability_score, total_reports_fetched, created_at)
        VALUES (?, ?, ?, ?, ?, 1, 90.0, 0, ?)
      `, [id, name, source_type, endpoint_url, polling_interval_sec, now]);

      const created = await query<DataSource>(`SELECT * FROM sources WHERE id = ?`, [id]);
      return res.status(201).json({ message: 'Data source added successfully.', source: created[0] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async toggleSource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      await run(`UPDATE sources SET is_active = ? WHERE id = ?`, [is_active ? 1 : 0, id]);
      return res.json({ message: `Source status updated to ${is_active ? 'active' : 'disabled'}.` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async triggerPoll(req: Request, res: Response) {
    try {
      const connector = new WeatherApiConnector();
      const rawItems = await connector.fetch();
      const published = [];

      for (const item of rawItems) {
        const norm = connector.normalize(item);
        if (connector.validate(norm)) {
          const pub = await connector.publish(norm);
          published.push(pub);
        }
      }

      return res.json({
        message: `Polled connector successfully. Ingested ${published.length} reports.`,
        events: published,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
