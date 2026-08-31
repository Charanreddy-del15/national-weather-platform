import { EventCategory } from '../types';

export interface ClassificationResult {
  category: EventCategory;
  subcategory: string;
  severity: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  extracted_keywords: string[];
}

const CATEGORY_KEYWORDS: Record<EventCategory, { keywords: string[]; baseSeverity: number }> = {
  CYCLONE: {
    keywords: ['cyclone', 'typhoon', 'storm surge', 'depresssion', 'gale force', 'super cyclone', 'landfall', 'cyclonic'],
    baseSeverity: 0.95,
  },
  CLOUDBURST: {
    keywords: ['cloudburst', 'flash deluge', 'torrential downpour', 'extreme rainfall rate', 'sudden intense rain'],
    baseSeverity: 0.90,
  },
  FLASH_FLOOD: {
    keywords: ['flash flood', 'sudden flooding', 'river overflow', 'dam release', 'washed away', 'rapid inundation'],
    baseSeverity: 0.88,
  },
  FLOOD: {
    keywords: ['flood', 'flooding', 'waterlogging', 'submerged', 'inundation', 'water level rising', 'submerged roads'],
    baseSeverity: 0.75,
  },
  LANDSLIDE: {
    keywords: ['landslide', 'mudslide', 'debris flow', 'hill collapse', 'rockfall', 'road blocked landslide'],
    baseSeverity: 0.85,
  },
  HEAVY_RAINFALL: {
    keywords: ['heavy rain', 'heavy rainfall', 'torrential rain', 'incessant rain', 'downpour', 'heavy monsoon rain', 'red alert rain'],
    baseSeverity: 0.70,
  },
  THUNDERSTORM: {
    keywords: ['thunderstorm', 'thunder', 'lightning storm', 'squall', 'gale', 'dark clouds', 'severe storm'],
    baseSeverity: 0.65,
  },
  LIGHTNING: {
    keywords: ['lightning strike', 'thunderbolt', 'lightning', 'thunder bolt', 'electrical storm', 'thunderclap'],
    baseSeverity: 0.70,
  },
  HAILSTORM: {
    keywords: ['hail', 'hailstorm', 'hailstones', 'ice pellets', 'crop damage hail'],
    baseSeverity: 0.65,
  },
  HEATWAVE: {
    keywords: ['heatwave', 'heat wave', 'extreme heat', 'sunstroke', 'loo', 'high temperature', 'mercury crosses', 'scorching'],
    baseSeverity: 0.75,
  },
  COLD_WAVE: {
    keywords: ['cold wave', 'coldwave', 'severe cold', 'frost', 'freeze', 'freezing temperature', 'chill wave'],
    baseSeverity: 0.65,
  },
  DUST_STORM: {
    keywords: ['dust storm', 'duststorm', 'sandstorm', 'andhi', 'blinding dust'],
    baseSeverity: 0.60,
  },
  STRONG_WINDS: {
    keywords: ['strong winds', 'high winds', 'gusty winds', 'stormy winds', 'trees uprooted', 'uprooted poles'],
    baseSeverity: 0.60,
  },
  FOG: {
    keywords: ['dense fog', 'thick fog', 'zero visibility', 'smog', 'visibility reduced', 'foggy conditions'],
    baseSeverity: 0.50,
  },
  RAINFALL: {
    keywords: ['rain', 'rainfall', 'light rain', 'drizzle', 'showers', 'monsoon showers', 'wet weather'],
    baseSeverity: 0.35,
  },
  EXTREME_WEATHER: {
    keywords: ['extreme weather', 'unusual weather', 'severe anomaly', 'freak storm'],
    baseSeverity: 0.80,
  },
  OTHER: {
    keywords: ['weather', 'forecast', 'climate', 'temperature', 'humidity'],
    baseSeverity: 0.20,
  },
};

export class AIClassifierService {
  /**
   * Classifies text into a weather category, computes severity & confidence.
   * Can be configured to delegate to HuggingFace or custom Transformer microservices.
   */
  public static classifyText(text: string, weatherValues?: any): ClassificationResult {
    const normalized = text.toLowerCase();
    let bestCategory: EventCategory = 'OTHER';
    let maxMatchCount = 0;
    let matchedKeywords: string[] = [];
    let highestWeight = 0;

    for (const [cat, info] of Object.entries(CATEGORY_KEYWORDS)) {
      const matches = info.keywords.filter((kw) => normalized.includes(kw));
      if (matches.length > maxMatchCount || (matches.length === maxMatchCount && matches.length > 0 && info.baseSeverity > highestWeight)) {
        maxMatchCount = matches.length;
        bestCategory = cat as EventCategory;
        matchedKeywords = matches;
        highestWeight = info.baseSeverity;
      }
    }

    // Dynamic severity scaling based on keywords + physical measurements
    let severity = CATEGORY_KEYWORDS[bestCategory]?.baseSeverity || 0.3;
    
    if (normalized.includes('red alert') || normalized.includes('severe') || normalized.includes('devastating') || normalized.includes('uprooted')) {
      severity = Math.min(1.0, severity + 0.15);
    }
    if (normalized.includes('orange alert') || normalized.includes('moderate')) {
      severity = Math.min(1.0, severity + 0.05);
    }

    // Numeric weather override adjustments
    if (weatherValues) {
      if (weatherValues.rainfall_mm && weatherValues.rainfall_mm > 100) {
        severity = Math.max(severity, 0.85);
        if (bestCategory === 'RAINFALL') bestCategory = 'HEAVY_RAINFALL';
      }
      if (weatherValues.wind_speed_kmh && weatherValues.wind_speed_kmh > 80) {
        severity = Math.max(severity, 0.80);
      }
      if (weatherValues.temperature_c && weatherValues.temperature_c > 44) {
        severity = Math.max(severity, 0.85);
        bestCategory = 'HEATWAVE';
      }
    }

    const confidence = maxMatchCount > 0 
      ? Math.min(0.98, 0.65 + maxMatchCount * 0.1) 
      : 0.45;

    return {
      category: bestCategory,
      subcategory: matchedKeywords[0] || 'general',
      severity: Math.round(severity * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      extracted_keywords: matchedKeywords,
    };
  }
}
