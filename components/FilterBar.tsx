
import React from 'react';

interface FilterBarProps {
  availableStyles: string[];
  selectedStyle: string | null;
  onSelectStyle: (style: string | null) => void;
  onDeleteStyle: (style: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  availableStyles, 
  selectedStyle, 
  onSelectStyle, 
  onDeleteStyle 
}) => {
  const styles = ['Todos', ...availableStyles];

  return (
    <div className="bg-white/50 apple-blur border-b border-gray-200 py-3 px-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
      {styles.map(style => {
        const value = style === 'Todos' ? null : style;
        const isActive = selectedStyle === value;
        const isDeletable = value !== null; // Agora todos os estilos exceto "Todos" podem ser deletados
        
        return (
          <div key={style} className="relative group flex-shrink-0">
            <button
              onClick={() => onSelectStyle(value)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ${
                isActive 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {style}
              {isDeletable && (
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStyle(style);
                  }}
                  className={`ml-1 -mr-1 p-0.5 rounded-full transition-colors ${
                    isActive ? 'hover:bg-blue-700' : 'hover:bg-gray-200'
                  }`}
                  title="Apagar estilo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};
