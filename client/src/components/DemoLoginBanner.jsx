import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Shield, User, LogOut, Info } from 'lucide-react';

export default function DemoLoginBanner() {
  const { user, loginAs, logout, isLoading } = useAuth();

  return (
    <div className="gov-card p-4 border border-border-default shadow-subtle mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: User status or instructions */}
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
            user?.role === 'OFFICER' ? 'bg-[#0D47A1] text-white' : user?.role === 'FARMER' ? 'bg-[#2E7D32] text-white' : 'bg-gray-100 text-content-secondary'
          }`}>
            {user?.role === 'OFFICER' ? <Shield size={18} /> : <User size={18} />}
          </div>

          <div>
            {user ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-content-main">
                  {user.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                  user.role === 'OFFICER' 
                    ? 'bg-blue-50 text-primary border-blue-200' 
                    : 'bg-green-50 text-agri border-green-200'
                }`}>
                  {user.role === 'OFFICER' ? 'Verification Officer' : 'Demo Farmer'}
                </span>
                <span className="text-[11px] text-content-secondary font-mono">
                  Phone: {user.phone} • {user.village}, {user.district}
                </span>
                {user.isDemo && (
                  <span className="text-[10px] bg-gray-100 text-content-secondary px-1.5 py-0.2 rounded">
                    Simulated
                  </span>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-bold text-content-main">
                  Role Authorization & Authentication
                </h3>
                <p className="text-[11px] text-content-secondary">
                  Select a demo identity to test role-specific workflows (reports, alerts, verification).
                </p>
              </div>
            )}
            <div className="text-[11px] text-content-secondary flex items-center gap-1 mt-0.5">
              <Info size={11} className="text-primary" />
              <span>Demo environment — no real credentials needed.</span>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => loginAs(user.role === 'FARMER' ? 'OFFICER' : 'FARMER')}
                disabled={isLoading}
                className="farmer-tap-target px-3 py-1.5 bg-page hover:bg-gray-100 border border-border-default rounded-md text-xs font-semibold text-content-main transition-colors"
              >
                Switch to {user.role === 'FARMER' ? 'Demo Officer' : 'Demo Farmer'}
              </button>
              <button
                onClick={logout}
                className="farmer-tap-target px-2.5 py-1.5 text-content-secondary hover:text-priority-high text-xs font-medium flex items-center gap-1 transition-colors"
                title="Logout demo session"
              >
                <LogOut size={13} />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => loginAs('FARMER')}
                disabled={isLoading}
                className="farmer-tap-target px-4 py-2 bg-agri hover:bg-green-800 text-white rounded-md text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <User size={13} />
                <span>Continue as Demo Farmer</span>
              </button>
              <button
                onClick={() => loginAs('OFFICER')}
                disabled={isLoading}
                className="farmer-tap-target px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Shield size={13} />
                <span>Continue as Demo Officer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
