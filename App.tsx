
import React, { useState, useEffect, useMemo } from 'react';
import { Song, ViewType } from './types';
import { Header } from './components/Header';
import { SongCard } from './components/SongCard';
import { SongForm } from './components/SongForm';
import { FilterBar } from './components/FilterBar';

const STORAGE_KEY = 'xp_setlist_songs';
const CUSTOM_STYLES_KEY = 'xp_custom_styles';

const App: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [customStyles, setCustomStyles] = useState<string[]>([]);
  const [view, setView] = useState<ViewType>('list');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<Song | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load
  useEffect(() => {
    const savedSongs = localStorage.getItem(STORAGE_KEY);
    const savedStyles = localStorage.getItem(CUSTOM_STYLES_KEY);
    
    if (savedSongs) {
      try {
        setSongs(JSON.parse(savedSongs));
      } catch (e) {
        console.error("Failed to parse songs", e);
      }
    }
    
    if (savedStyles) {
      try {
        setCustomStyles(JSON.parse(savedStyles));
      } catch (e) {
        console.error("Failed to parse custom styles", e);
      }
    }
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_STYLES_KEY, JSON.stringify(customStyles));
  }, [customStyles]);

  // Compute all available styles (now purely based on custom ones)
  const availableStyles = useMemo(() => {
    return [...customStyles].sort((a, b) => a.localeCompare(b));
  }, [customStyles]);

  const filteredSongs = useMemo(() => {
    return songs
      .filter(song => {
        const matchesStyle = selectedStyle ? song.style === selectedStyle : true;
        const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             song.band.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStyle && matchesSearch;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [songs, selectedStyle, searchQuery]);

  const handleAddSong = (newSongData: Omit<Song, 'id' | 'createdAt'>) => {
    // Add to custom list if not already there
    if (newSongData.style && !customStyles.includes(newSongData.style)) {
      setCustomStyles(prev => [...prev, newSongData.style]);
    }

    const newSong: Song = {
      ...newSongData,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setSongs(prev => [...prev, newSong]);
    setView('list');
  };

  const handleEditSong = (updatedData: Omit<Song, 'id' | 'createdAt'>) => {
    if (!editingSong) return;
    
    if (updatedData.style && !customStyles.includes(updatedData.style)) {
      setCustomStyles(prev => [...prev, updatedData.style]);
    }

    setSongs(prev => prev.map(s => s.id === editingSong.id ? { ...s, ...updatedData } : s));
    setEditingSong(undefined);
    setView('list');
  };

  const handleDeleteSong = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta música?')) {
      setSongs(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleDeleteStyle = (styleToDelete: string) => {
    const songCount = songs.filter(s => s.style === styleToDelete).length;
    const message = songCount > 0 
      ? `Existem ${songCount} música(s) com o estilo "${styleToDelete}". Se você apagar o estilo, elas ficarão sem categoria. Confirmar?`
      : `Deseja apagar o estilo "${styleToDelete}"?`;

    if (confirm(message)) {
      if (songCount > 0) {
        setSongs(prev => prev.map(s => s.style === styleToDelete ? { ...s, style: 'Sem Categoria' } : s));
      }
      setCustomStyles(prev => prev.filter(s => s !== styleToDelete));
      if (selectedStyle === styleToDelete) setSelectedStyle(null);
    }
  };

  const startEditing = (song: Song) => {
    setEditingSong(song);
    setView('edit');
  };

  const totalSongs = songs.length;

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-gray-100">
      {view === 'list' && (
        <>
          <Header 
            title="Repertório XP" 
            onAddClick={() => setView('add')} 
            showAddButton={true} 
          />
          
          <div className="px-6 py-4 bg-white/50 apple-blur border-b border-gray-200">
            <div className="relative">
              <input 
                type="text"
                placeholder="Buscar música ou banda..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-200/80 py-3.5 pl-11 pr-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 border border-transparent focus:border-blue-200 font-medium"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3.5 top-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <FilterBar 
            availableStyles={availableStyles}
            defaultStyles={[]}
            selectedStyle={selectedStyle} 
            onSelectStyle={setSelectedStyle} 
            onDeleteStyle={handleDeleteStyle}
          />

          <main className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {filteredSongs.length > 0 ? (
              filteredSongs.map(song => (
                <SongCard 
                  key={song.id} 
                  song={song} 
                  onEdit={startEditing} 
                  onDelete={handleDeleteSong}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Nenhuma música encontrada</h3>
                <p className="text-sm text-gray-500 max-w-[240px] mt-2 font-medium">
                  {totalSongs === 0 
                    ? "Comece adicionando sua primeira música ao repertório." 
                    : "Tente ajustar seus filtros ou busca."}
                </p>
                {totalSongs === 0 && (
                  <button
                    onClick={() => setView('add')}
                    className="mt-6 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Adicionar Música
                  </button>
                )}
              </div>
            )}
          </main>
          
          <div className="p-4 bg-white border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">
              {filteredSongs.length} músicas exibidas • total {totalSongs}
            </p>
          </div>
        </>
      )}

      {(view === 'add' || view === 'edit') && (
        <SongForm 
          song={editingSong}
          availableStyles={availableStyles}
          onSubmit={view === 'add' ? handleAddSong : handleEditSong}
          onCancel={() => {
            setView('list');
            setEditingSong(undefined);
          }}
        />
      )}
    </div>
  );
};

export default App;
