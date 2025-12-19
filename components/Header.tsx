
import React from 'react';

interface HeaderProps {
  title: string;
  onTitleClick?: () => void;
  onAddClick: () => void;
  showAddButton: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, onTitleClick, onAddClick, showAddButton }) => {
  return (
    <header className="sticky top-0 z-40 bg-black/80 apple-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div 
        className={`flex items-center gap-3 ${onTitleClick ? 'cursor-pointer active:opacity-60 transition-opacity' : ''}`}
        onClick={onTitleClick}
      >
        <div className="w-10 h-10 rounded-full bg-[#1c1c1e] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          <div className="w-full h-full bg-[#2c2c2e] flex items-center justify-center relative">
            <span className="text-blue-500 font-black text-sm tracking-tighter">XP</span>
            <span className="absolute bottom-1 text-blue-500/50 text-[5px] font-bold tracking-widest uppercase">studio</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <h1 className="text-xl font-black tracking-tight text-white truncate">{title}</h1>
          {onTitleClick && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mt-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      
      {showAddButton && (
        <button
          onClick={onAddClick}
          aria-label="Adicionar música"
          className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-500/30 flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </header>
  );
};
