import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapViewProps {
  mapEvents: any[];
  onSelectEvent: (eventId: string) => void;
  selectedEventId?: string;
}

const createMarkerIcon = (category: string, severity: number, isSelected: boolean) => {
  let colorClass = 'bg-blue-500 border-blue-300';
  let pulseClass = '';

  if (severity >= 0.8) {
    colorClass = 'bg-rose-600 border-rose-300 text-white';
    pulseClass = 'animate-ping';
  } else if (severity >= 0.6) {
    colorClass = 'bg-amber-500 border-amber-200 text-gray-900';
  } else if (severity >= 0.4) {
    colorClass = 'bg-indigo-500 border-indigo-200 text-white';
  }

  const iconHtml = `
    <div class="relative flex items-center justify-center">
      ${severity >= 0.8 ? `<span class="absolute inline-flex h-full w-full rounded-full ${pulseClass} bg-rose-400 opacity-75"></span>` : ''}
      <div class="relative flex items-center justify-center w-7 h-7 rounded-full ${colorClass} border-2 font-bold text-[10px] shadow-lg ${isSelected ? 'ring-4 ring-amber-400 scale-125' : ''}">
        ${category ? category.substring(0, 2) : 'WX'}
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function MapRecenter({ events }: { events: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (events && events.length > 0 && events.length < 5) {
      const valid = events.filter((e) => e.latitude && e.longitude);
      if (valid.length > 0) {
        const bounds = L.latLngBounds(valid.map((e) => [e.latitude, e.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [events, map]);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ mapEvents, onSelectEvent, selectedEventId }) => {
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 5;

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-gray-800 shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0 bg-gray-950"
      >
       <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
/>
        <MapRecenter events={mapEvents} />

        {mapEvents.map((evt) => {
          if (!evt.latitude || !evt.longitude) return null;
          const isSelected = evt.event_id === selectedEventId;
          const customIcon = createMarkerIcon(evt.event_category || 'RAINFALL', evt.severity || 0.5, isSelected);

          return (
            <Marker
              key={evt.event_id}
              position={[evt.latitude, evt.longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => onSelectEvent(evt.event_id),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 max-w-xs font-sans">
                  <div className="flex items-center justify-between gap-2 border-b pb-1 mb-1">
                    <span className="font-bold text-xs text-gray-900 uppercase">
                      {(evt.event_category || 'RAINFALL').replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        evt.trust_score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Trust {evt.trust_score}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 font-medium leading-snug line-clamp-2 mb-1.5">
                    {evt.raw_text}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t">
                    <span>
                      {evt.city}, {evt.state}
                    </span>
                    <button
                      onClick={() => onSelectEvent(evt.event_id)}
                      className="font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-gray-950/90 backdrop-blur-md border border-gray-800 rounded-lg p-2.5 shadow-lg text-[11px]">
        <span className="font-bold text-gray-300 uppercase tracking-wider text-[10px] block mb-1">
          Severity Legend
        </span>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block animate-pulse"></span>
            <span className="text-gray-300 font-mono">Critical (Severe Alert)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-gray-300 font-mono">High Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
            <span className="text-gray-300 font-mono">Moderate / Watch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
