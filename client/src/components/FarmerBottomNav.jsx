import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, FileText, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function FarmerBottomNav() {
  const location = useLocation();
  const { strings } = useLanguage();
  const t = strings;

  const navItems = [
    { to: '/farmer', label: t.bottomNav?.home || 'Home', icon: <Home size={18} /> },
    { to: '/farmer/report', label: t.bottomNav?.report || 'Report', icon: <PlusCircle size={18} /> },
    { to: '/farmer/my-reports', label: t.bottomNav?.myReports || 'My Reports', icon: <FileText size={18} /> },
    { to: '/farmer/alerts', label: t.bottomNav?.alerts || 'Alerts', icon: <Bell size={18} /> }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-default shadow-lg md:hidden">
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`farmer-tap-target flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive 
                  ? 'text-primary font-bold' 
                  : 'text-content-secondary hover:text-content-main'
              }`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
