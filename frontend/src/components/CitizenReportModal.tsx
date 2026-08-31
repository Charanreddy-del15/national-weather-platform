import React, { useState } from 'react';
import { X, Upload, ShieldAlert, CheckCircle2, MapPin } from 'lucide-react';
import { citizenService } from '../services/api';
import { CATEGORIES, INDIAN_STATES } from './EventFilters';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [reporterName, setReporterName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('RAINFALL');
  const [location, setLocation] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a weather report description.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('reporter_name', reporterName || 'Anonymous Citizen');
      formData.append('description', description);
      formData.append('event_category', category);
      formData.append('location', location || 'New Delhi');
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const res = await citizenService.submitReport(formData);
      setSuccessMsg(`Report submitted successfully! Record ID: ${res.event_id}. Status: UNVERIFIED`);

      setTimeout(() => {
        setSubmitting(false);
        setSuccessMsg(null);
        setDescription('');
        setMediaFile(null);
        onClose();
        if (onSubmitted) onSubmitted();
      }, 2000);
    } catch (err: any) {
      alert('Error submitting report: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="p-2 bg-amber-950 border border-amber-800 rounded-xl text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-100">Citizen Weather Report Portal</h3>
            <p className="text-xs text-gray-400">Submit verified ground observations to National Control Room</p>
          </div>
        </div>

        {successMsg ? (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 p-4 rounded-xl text-center space-y-2 my-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-semibold text-xs">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Suresh Kumar"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Event Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                >
                  {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">City / District / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Visakhapatnam, AP"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Ground Observation Description *</label>
              <textarea
                rows={3}
                placeholder="Describe current weather conditions, waterlogging, damaged structures, wind strength..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs text-gray-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Attach Photo or Video</label>
              <div className="border-2 border-dashed border-gray-800 hover:border-amber-500 rounded-xl p-3 text-center cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="citizen-media-upload"
                />
                <label htmlFor="citizen-media-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-5 h-5 text-gray-500 mb-1" />
                  <span className="text-xs text-gray-400">
                    {mediaFile ? mediaFile.name : 'Click to select media from device'}
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 border border-amber-400/30"
            >
              <span>{submitting ? 'Transmitting Report...' : 'Submit Report to Intelligence Engine'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
