import { TrustEngineService } from '../services/trustEngine';

describe('Trust & Verification Engine', () => {
  test('Assigns high trust and VERIFIED status to government IMD alerts', () => {
    const result = TrustEngineService.evaluateTrust({
      source_type: 'GOVERNMENT',
      source_reliability: 98,
      location_confidence: 0.95,
      timestamp_age_hours: 0.5,
      cross_source_count: 3,
      ai_confidence: 0.94,
      is_duplicate: false,
      duplicate_score: 0.0,
    });

    expect(result.trust_score).toBeGreaterThanOrEqual(85);
    expect(result.recommended_status).toBe('VERIFIED');
  });

  test('Penalizes duplicate reports and assigns DUPLICATE status', () => {
    const result = TrustEngineService.evaluateTrust({
      source_type: 'SOCIAL_MEDIA',
      source_reliability: 60,
      location_confidence: 0.8,
      timestamp_age_hours: 1,
      cross_source_count: 0,
      ai_confidence: 0.8,
      is_duplicate: true,
      duplicate_score: 0.9,
    });

    expect(result.recommended_status).toBe('DUPLICATE');
    expect(result.score_breakdown.duplicate_penalty).toBeGreaterThan(0);
  });
});
