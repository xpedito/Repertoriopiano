
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md group relative overflow-hidden">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{song.title}</h3>
          <p className="text-sm text-gray-600 font-medium">{song.band}</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
          {song.key}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200">
          {song.style}
        </span>
        
        {song.audioNote && (
          <button 
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              isPlaying 
                ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                : 'bg-blue-50 text-blue-600 border-blue-100'
            }`}
          >
            {isPlaying ? (
              <>
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                Ouvindo...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Nota de Áudio
              </>
            )}
          </button>
        )}
      </div>

      {song.observations && (
        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-700 leading-relaxed italic">
            &ldquo;{song.observations}&rdquo;
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(song)}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold transition-colors border border-gray-200"
        >
          Editar
        </button>
        <button 
          onClick={() => onDelete(song.id)}
          className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold transition-colors border border-red-100"
        >
          Remover
        </button>
      </div>
    </div>
  );
};
