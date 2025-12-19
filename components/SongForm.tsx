
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
    }
  }, [song]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.key || !formData.band) return;
    const finalStyle = isAddingNewStyle ? newStyleName.trim() : formData.style;
    if (!finalStyle) return;

    onSubmit({ ...formData, style: finalStyle });
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
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, audioNote: reader.result as string }));
        reader.readAsDataURL(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { alert("Erro no microfone."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="p-6 pb-24 max-w-2xl mx-auto animate-in slide-in-from-bottom duration-300 bg-black min-h-screen text-white">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="text-blue-500 font-bold">Cancelar</button>
        <h2 className="text-xl font-black flex-1 text-center">
          {song ? 'Editar Música' : 'Nova Música'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-black text-gray-500 uppercase px-1">Título</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-4 bg-[#1c1c1e] border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase px-1">Tom</label>
            <input
              type="text"
              required
              value={formData.key}
              onChange={e => setFormData(prev => ({ ...prev, key: e.target.value }))}
              className="w-full p-4 bg-[#1c1c1e] border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase px-1">Artista</label>
            <input
              type="text"
              required
              value={formData.band}
              onChange={e => setFormData(prev => ({ ...prev, band: e.target.value }))}
              className="w-full p-4 bg-[#1c1c1e] border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-gray-500 uppercase px-1">Estilo</label>
          {!isAddingNewStyle ? (
            <select
              value={formData.style}
              onChange={e => e.target.value === 'ADD_NEW' ? setIsAddingNewStyle(true) : setFormData(prev => ({ ...prev, style: e.target.value }))}
              className="w-full p-4 bg-[#1c1c1e] border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white appearance-none"
            >
              {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="ADD_NEW">+ Adicionar Novo...</option>
            </select>
          ) : (
            <input
              type="text"
              autoFocus
              value={newStyleName}
              onChange={e => setNewStyleName(e.target.value)}
              className="w-full p-4 bg-[#1c1c1e] border border-blue-500 rounded-2xl text-white outline-none"
            />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-black text-gray-500 uppercase px-1">Observações</label>
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              className={`text-[10px] px-3 py-1.5 rounded-full font-black border ${isRecording ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'bg-[#1c1c1e] text-gray-400 border-white/10'}`}
            >
              {isRecording ? 'Gravando...' : 'Gravar Guia'}
            </button>
          </div>
          <textarea
            value={formData.observations}
            onChange={e => setFormData(prev => ({ ...prev, observations: e.target.value }))}
            className="w-full p-4 bg-[#1c1c1e] border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-white min-h-[100px]"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
          {song ? 'Salvar Alterações' : 'Cadastrar Música'}
        </button>
      </form>
    </div>
  );
};
