export enum DesignStyle {
  Modern = 'Modern',
  Scandinavian = 'Scandinavian',
  Industrial = 'Industrial',
  Boho = 'Boho',
  MidCentury = 'Mid-Century Modern',
  Minimalist = 'Minimalist',
  ArtDeco = 'Art Deco',
  Coastal = 'Coastal'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isVisualUpdate?: boolean;
}

export interface AppState {
  originalImage: string | null;
  generatedImage: string | null;
  history: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  selectedStyle: DesignStyle | null;
}

export type ImageGenerationResponse = {
  image: string; // Base64
  description?: string;
};
