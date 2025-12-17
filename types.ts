
export interface Song {
  id: string;
  title: string;
  key: string;
  band: string;
  style: string;
  observations: string;
  audioNote?: string; // Base64 encoded audio
  createdAt: number;
}

export type ViewType = 'list' | 'add' | 'edit';
