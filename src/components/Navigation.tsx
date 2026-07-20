import React from 'react';
import { ViewMode } from '@/types';

interface NavigationProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed md:relative w-full md:w-20 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-40">
      <div className="flex md:flex-col gap-1 p-2">
        {/* Navigation items placeholder */}
      </div>
    </nav>
  );
};

export default Navigation;
