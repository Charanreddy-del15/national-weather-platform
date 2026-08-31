import React from 'react';
import { FilterState } from '../types/weather';
import { Search, Filter, RefreshCw, X } from 'lucide-react';

interface FiltersBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Delhi', 'Gujarat', 'Himachal Pradesh',
  'Jammu & Kashmir', 'Karnataka', 'Kerala', 'Maharashtra', 'Odisha',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'West Bengal'
];

const CATEGORIES = [
  'Heavy Rainfall', 'Rainfall', 'Thunderstorm', 'Lightning', 'Flooding',
  'Flash Floods', 'Cyclone', 'Heatwave', 'Cold Wave', 'Fog', 'Dust Storm',
  'Strong Winds', 'Hailstorm', 'Landslide', 'Cloudburst'
];

export const FiltersBar: React.FC<FiltersBarProps> = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by city, district, hashtag, text, or event ID..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* State Filter */}
          <select
            value={filters.state}
            onChange={(e) => onFilterChange({ state: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All States / UTs</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Verification Status */}
          <select
            value={filters.verificationStatus}
            onChange={(e) => onFilterChange({ verificationStatus: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="FLAGGED">Flagged</option>
            <option value="DUPLICATE">Duplicates</option>
          </select>

          {/* Source Type */}
          <select
            value={filters.sourceType}
            onChange={(e) => onFilterChange({ sourceType: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Sources</option>
            <option value="GOVT_API">Govt Weather API</option>
            <option value="RSS">RSS Feed</option>
            <option value="PUBLIC_SOCIAL">Public Social Feed</option>
            <option value="CITIZEN">Citizen Report</option>
            <option value="PROVIDER">External Provider</option>
          </select>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>

      </div>
    </div>
  );
};
