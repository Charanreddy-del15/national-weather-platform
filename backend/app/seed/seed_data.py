"""
Synthetic Seed Data Generator for Indian Weather Events.

Populates initial database with realistic, geographically accurate weather records
across 28 Indian States & 8 Union Territories for testing dashboard, map visualization, and filters.
"""

import asyncio
import datetime
import uuid
import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.app.core.database import AsyncSessionLocal
from backend.app.models.models import WeatherEvent, SourceConnector, HashtagConfig, User
from backend.app.core.security import hash_password

SEED_LOCATIONS = [
    {"state": "Maharashtra", "district": "Mumbai Suburban", "city": "Mumbai", "lat": 19.0760, "lng": 72.8777, "category": "Heavy Rainfall", "sev": 5, "source": "GOVT_API", "text": "Red alert issued for Mumbai. Extremely heavy rainfall of 185mm recorded in 6 hours in Santacruz and Bandra. Train services delayed."},
    {"state": "Kerala", "district": "Wayanad", "city": "Meppadi", "lat": 11.5564, "lng": 76.1320, "category": "Landslide", "sev": 5, "source": "RSS", "text": "Multiple major landslides triggered near Meppadi hills following continuous torrential rain. NDRF teams deployed."},
    {"state": "Tamil Nadu", "district": "Chennai", "city": "Chennai", "lat": 13.0827, "lng": 80.2707, "category": "Flooding", "sev": 4, "source": "PUBLIC_SOCIAL", "text": "Severe waterlogging in Velachery, Tambaram, and Madipakkam following overnight torrential thunderstorms. #ChennaiRains"},
    {"state": "Odisha", "district": "Puri", "city": "Puri", "lat": 19.8135, "lng": 85.8312, "category": "Cyclone", "sev": 5, "source": "GOVT_API", "text": "IMD Bulletin: Severe Cyclonic Storm approaching Odisha coast near Puri with wind speeds of 120-130 kmph."},
    {"state": "Delhi", "district": "New Delhi", "city": "Delhi", "lat": 28.6139, "lng": 77.2090, "category": "Cold Wave", "sev": 3, "source": "GOVT_API", "text": "Severe cold wave conditions persist over Delhi-NCR. Minimum temperature dips to 3.2°C at Safdarjung observatory. Dense fog advisory active."},
    {"state": "Delhi", "district": "North Delhi", "city": "Delhi", "lat": 28.7041, "lng": 77.1025, "category": "Dust Storm", "sev": 3, "source": "PUBLIC_SOCIAL", "text": "Intense dust storm accompanied by squally winds hitting North Delhi. Visibility down to 100 meters. #DelhiDustStorm #IMD"},
    {"state": "Rajasthan", "district": "Churu", "city": "Churu", "lat": 28.2900, "lng": 74.9688, "category": "Heatwave", "sev": 5, "source": "GOVT_API", "text": "Severe heatwave conditions recorded. Maximum temperature spikes to 48.5°C in Churu district. Public advisory issued to avoid afternoon exposure."},
    {"state": "Assam", "district": "Kamrup Metropolitan", "city": "Guwahati", "lat": 26.1445, "lng": 91.7362, "category": "Flash Floods", "sev": 4, "source": "CITIZEN", "text": "Brahmaputra river water level crossing danger mark. Flash flooding reported in Zoo Road and Rajgarh areas of Guwahati."},
    {"state": "West Bengal", "district": "Kolkata", "city": "Kolkata", "lat": 22.5726, "lng": 88.3639, "category": "Thunderstorm", "sev": 3, "source": "RSS", "text": "Nor'wester (Kalbaishakhi) thunderstorm with lightning and gusty winds up to 60 kmph hit Kolkata and Howrah."},
    {"state": "Telangana", "district": "Hyderabad", "city": "Hyderabad", "lat": 17.3850, "lng": 78.4867, "category": "Heavy Rainfall", "sev": 4, "source": "PUBLIC_SOCIAL", "text": "Intense spells of rain over Begumpet, Hitec City, and Kukatpally. Drainage overflow causing traffic slow-down. #HyderabadRains"},
    {"state": "Andhra Pradesh", "district": "Visakhapatnam", "city": "Visakhapatnam", "lat": 17.6868, "lng": 83.2185, "category": "Strong Winds", "sev": 3, "source": "PROVIDER", "text": "Strong gale winds up to 55 kmph along Visakhapatnam coast. Fishermen advised not to venture into deep sea."},
    {"state": "Karnataka", "district": "Bengaluru Urban", "city": "Bengaluru", "lat": 12.9716, "lng": 77.5946, "category": "Hailstorm", "sev": 3, "source": "CITIZEN", "text": "Heavy hailstorm reported in Indiranagar and Whitefield. Hailstones size of golf balls pelting vehicles and roofs."},
    {"state": "Gujarat", "district": "Kutch", "city": "Bhuj", "lat": 23.2420, "lng": 69.6669, "category": "Cyclone", "sev": 4, "source": "GOVT_API", "text": "Deep depression over Arabian Sea moving towards Kutch coast. Heavy rain warning issued for Bhuj and Mandvi."},
    {"state": "Jammu & Kashmir", "district": "Srinagar", "city": "Srinagar", "lat": 34.0837, "lng": 74.7973, "category": "Fog", "sev": 3, "source": "RSS", "text": "Dense fog blanket over Kashmir valley. Flights delayed at Srinagar airport due to low visibility below 50m."},
    {"state": "Himachal Pradesh", "district": "Mandi", "city": "Mandi", "lat": 31.5700, "lng": 76.9200, "category": "Cloudburst", "sev": 5, "source": "CITIZEN", "text": "Cloudburst reported near Mandi valley causing sudden flash floods in local rivulet. Flash flood warning active."}
]


async def seed_initial_database():
    """Populates database with initial seed records if empty."""
    async with AsyncSessionLocal() as db:
        event_count = await db.scalar(select(func.count(WeatherEvent.event_id)))
        if event_count and event_count > 0:
            return  # Already seeded

        print("[Seed] Populating database with realistic Indian weather events...")

        # 1. Seed Default Users
        users = [
            User(id="usr_admin_01", email="admin@weather.gov.in", name="Director General (Weather Intel)", hashed_password=hash_password("admin123"), role="Super Admin"),
            User(id="usr_verifier_01", email="verifier@weather.gov.in", name="Senior Verifier", hashed_password=hash_password("verifier123"), role="Verifier"),
            User(id="usr_analyst_01", email="analyst@weather.gov.in", name="Met Analyst", hashed_password=hash_password("analyst123"), role="Analyst")
        ]
        db.add_all(users)

        # 2. Seed Sources
        sources = [
            SourceConnector(source_id="src_govt_weather_api", source_name="Open-Meteo & IMD Telemetry", source_type="GOVT_API", polling_interval_sec=300, is_active=True, health_status="HEALTHY", reliability_score=0.96),
            SourceConnector(source_id="src_imd_rss_feed", source_name="IMD Official RSS Bulletin Feed", source_type="RSS", polling_interval_sec=600, is_active=True, health_status="HEALTHY", reliability_score=0.92),
            SourceConnector(source_id="src_public_social_hashtag", source_name="Public Social Media Stream", source_type="PUBLIC_SOCIAL", polling_interval_sec=120, is_active=True, health_status="HEALTHY", reliability_score=0.75),
            SourceConnector(source_id="src_citizen_portal", source_name="National Citizen Reporting Portal", source_type="CITIZEN", polling_interval_sec=0, is_active=True, health_status="HEALTHY", reliability_score=0.68)
        ]
        db.add_all(sources)

        # 3. Seed Hashtags
        hashtags = [
            HashtagConfig(hashtag="#IMD", category_mapping="Official"),
            HashtagConfig(hashtag="#Rain", category_mapping="Rainfall"),
            HashtagConfig(hashtag="#HeavyRain", category_mapping="Heavy Rainfall"),
            HashtagConfig(hashtag="#Flood", category_mapping="Flooding"),
            HashtagConfig(hashtag="#Cyclone", category_mapping="Cyclone"),
            HashtagConfig(hashtag="#Heatwave", category_mapping="Heatwave"),
            HashtagConfig(hashtag="#DustStorm", category_mapping="Dust Storm")
        ]
        db.add_all(hashtags)

        # 4. Seed Weather Events
        now = datetime.datetime.utcnow()
        statuses = ["VERIFIED", "VERIFIED", "UNDER_REVIEW", "UNVERIFIED", "FLAGGED"]

        for idx, item in enumerate(SEED_LOCATIONS):
            status_val = statuses[idx % len(statuses)]
            t_offset = random.randint(1, 48)
            evt_time = now - datetime.timedelta(hours=t_offset)

            trust_score = 0.95 if status_val == "VERIFIED" else (0.65 if status_val == "UNDER_REVIEW" else 0.40)

            evt = WeatherEvent(
                event_id=f"evt_in_{idx+1001}",
                source_id=f"src_{item['source'].lower()}",
                source_type=item["source"],
                source_name=f"India Weather Stream ({item['source']})",
                raw_text=item["text"],
                event_category=item["category"],
                severity=item["sev"],
                country="India",
                state=item["state"],
                district=item["district"],
                city=item["city"],
                latitude=item["lat"],
                longitude=item["lng"],
                location_confidence=0.92,
                verification_status=status_val,
                trust_score=trust_score,
                ai_confidence=0.88,
                is_duplicate=False,
                timestamp=evt_time,
                created_at=evt_time
            )
            db.add(evt)

        await db.commit()
        print("[Seed] Successfully seeded Indian weather dataset.")
