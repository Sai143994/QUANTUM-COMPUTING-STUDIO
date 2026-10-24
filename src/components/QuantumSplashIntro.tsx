import React, { useState } from 'react';
import { QuantumComputingDashboard } from './QuantumComputingDashboard';
import { ActiveTab } from './Navbar';

interface QuantumSplashIntroProps {
  onEnter: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  isOpen: boolean;
}

export const QuantumSplashIntro: React.FC<QuantumSplashIntroProps> = ({ 
  onEnter, 
  onSelectTab,
  isOpen 
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  if (!isOpen) return null;

  const handleNavigate = (tab: ActiveTab) => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onSelectTab) {
        onSelectTab(tab);
      } else {
        onEnter();
      }
      setIsFadingOut(false);
    }, 280);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-hidden bg-[#010206] flex flex-col justify-between font-mono text-slate-100 select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <QuantumComputingDashboard 
        onNavigateTab={handleNavigate}
        activeQubitsCount={4}
        circuitGateCount={2}
      />
    </div>
  );
};
