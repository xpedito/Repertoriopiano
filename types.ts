
export interface Location {
  id: string;
  name: string;
  createdAt: number;
}

export interface Song {
  id: string;
  locationId: string; // Vínculo com o local
  title: string;
  key: string;
  band: string;
  style: string;
  observations: string;
  audioNote?: string; // Base64 encoded audio
  createdAt: number;
}

export type ViewType = 'list' | 'add' | 'edit' | 'ai-setlist' | 'locations';
