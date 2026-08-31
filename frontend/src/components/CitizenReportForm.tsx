import React, { useState } from 'react';
import { X, MapPin, Upload, AlertCircle, Send } from 'lucide-react';

interface CitizenReportFormProps {
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const CitizenReportForm: React.FC<CitizenReportFormProps> = ({ onClose, onSubmitSuccess }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Heavy Rainfall');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Mumbai');
  const [city, setCity] = useState('Mumbai');
  const [severity, setSeverity] = useState('3');
  const [latitude, setLatitude] = useState('19.0760');
  const [longitude, setLongitude] = useState('72.8777');
  const [reporterName, setReporterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess();
      onClose();
    }, 800);
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude.toFixed(4));
        setLongitude(pos.coords.longitude.toFixed(4));
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 className="font-bold text-lg text-slate-100">National Citizen Weather Reporting Portal</h3>
            <p className="text-xs text-slate-400">Submit crowdsourced observations directly to national monitoring</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Weather Event Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe rainfall intensity, flooding, storm damage, or weather observations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              >
                <option value="Heavy Rainfall">Heavy Rainfall</option>
                <option value="Flooding">Flooding</option>
                <option value="Thunderstorm">Thunderstorm</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Heatwave">Heatwave</option>
                <option value="Landslide">Landslide</option>
                <option value="Cloudburst">Cloudburst</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity (1 to 5)</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
              >
                <option value="1">1 — Minimal / Light</option>
                <option value="2">2 — Moderate</option>
                <option value="3">3 — High / Waterlogging</option>
                <option value="4">4 — Severe / Flooding</option>
                <option value="5">5 — Catastrophic / Red Alert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State / UT *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">District / City *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100"
              />
            </div>
          </div>

          {/* GPS Coordinates */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> GPS Geolocation
              </span>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="text-[11px] text-blue-400 hover:underline font-semibold"
              >
                Auto Detect Location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input type="text" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
              <input type="text" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reporter Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Rajesh Kumar or leave blank for Anonymous"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100"
            />
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Reports enter status <strong>UNVERIFIED</strong> and undergo automated AI classification & trust engine scoring.</span>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
