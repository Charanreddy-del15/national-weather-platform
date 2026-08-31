export type EventCategory = 
  | 'RAINFALL'
  | 'HEAVY_RAINFALL'
  | 'THUNDERSTORM'
  | 'LIGHTNING'
  | 'FLOOD'
  | 'FLASH_FLOOD'
  | 'CYCLONE'
  | 'HEATWAVE'
  | 'COLD_WAVE'
  | 'FOG'
  | 'DUST_STORM'
  | 'STRONG_WINDS'
  | 'HAILSTORM'
  | 'LANDSLIDE'
  | 'CLOUDBURST'
  | 'EXTREME_WEATHER'
  | 'OTHER';

export type SourceType = 'GOVERNMENT' | 'PUBLIC_API' | 'RSS_FEED' | 'SOCIAL_MEDIA' | 'CITIZEN_REPORT';

export type VerificationStatus = 'UNVERIFIED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'FLAGGED' | 'DUPLICATE';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'ANALYST' | 'VERIFIER' | 'CITIZEN';

export interface WeatherValues {
  rainfall_mm?: number;
  temperature_c?: number;
  wind_speed_kmh?: number;
  wind_direction_deg?: number;
  humidity_percent?: number;
  pressure_hpa?: number;
}

export interface WeatherEvent {
  event_id: string;
  source_id: string;
  source_type: SourceType;
  source_url?: string;
  author_name: string;
  timestamp: string;
  ingestion_timestamp: string;
  
  raw_text: string;
  normalized_text: string;
  
  event_category: EventCategory;
  event_subcategory?: string;
  severity: number; // 0.0 to 1.0
  
  country: string;
  state: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  location_confidence: number;
  
  media_type: 'IMAGE' | 'VIDEO' | 'NONE';
  media_url?: string;
  hashtags: string[];
  
  weather_values: WeatherValues;
  
  verification_status: VerificationStatus;
  verification_score: number;
  trust_score: number;
  
  ai_confidence: number;
  duplicate_score: number;
  is_duplicate: boolean;
  parent_event_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SystemStats {
  total_reports: number;
  reports_today: number;
  verified_reports: number;
  unverified_reports: number;
  flagged_reports: number;
  high_severity_events: number;
  duplicate_reports: number;
  sources_online: number;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  eventCategory: string;
  state: string;
  district: string;
  verificationStatus: string;
  sourceType: string;
  minSeverity: number;
  search: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}
