export type VerificationStatus = 
  | 'UNVERIFIED' 
  | 'UNDER_REVIEW' 
  | 'VERIFIED' 
  | 'REJECTED' 
  | 'FLAGGED' 
  | 'DUPLICATE';

export type SourceType = 
  | 'GOVT_API' 
  | 'RSS' 
  | 'PUBLIC_SOCIAL' 
  | 'CITIZEN' 
  | 'PROVIDER';

export type WeatherCategory = 
  | 'Heavy Rainfall'
  | 'Rainfall'
  | 'Thunderstorm'
  | 'Lightning'
  | 'Flooding'
  | 'Flash Floods'
  | 'Cyclone'
  | 'Heatwave'
  | 'Cold Wave'
  | 'Fog'
  | 'Dust Storm'
  | 'Strong Winds'
  | 'Hailstorm'
  | 'Landslide'
  | 'Cloudburst'
  | 'Extreme Weather'
  | 'Other';

export interface WeatherEvent {
  event_id: string;
  source_id: string;
  source_type: SourceType;
  source_name?: string;
  source_url?: string;
  author_name?: string;
  timestamp: string;
  raw_text: string;
  event_category: WeatherCategory;
  severity: number; // 1 to 5
  country: string;
  state: string;
  district: string;
  city?: string;
  latitude: number;
  longitude: number;
  location_confidence: number;
  media_url?: string;
  hashtags: string[];
  weather_values?: Record<string, any>;
  verification_status: VerificationStatus;
  trust_score: number;
  ai_confidence: number;
  is_duplicate: boolean;
  duplicate_score: number;
  parent_event_id?: string;
  created_at: string;
}

export interface KPISummary {
  total_reports: number;
  reports_today: number;
  verified_reports: number;
  unverified_reports: number;
  flagged_reports: number;
  active_weather_events: number;
  high_severity_events: number;
  online_sources: number;
  ingestion_rate_per_min: number;
  average_trust_score: number;
}

export interface FilterState {
  dateRange: 'today' | 'yesterday' | '7d' | '30d' | 'all';
  category: string;
  state: string;
  district: string;
  verificationStatus: string;
  sourceType: string;
  searchQuery: string;
}

export interface SourceConnector {
  source_id: string;
  source_name: string;
  source_type: SourceType;
  endpoint_url?: string;
  polling_interval_sec: number;
  is_active: boolean;
  health_status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  reliability_score: number;
  last_fetched_at: string;
}

export interface AuditLogItem {
  audit_id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  ip_address: string;
  timestamp: string;
}
