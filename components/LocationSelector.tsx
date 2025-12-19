
import React, { useState } from 'react';
import { Location } from '../types';

interface LocationSelectorProps {
  locations: Location[];
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ locations, onSelect, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocationName.trim()) {
      onAdd(newLocationName.trim());
      setNewLocationName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">
      <header className="px-8 pt-16 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
           <div className="w-full h-full bg-[#e1e6ed] rounded-xl flex items-center justify-center relative">
            <span className="text-[#0033cc] font-black text-2xl tracking-tighter">XP</span>
          </div>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2">Seus Lugares</h1>
        <p className="text-gray-500 font-medium">Selecione onde você vai tocar hoje.</p>
      </header>

      <main className="flex-1 px-6 space-y-3 overflow-y-auto no-scrollbar pb-24">
        {locations.length > 0 ? (
          locations.map(loc => (
            <div key={loc.id} className="group relative">
              <button
                onClick={() => onSelect(loc.id)}
                className="w-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md active:scale-[0.98] active:bg-gray-50 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{loc.name}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(loc.id); }}
                className="absolute -right-2 -top-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        ) : !isAdding && (
          <div className="py-12 text-center">
            <p className="text-gray-400 font-medium">Nenhum lugar cadastrado ainda.</p>
          </div>
        )}

        {isAdding ? (
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-xl animate-in zoom-in-95 duration-200">
            <label className="text-xs font-black text-blue-600 uppercase mb-2 block">Nome do Restaurante / Local</label>
            <input
              autoFocus
              type="text"
              value={newLocationName}
              onChange={e => setNewLocationName(e.target.value)}
              className="w-full text-xl font-bold bg-gray-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
              placeholder="Ex: Restaurante Viva"
            />
            <div className="flex gap-2 mt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                Salvar Local
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-6 bg-gray-100 text-gray-600 rounded-2xl font-bold active:scale-95 transition-all"
              >
                X
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full border-2 border-dashed border-gray-300 p-6 rounded-3xl flex items-center justify-center gap-3 text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Novo Lugar
          </button>
        )}
      </main>
      
      <div className="p-8 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">XP Studio Performance Manager</p>
      </div>
    </div>
  );
};
