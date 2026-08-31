-- Enable PostGIS extensions for spatial weather data queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Create Schema
CREATE SCHEMA IF NOT EXISTS nwdap;

-- Verify PostGIS installation
SELECT PostGIS_Full_Version();
