import React from 'react';
import { Outlet } from 'react-router-dom';
import FarmerBottomNav from '../components/FarmerBottomNav';

export default function FarmerLayout() {
  return (
    <div className="w-full max-w-xl mx-auto pb-16 sm:pb-6">
      <Outlet />
      {/* Mobile Bottom Navigation */}
      <FarmerBottomNav lang="mr" />
    </div>
  );
}
