
import React from 'react';

interface HeaderProps {
  title: string;
  onAddClick: () => void;
  showAddButton: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, onAddClick, showAddButton }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 apple-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
          {/* Usando uma representação visual que remete à logo enviada (fundo circular cinza azulado com texto XP) */}
          <div className="w-full h-full bg-[#e1e6ed] flex items-center justify-center relative">
            <span className="text-[#0033cc] font-black text-sm tracking-tighter">XP</span>
            <span className="absolute bottom-1 text-[#0033cc] text-[5px] font-bold tracking-widest uppercase">studio</span>
          </div>
        </div>
        <h1 className="text-xl font-black tracking-tight text-gray-900">{title}</h1>
      </div>
      
      {showAddButton && (
        <button
          onClick={onAddClick}
          aria-label="Adicionar música"
          className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-500/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </header>
  );
};
