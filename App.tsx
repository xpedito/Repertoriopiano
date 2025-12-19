
import React, { useState, useEffect, useMemo } from 'react';
import { Song, Location, ViewType } from './types';
import { Header } from './components/Header';
import { SongCard } from './components/SongCard';
import { SongForm } from './components/SongForm';
import { FilterBar } from './components/FilterBar';
import { LocationSelector } from './components/LocationSelector';
import { suggestSetlistOrder } from './services/geminiService';

const SONGS_KEY = 'xp_setlist_songs_v2';
const LOCATIONS_KEY = 'xp_locations';
const CUSTOM_STYLES_KEY = 'xp_custom_styles_v2';
const LAST_LOCATION_KEY = 'xp_last_location';

const INITIAL_STYLES = ['Toada', 'Rock', 'Rock Internacional', 'MPB', 'Pop'];

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15);
  }
};

const App: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [customStyles, setCustomStyles] = useState<string[]>([]);
  const [view, setView] = useState<ViewType>('locations');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<Song | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestedOrder, setAiSuggestedOrder] = useState<string[]>([]);
  const [isGeneratingSetlist, setIsGeneratingSetlist] = useState(false);

  useEffect(() => {
    const savedLocations = localStorage.getItem(LOCATIONS_KEY);
    const savedSongs = localStorage.getItem(SONGS_KEY);
    const savedStyles = localStorage.getItem(CUSTOM_STYLES_KEY);
    const lastLoc = localStorage.getItem(LAST_LOCATION_KEY);
    
    if (savedLocations) {
      const locs = JSON.parse(savedLocations);
      setLocations(locs);
      if (lastLoc && locs.find((l: Location) => l.id === lastLoc)) {
        setCurrentLocationId(lastLoc);
        setView('list');
      }
    }
    if (savedSongs) setSongs(JSON.parse(savedSongs));
    if (savedStyles) {
      setCustomStyles(JSON.parse(savedStyles));
    } else {
      setCustomStyles(INITIAL_STYLES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_STYLES_KEY, JSON.stringify(customStyles));
  }, [customStyles]);

  useEffect(() => {
    if (currentLocationId) {
      localStorage.setItem(LAST_LOCATION_KEY, currentLocationId);
    }
  }, [currentLocationId]);

  const currentLocation = useMemo(() => 
    locations.find(l => l.id === currentLocationId), 
  [locations, currentLocationId]);

  const availableStyles = useMemo(() => {
    return [...customStyles].sort((a, b) => a.localeCompare(b));
  }, [customStyles]);

  const filteredSongs = useMemo(() => {
    return songs
      .filter(song => {
        const matchesLocation = song.locationId === currentLocationId;
        const matchesStyle = selectedStyle ? song.style === selectedStyle : true;
        const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             song.band.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLocation && matchesStyle && matchesSearch;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [songs, currentLocationId, selectedStyle, searchQuery]);

  const handleAddLocation = (name: string) => {
    const newLoc: Location = { id: generateId(), name, createdAt: Date.now() };
    setLocations(prev => [...prev, newLoc]);
    setCurrentLocationId(newLoc.id);
    setView('list');
  };

  const handleDeleteLocation = (id: string) => {
    if (confirm('Ao apagar este lugar, todas as músicas vinculadas a ele serão removidas. Confirmar?')) {
      setLocations(prev => prev.filter(l => l.id !== id));
      setSongs(prev => prev.filter(s => s.locationId !== id));
      if (currentLocationId === id) {
        setCurrentLocationId(null);
        setView('locations');
      }
    }
  };

  const handleSuggestSetlist = async () => {
    if (filteredSongs.length < 2) {
      alert("Adicione pelo menos 2 músicas neste local para organizar.");
      return;
    }
    setIsGeneratingSetlist(true);
    const order = await suggestSetlistOrder(filteredSongs);
    setAiSuggestedOrder(order);
    setView('ai-setlist');
    setIsGeneratingSetlist(false);
  };

  const handleAddSong = (newSongData: Omit<Song, 'id' | 'createdAt' | 'locationId'>) => {
    if (!currentLocationId) return;
    if (newSongData.style && !customStyles.includes(newSongData.style)) {
      setCustomStyles(prev => [...prev, newSongData.style]);
    }
    const newSong: Song = { 
      ...newSongData, 
      id: generateId(), 
      locationId: currentLocationId, 
      createdAt: Date.now() 
    };
    setSongs(prev => [...prev, newSong]);
    setView('list');
  };

  const handleEditSong = (updatedData: Omit<Song, 'id' | 'createdAt' | 'locationId'>) => {
    if (!editingSong) return;
    if (updatedData.style && !customStyles.includes(updatedData.style)) {
      setCustomStyles(prev => [...prev, updatedData.style]);
    }
    setSongs(prev => prev.map(s => s.id === editingSong.id ? { ...s, ...updatedData } : s));
    setEditingSong(undefined);
    setView('list');
  };

  const handleDeleteStyle = (styleToDelete: string) => {
    if (confirm(`Deseja apagar a categoria "${styleToDelete}"?`)) {
      setCustomStyles(prev => prev.filter(s => s !== styleToDelete));
      if (selectedStyle === styleToDelete) setSelectedStyle(null);
    }
  };

  if (view === 'locations' || !currentLocationId) {
    return (
      <LocationSelector 
        locations={locations}
        onSelect={(id) => { setCurrentLocationId(id); setView('list'); }}
        onAdd={handleAddLocation}
        onDelete={handleDeleteLocation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-white/5 pb-20">
      {(view === 'list' || view === 'ai-setlist') && (
        <>
          <Header 
            title={currentLocation?.name || "Repertório XP"} 
            onTitleClick={() => setView('locations')}
            onAddClick={() => setView('add')} 
            showAddButton={view === 'list'} 
          />
          
          {view === 'list' && (
            <>
              <div className="px-6 py-4 bg-black/50 apple-blur border-b border-white/5">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Buscar música ou banda..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1c1c1e] py-3.5 pl-11 pr-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white font-medium placeholder:text-gray-500"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3.5 top-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="bg-black/50 apple-blur border-b border-white/5 px-4 py-2 flex items-center justify-between">
                <FilterBar 
                  availableStyles={availableStyles}
                  selectedStyle={selectedStyle} 
                  onSelectStyle={setSelectedStyle} 
                  onDeleteStyle={handleDeleteStyle}
                />
                <button 
                  onClick={handleSuggestSetlist}
                  disabled={isGeneratingSetlist || filteredSongs.length < 2}
                  className="ml-2 flex-shrink-0 bg-blue-600/10 text-blue-400 p-2.5 rounded-full hover:bg-blue-600/20 transition-colors disabled:opacity-30"
                >
                  {isGeneratingSetlist ? (
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}

          <main className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {view === 'list' ? (
              filteredSongs.length > 0 ? (
                filteredSongs.map(song => (
                  <SongCard key={song.id} song={song} onEdit={s => { setEditingSong(s); setView('edit'); }} onDelete={(id) => setSongs(prev => prev.filter(s => s.id !== id))} />
                ))
              ) : (
                <EmptyState onAdd={() => setView('add')} isSearch={songs.some(s => s.locationId === currentLocationId)} />
              )
            ) : (
              <div className="space-y-4">
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar para {currentLocation?.name}
                </button>
                {aiSuggestedOrder.map((title, idx) => {
                  const song = songs.find(s => s.title === title && s.locationId === currentLocationId);
                  if (!song) return null;
                  return (
                    <div key={song.id} className="flex gap-4 items-center">
                      <span className="text-2xl font-black text-[#2c2c2e] w-8 text-right">{idx + 1}</span>
                      <div className="flex-1">
                        <SongCard song={song} onEdit={s => { setEditingSong(s); setView('edit'); }} onDelete={(id) => setSongs(prev => prev.filter(s => s.id !== id))} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
          
          <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-black/80 apple-blur border-t border-white/10 flex justify-around py-3 px-6 safe-area-bottom">
            <button onClick={() => setView('list')} className={`flex flex-col items-center gap-1 ${view === 'list' ? 'text-blue-500' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              <span className="text-[10px] font-bold uppercase">Repertório</span>
            </button>
            <button onClick={handleSuggestSetlist} className={`flex flex-col items-center gap-1 ${view === 'ai-setlist' ? 'text-blue-500' : 'text-gray-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-[10px] font-bold uppercase">Show (IA)</span>
            </button>
            <button onClick={() => setView('locations')} className={`flex flex-col items-center gap-1 text-gray-500`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="text-[10px] font-bold uppercase">Lugares</span>
            </button>
          </nav>
        </>
      )}

      {(view === 'add' || view === 'edit') && (
        <SongForm 
          song={editingSong}
          availableStyles={availableStyles}
          onSubmit={view === 'add' ? handleAddSong : handleEditSong}
          onCancel={() => { setView('list'); setEditingSong(undefined); }}
        />
      )}
    </div>
  );
};

const EmptyState = ({ onAdd, isSearch }: { onAdd: () => void, isSearch: boolean }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="bg-[#1c1c1e] w-24 h-24 rounded-full flex items-center justify-center mb-6 text-gray-600">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
    </div>
    <h3 className="text-lg font-bold text-white">{isSearch ? "Nada por aqui" : "Local sem músicas"}</h3>
    <p className="text-sm text-gray-500 max-w-[240px] mt-2 font-medium">
      {isSearch ? "Ajuste sua busca ou filtro." : "Crie um repertório exclusivo para este lugar."}
    </p>
    {!isSearch && (
      <button onClick={onAdd} className="mt-6 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
        Cadastrar Música
      </button>
    )}
  </div>
);

export default App;
