import { WeatherEvent } from '../types';

export interface DeduplicationResult {
  is_duplicate: boolean;
  duplicate_score: number; // 0.0 to 1.0
  parent_event_id?: string;
}

export class DeduplicationService {
  /**
   * Calculates Haversine distance in kilometers between two coordinates.
   */
  public static haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Computes simple Jaccard / Cosine token similarity between two text strings.
   */
  public static computeTextSimilarity(text1: string, text2: string): number {
    const tokenize = (t: string) =>
      new Set(
        t
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 2)
      );

    const set1 = tokenize(text1);
    const set2 = tokenize(text2);

    if (set1.size === 0 || set2.size === 0) return 0;

    let intersectionCount = 0;
    set1.forEach((token) => {
      if (set2.has(token)) intersectionCount++;
    });

    const unionCount = new Set([...Array.from(set1), ...Array.from(set2)]).size;
    return intersectionCount / unionCount;
  }

  /**
   * Checks candidate event against an existing pool of weather events to detect duplicates.
   */
  public static findDuplicate(
    candidate: Partial<WeatherEvent>,
    existingEvents: WeatherEvent[]
  ): DeduplicationResult {
    let highestDuplicateScore = 0;
    let matchedParentId: string | undefined = undefined;

    if (!candidate.latitude || !candidate.longitude || !candidate.normalized_text) {
      return { is_duplicate: false, duplicate_score: 0 };
    }

    const candidateTime = candidate.timestamp ? new Date(candidate.timestamp).getTime() : Date.now();

    for (const existing of existingEvents) {
      // Skip comparing against itself
      if (candidate.event_id && candidate.event_id === existing.event_id) continue;

      // 1. Spatial proximity (Km)
      const distanceKm = this.haversineKm(
        candidate.latitude,
        candidate.longitude,
        existing.latitude,
        existing.longitude
      );

      // 2. Temporal proximity (Hours)
      const existingTime = new Date(existing.timestamp).getTime();
      const timeDeltaHours = Math.abs(candidateTime - existingTime) / (1000 * 60 * 60);

      // 3. Text Similarity (0.0 to 1.0)
      const textSimilarity = this.computeTextSimilarity(
        candidate.normalized_text,
        existing.normalized_text
      );

      // 4. Category match
      const categoryMatch = candidate.event_category === existing.event_category ? 1.0 : 0.5;

      // Evaluate spatial-temporal clustering score
      if (distanceKm <= 20 && timeDeltaHours <= 4) {
        const spatialScore = Math.max(0, 1 - distanceKm / 20);
        const temporalScore = Math.max(0, 1 - timeDeltaHours / 4);

        const compositeScore =
          textSimilarity * 0.45 +
          spatialScore * 0.25 +
          temporalScore * 0.15 +
          categoryMatch * 0.15;

        if (compositeScore > highestDuplicateScore) {
          highestDuplicateScore = compositeScore;
          matchedParentId = existing.is_duplicate && existing.parent_event_id 
            ? existing.parent_event_id 
            : existing.event_id;
        }
      }
    }

    const roundedScore = Math.round(highestDuplicateScore * 100) / 100;
    const isDuplicate = roundedScore >= 0.72;

    return {
      is_duplicate: isDuplicate,
      duplicate_score: roundedScore,
      parent_event_id: isDuplicate ? matchedParentId : undefined,
    };
  }
}
