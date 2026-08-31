import React from 'react';
import { ShieldAlert, CheckCircle, FileText, Camera, MapPin } from 'lucide-react';

interface CitizenPortalProps {
  onOpenCitizenModal: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ onOpenCitizenModal }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-gray-100">
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-amber-950/80 rounded-2xl border border-amber-800/80 text-amber-400 mb-2">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-orange-300 to-amber-500 bg-clip-text text-transparent">
          National Citizen Weather Reporting Portal
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Empowering citizens across all 28 States and Union Territories of India to submit real-time ground observations, photo evidence, and flood/disaster alerts directly to the National Control Room.
        </p>
        <div className="pt-4">
          <button
            onClick={onOpenCitizenModal}
            className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg transition flex items-center space-x-2 mx-auto border border-amber-400/40"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Submit Ground Weather Observation Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-800">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <h3 className="font-bold text-sm text-gray-200">1. Instant Observation Input</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Record current rainfall intensity, waterlogging levels, strong winds, hail, heatwave conditions, or storm damage.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
          <Camera className="w-6 h-6 text-emerald-400" />
          <h3 className="font-bold text-sm text-gray-200">2. Upload Ground Media</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Attach photo or video evidence from your mobile or desktop device to assist validation algorithms.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
          <CheckCircle className="w-6 h-6 text-purple-400" />
          <h3 className="font-bold text-sm text-gray-200">3. Verification Pipeline</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Reports enter UNVERIFIED status and are analyzed by the Trust & Verification engine for cross-source confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};
