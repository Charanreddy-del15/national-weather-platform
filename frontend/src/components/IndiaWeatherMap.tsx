import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { WeatherEvent } from '../types/weather';
import { Shield, AlertCircle, Calendar, MapPin, Tag } from 'lucide-react';

// Fix default leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface IndiaWeatherMapProps {
  events: WeatherEvent[];
  onSelectEvent: (event: WeatherEvent) => void;
}

export const IndiaWeatherMap: React.FC<IndiaWeatherMapProps> = ({ events, onSelectEvent }) => {
  // Center map on India (20.5937° N, 78.9629° E)
  const center: [number, number] = [22.5937, 78.9629];
  const zoom = 5;

  const getMarkerColor = (severity: number, category: string) => {
    if (severity >= 5) return '#ef4444'; // Red
    if (severity >= 4) return '#f97316'; // Orange
    if (severity >= 3) return '#eab308'; // Yellow
    return '#3b82f6'; // Blue
  };

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0 bg-slate-950"
      >
        <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
/>

        {events.map((evt) => {
          const color = getMarkerColor(evt.severity, evt.event_category);
          return (
            <React.Fragment key={evt.event_id}>
              {/* Outer pulsing ring for high severity */}
              {evt.severity >= 4 && (
                <CircleMarker
                  center={[evt.latitude, evt.longitude]}
                  radius={20}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.15,
                    weight: 1.5,
                  }}
                />
              )}

              {/* Core Event Marker */}
              <CircleMarker
                center={[evt.latitude, evt.longitude]}
                radius={evt.severity >= 4 ? 9 : 6}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: color,
                  fillOpacity: 0.9,
                  weight: 2,
                }}
              >
                <Popup className="custom-dark-popup">
                  <div className="p-2 max-w-xs text-slate-100">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-sm text-slate-100">{evt.event_category}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: color }}
                      >
                        Sev {evt.severity}/5
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mb-2 line-clamp-3">
                      {evt.raw_text}
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-700/60 pt-2 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{evt.city || evt.district}, {evt.state}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-cyan-400" />
                        <span>Trust Score: {Math.round(evt.trust_score * 100)}% ({evt.verification_status})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectEvent(evt)}
                      className="w-full text-center text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white py-1.5 rounded transition shadow-md"
                    >
                      View Deep Analysis & Provenance
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Overlay Badge */}
      <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-xs shadow-xl">
        <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>Live Spatial Risk Map</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"/> Catastrophic (5)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"/> Severe (4)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"/> Moderate (3)</span>
        </div>
      </div>
    </div>
  );
};
