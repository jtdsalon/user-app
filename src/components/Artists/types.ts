export interface DiagnosticProfile {
  concerns: string[];
  intensity: 'Standard' | 'Advanced' | 'Intensive';
  history: string;
}

export interface ArtistService {
  id: string;
  label: string;
}

export interface Artist {
  id: string;
  name: string;
  location: string;
  image: string;
  experience: number;
  services: ArtistService[];
  rating: number;
  specialty?: string;
  bio?: string;
}

export interface StyleTransformation {
  beforeImage: string;
  afterImage: string;
  description: string;
  artistRecommendation?: string;
}

export interface ConsultationSession {
  id: string;
  userId: string;
  vibePreference: 'Minimalist' | 'Opulent' | 'Avant-Garde';
  diagnostic: DiagnosticProfile;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  role: 'user' | 'ai';
  content: string;
  image?: string;
  generatedImage?: string;
  analysis?: AestheticAnalysis;
  artistMatch?: ArtistMatch;
  timestamp?: number;
}

export interface AestheticAnalysis {
  faceShape?: string;
  skinTone?: string;
  undertone?: string;
  features?: string[];
}

export interface ArtistMatch {
  name: string;
  matchReason: string;
  rating: number;
  specialty?: string;
}
