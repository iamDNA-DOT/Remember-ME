
export type MemoryCategory = 
  | 'Thought' 
  | 'Decision' 
  | 'Idea' 
  | 'Goal' 
  | 'Learning' 
  | 'Event' 
  | 'Relationship' 
  | 'Problem' 
  | 'Experiment' 
  | 'Identity';

export interface Memory {
  id: string;
  timestamp: string;
  content: string;
  category: MemoryCategory;
  metadata: {
    intent?: string;
    facts?: string[];
    emotions?: string[];
    importance?: number;
    tags?: string[];
  };
  inferredLifePhase?: string;
}

export interface RetrievalResult {
  type: 'retrieval' | 'storage' | 'insight';
  content: string;
  relatedMemories?: Memory[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: string;
  isRetrieval?: boolean;
}
