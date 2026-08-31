import React from 'react';
import { FilterState } from '../types';
import { Filter, RefreshCw, Search } from 'lucide-react';

interface EventFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

export const INDIAN_STATES = [
  'ALL',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const CATEGORIES = [
  'ALL',
  'RAINFALL',
  'HEAVY_RAINFALL',
  'THUNDERSTORM',
  'LIGHTNING',
  'FLOOD',
  'FLASH_FLOOD',
  'CYCLONE',
  'HEATWAVE',
  'COLD_WAVE',
  'FOG',
  'DUST_STORM',
  'STRONG_WINDS',
  'HAILSTORM',
  'LANDSLIDE',
  'CLOUDBURST',
  'EXTREME_WEATHER',
];

export const VERIFICATION_STATUSES = [
  'ALL',
  'VERIFIED',
  'UNVERIFIED',
  'UNDER_REVIEW',
  'FLAGGED',
  'REJECTED',
  'DUPLICATE',
];

export const SOURCE_TYPES = [
  'ALL',
  'GOVERNMENT',
  'PUBLIC_API',
  'RSS_FEED',
  'SOCIAL_MEDIA',
  'CITIZEN_REPORT',
];

export const EventFilters: React.FC<EventFiltersProps> = ({ filters, onChange, onReset }) => {
  const handleChange = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Weather Intelligence Filter Engine</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-white flex items-center space-x-1 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search Bar */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Global Search</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by city, keyword, hashtag (#IMD), text..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* State Filter */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Indian State / UT</label>
          <select
            value={filters.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'All States & UTs' : st}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Event Category</label>
          <select
            value={filters.eventCategory}
            onChange={(e) => handleChange('eventCategory', e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories' : cat.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Verification Status</label>
          <select
            value={filters.verificationStatus}
            onChange={(e) => handleChange('verificationStatus', e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            {VERIFICATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Data Source Type */}
        <div>
          <label className="block text-[11px] font-medium text-gray-400 mb-1">Source Connector</label>
          <select
            value={filters.sourceType}
            onChange={(e) => handleChange('sourceType', e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            {SOURCE_TYPES.map((src) => (
              <option key={src} value={src}>
                {src === 'ALL' ? 'All Data Sources' : src.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
