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
  location_confidence: number; // 0.0 to 1.0
  
  media_type: 'IMAGE' | 'VIDEO' | 'NONE';
  media_url?: string;
  hashtags: string[];
  
  weather_values: WeatherValues;
  
  verification_status: VerificationStatus;
  verification_score: number; // 0 to 100
  trust_score: number; // 0 to 100
  
  ai_confidence: number; // 0.0 to 1.0
  duplicate_score: number; // 0.0 to 1.0
  is_duplicate: boolean;
  parent_event_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface DataSource {
  id: string;
  name: string;
  source_type: SourceType;
  endpoint_url: string;
  polling_interval_sec: number;
  is_active: boolean;
  reliability_score: number; // 0 to 100
  total_reports_fetched: number;
  last_polled_at?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: string;
  new_value?: string;
  ip_address: string;
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  event_id?: string;
  state: string;
  is_acknowledged: boolean;
  created_at: string;
}

export interface EventFilterQuery {
  startDate?: string;
  endDate?: string;
  eventCategory?: string;
  state?: string;
  district?: string;
  city?: string;
  verificationStatus?: string;
  sourceType?: string;
  minSeverity?: number;
  search?: string;
  limit?: number;
  offset?: number;
  bbox?: string; // minLng,minLat,maxLng,maxLat
}
