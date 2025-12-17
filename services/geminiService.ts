
import { GoogleGenAI, Type } from "@google/genai";
import { Song } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestSetlistOrder = async (songs: Song[]): Promise<string[]> => {
  if (songs.length === 0) return [];

  const prompt = `Considere a seguinte lista de músicas para uma performance em um restaurante:
  ${songs.map(s => `- ${s.title} (${s.style}, Tom: ${s.key}, Banda: ${s.band})`).join('\n')}

  Como um especialista em curadoria musical para ambientes gastronômicos, sugira uma ordem lógica para tocar estas músicas (começando com algo mais calmo e aumentando a energia gradualmente). Retorne apenas a lista de títulos das músicas em ordem.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.split('\n').filter(line => line.trim() !== '') || [];
  } catch (error) {
    console.error("Erro ao sugerir setlist:", error);
    return songs.map(s => s.title);
  }
};

export const getSmartObservation = async (songTitle: string, band: string): Promise<string> => {
  const prompt = `Dê uma dica curta de performance ou curiosidade rápida (máximo 15 palavras) para a música "${songTitle}" da banda "${band}" para um músico de restaurante comentar com o público ou se preparar.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Música excelente para o ambiente.";
  } catch (error) {
    return "Música excelente para o ambiente.";
  }
};
