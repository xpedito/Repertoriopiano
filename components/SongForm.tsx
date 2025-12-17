
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { getSmartObservation } from '../services/geminiService';

interface SongFormProps {
  song?: Song;
  availableStyles: string[];
  onSubmit: (song: Omit<Song, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const SongForm: React.FC<SongFormProps> = ({ song, availableStyles, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    key: '',
    band: '',
    style: availableStyles[0] || '',
    observations: '',
    audioNote: undefined as string | undefined
  });
  
  const [isAddingNewStyle, setIsAddingNewStyle] = useState(availableStyles.length === 0);
  const [newStyleName, setNewStyleName] = useState('');
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title,
        key: song.key,
        band: song.band,
        style: song.style,
        observations: song.observations,
        audioNote: song.audioNote
      });
      setIsAddingNewStyle(false);
    } else {
      // If adding new and no styles exist, force new style input
      if (availableStyles.length === 0) {
        setIsAddingNewStyle(true);
      }
    }
  }, [song, availableStyles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.key || !formData.band) return;
    
    const finalStyle = isAddingNewStyle ? newStyleName.trim() : formData.style;
    if (!finalStyle) {
      alert("Por favor, selecione ou crie um estilo musical.");
      return;
    }

    onSubmit({
      ...formData,
      style: finalStyle
    });
  };

  const handleSmartTip = async () => {
    if (!formData.title || !formData.band) return;
    setIsGeneratingTip(true);
    const tip = await getSmartObservation(formData.title, formData.band);
    setFormData(prev => ({ ...prev, observations: tip }));
    setIsGeneratingTip(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, audioNote: reader.result as string }));
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteAudioNote = () => {
    setFormData(prev => ({ ...prev, audioNote: undefined }));
  };

  return (
    <div className="p-6 pb-24 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="text-blue-600 font-bold hover:text-blue-700">
          Cancelar
        </button>
        <h2 className="text-xl font-black flex-1 text-center text-gray-900">
          {song ? 'Editar Música' : 'Nova Música'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-black text-gray-600 uppercase px-1">Título da Música</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-gray-900 placeholder:text-gray-400 font-medium"
            placeholder="Ex: Wonderwall"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-600 uppercase px-1">Tom (Key)</label>
            <input
              type="text"
              required
              value={formData.key}
              onChange={e => setFormData(prev => ({ ...prev, key: e.target.value }))}
              className="w-full p-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-gray-900 placeholder:text-gray-400 font-medium"
              placeholder="Ex: G#m"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-600 uppercase px-1">Banda/Artista</label>
            <input
              type="text"
              required
              value={formData.band}
              onChange={e => setFormData(prev => ({ ...prev, band: e.target.value }))}
              className="w-full p-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-gray-900 placeholder:text-gray-400 font-medium"
              placeholder="Ex: Oasis"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-gray-600 uppercase px-1">Estilo Musical</label>
          {!isAddingNewStyle ? (
            <div className="flex gap-2">
              <select
                value={formData.style}
                onChange={e => {
                  if (e.target.value === 'ADD_NEW') {
                    setIsAddingNewStyle(true);
                  } else {
                    setFormData(prev => ({ ...prev, style: e.target.value }));
                  }
                }}
                className="flex-1 p-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm appearance-none text-gray-900 font-medium"
              >
                {availableStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
                <option value="ADD_NEW" className="font-bold text-blue-600">+ Adicionar Novo Estilo...</option>
              </select>
            </div>
          ) : (
            <div className="flex gap-2 animate-in fade-in duration-200">
              <input
                type="text"
                autoFocus
                placeholder="Nome do novo estilo"
                value={newStyleName}
                onChange={e => setNewStyleName(e.target.value)}
                className="flex-1 p-4 bg-white border border-blue-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-gray-900 font-medium"
              />
              {availableStyles.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setIsAddingNewStyle(false)}
                  className="px-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm border border-gray-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-black text-gray-600 uppercase px-1">Observações</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSmartTip}
                disabled={isGeneratingTip || !formData.title || !formData.band}
                className="text-[10px] bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-black uppercase tracking-tight hover:bg-blue-200 disabled:opacity-50 transition-colors flex items-center gap-1 border border-blue-200"
              >
                {isGeneratingTip ? 'Gerando...' : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Dica IA
                  </>
                )}
              </button>
              
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-tight transition-all flex items-center gap-1 border shadow-sm ${
                  isRecording 
                    ? 'bg-red-600 text-white border-red-700 animate-pulse scale-105' 
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isRecording ? 'Gravando...' : 'Gravar Áudio'}
              </button>
            </div>
          </div>
          
          {formData.audioNote && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span className="text-xs font-bold">Nota de áudio salva</span>
              </div>
              <button 
                type="button" 
                onClick={deleteAudioNote}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}

          <textarea
            value={formData.observations}
            onChange={e => setFormData(prev => ({ ...prev, observations: e.target.value }))}
            className="w-full p-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm min-h-[100px] text-gray-900 placeholder:text-gray-400 font-medium"
            placeholder="Dicas, partes difíceis ou notas extras..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/30 active:scale-[0.98] mt-4"
        >
          {song ? 'Salvar Alterações' : 'Adicionar ao SetList'}
        </button>
      </form>
    </div>
  );
};
