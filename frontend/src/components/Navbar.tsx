import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloudLightning, ShieldAlert, BarChart3, Settings, FileText, Activity, Radio, UserCheck } from 'lucide-react';
import { authService } from '../services/api';

export interface NavbarProps {
  wsConnected: boolean;
  onOpenCitizenModal: () => void;
}

export const Navbar = ({ wsConnected, onOpenCitizenModal }: NavbarProps) => {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const navLinks = [
    { path: '/', label: 'National Dashboard', icon: Activity },
    { path: '/analytics', label: 'Analytics Suite', icon: BarChart3 },
    { path: '/admin', label: 'Control Room / Admin', icon: Settings },
    { path: '/citizen-portal', label: 'Citizen Reporting', icon: FileText },
  ];

  return (
    <header className="bg-gray-950 border-b border-gray-800 text-gray-100 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 p-2.5 rounded-xl shadow-md flex items-center justify-center border border-blue-500/30">
              <CloudLightning className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-amber-300 bg-clip-text text-transparent">
                  WeatherVani India
                </span>
                <span className="bg-blue-900/60 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded border border-blue-700/50 uppercase tracking-wider">
                  GOVT INTELLIGENCE
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                National Weather Big Data Analytics Platform
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Controls & Live Stream Status */}
          <div className="flex items-center space-x-4">
            {/* Live WebSocket Indicator */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs font-mono">
              <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}`} />
              <span className={wsConnected ? 'text-emerald-400' : 'text-amber-400'}>
                {wsConnected ? 'LIVE FEED' : 'CONNECTING...'}
              </span>
            </div>

            {/* Quick Report Button */}
            <button
              onClick={onOpenCitizenModal}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow transition flex items-center space-x-1.5 border border-amber-400/30"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report Weather Event</span>
            </button>

            {/* User Profile Badge */}
            <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-gray-800">
              <UserCheck className="w-4 h-4 text-gray-400" />
              <div className="text-right">
                <p className="text-xs font-medium text-gray-200 leading-none">
                  {currentUser ? currentUser.full_name : 'Control Officer'}
                </p>
                <p className="text-[10px] text-blue-400 font-mono">
                  {currentUser ? currentUser.role : 'ANALYST'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
