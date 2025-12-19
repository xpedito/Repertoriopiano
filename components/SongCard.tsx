
import React, { useState, useRef } from 'react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onEdit: (song: Song) => void;
  onDelete: (id: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onEdit, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!song.audioNote) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(song.audioNote);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-[#1c1c1e] rounded-2xl p-5 shadow-lg border border-white/5 transition-all hover:bg-[#2c2c2e] active:scale-[0.99] group relative overflow-hidden">
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          <h3 className="text-xl font-black text-white leading-tight tracking-tight">{song.title}</h3>
          <p className="text-base text-gray-400 font-semibold">{song.band}</p>
        </div>
        <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-black shadow-sm shadow-blue-500/20">
          {song.key}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="bg-white/5 text-gray-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
          {song.style}
        </span>
        
        {song.audioNote && (
          <button 
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${
              isPlaying 
                ? 'bg-red-600 text-white border-red-700 animate-pulse' 
                : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
            }`}
          >
            {isPlaying ? "Tocando Guia..." : "▶ Guia Áudio"}
          </button>
        )}
      </div>

      {song.observations && (
        <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <p className="text-xs text-blue-300 leading-relaxed font-medium">
            💡 {song.observations}
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2 pt-2 border-t border-white/5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(song)}
          className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-black uppercase tracking-tighter transition-colors border border-white/5"
        >
          Editar
        </button>
        <button 
          onClick={() => onDelete(song.id)}
          className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-black uppercase tracking-tighter transition-colors border border-red-500/20"
        >
          Remover
        </button>
      </div>
    </div>
  );
};
