import { SourceType, VerificationStatus } from '../types';

export interface TrustScoreInput {
  source_type: SourceType;
  source_reliability: number; // 0 to 100
  location_confidence: number; // 0.0 to 1.0
  timestamp_age_hours: number;
  cross_source_count: number;
  ai_confidence: number; // 0.0 to 1.0
  is_duplicate: boolean;
  duplicate_score: number; // 0.0 to 1.0
}

export interface TrustEvaluationResult {
  trust_score: number; // 0 to 100
  verification_score: number; // 0 to 100
  recommended_status: VerificationStatus;
  score_breakdown: {
    source_component: number;
    location_component: number;
    timestamp_component: number;
    cross_source_component: number;
    ai_component: number;
    duplicate_penalty: number;
  };
}

export class TrustEngineService {
  /**
   * Calculates a weighted Trust Score (0-100) and Verification Status based on multi-factor signals.
   */
  public static evaluateTrust(input: TrustScoreInput): TrustEvaluationResult {
    // 1. Source Reliability (Weight 30%)
    let sourceTypeWeight = 80;
    if (input.source_type === 'GOVERNMENT') sourceTypeWeight = 98;
    else if (input.source_type === 'PUBLIC_API') sourceTypeWeight = 90;
    else if (input.source_type === 'RSS_FEED') sourceTypeWeight = 85;
    else if (input.source_type === 'SOCIAL_MEDIA') sourceTypeWeight = 65;
    else if (input.source_type === 'CITIZEN_REPORT') sourceTypeWeight = 60;

    const sourceScore = (sourceTypeWeight * 0.6) + (input.source_reliability * 0.4);
    const sourceComponent = sourceScore * 0.30;

    // 2. Location Confidence (Weight 20%)
    const locationComponent = (input.location_confidence * 100) * 0.20;

    // 3. Timestamp Freshness & Consistency (Weight 15%)
    let timestampFreshness = 100;
    if (input.timestamp_age_hours > 72) timestampFreshness = 50;
    else if (input.timestamp_age_hours > 24) timestampFreshness = 75;
    else if (input.timestamp_age_hours > 6) timestampFreshness = 90;

    const timestampComponent = timestampFreshness * 0.15;

    // 4. Cross-Source Confirmation (Weight 15%)
    // Each additional independent report boosts confidence up to 4 sources
    const crossSourceScore = Math.min(100, 40 + input.cross_source_count * 20);
    const crossSourceComponent = crossSourceScore * 0.15;

    // 5. AI Classifier Confidence (Weight 20%)
    const aiComponent = (input.ai_confidence * 100) * 0.20;

    // 6. Duplicate Penalty
    const duplicatePenalty = input.is_duplicate ? (input.duplicate_score * 30) : 0;

    // Calculate raw trust score
    let rawScore = sourceComponent + locationComponent + timestampComponent + crossSourceComponent + aiComponent - duplicatePenalty;
    const finalTrustScore = Math.max(0, Math.min(100, Math.round(rawScore * 10) / 10));

    // Verification Score computation
    const verificationScore = Math.round(finalTrustScore);

    // Determine Status
    let recommendedStatus: VerificationStatus = 'UNVERIFIED';
    if (input.is_duplicate) {
      recommendedStatus = 'DUPLICATE';
    } else if (input.source_type === 'GOVERNMENT' && finalTrustScore >= 85) {
      recommendedStatus = 'VERIFIED';
    } else if (finalTrustScore >= 82) {
      recommendedStatus = 'VERIFIED';
    } else if (finalTrustScore >= 60) {
      recommendedStatus = 'UNDER_REVIEW';
    } else if (finalTrustScore < 35) {
      recommendedStatus = 'FLAGGED';
    } else {
      recommendedStatus = 'UNVERIFIED';
    }

    return {
      trust_score: finalTrustScore,
      verification_score: verificationScore,
      recommended_status: recommendedStatus,
      score_breakdown: {
        source_component: Math.round(sourceComponent * 10) / 10,
        location_component: Math.round(locationComponent * 10) / 10,
        timestamp_component: Math.round(timestampComponent * 10) / 10,
        cross_source_component: Math.round(crossSourceComponent * 10) / 10,
        ai_component: Math.round(aiComponent * 10) / 10,
        duplicate_penalty: Math.round(duplicatePenalty * 10) / 10,
      },
    };
  }
}
