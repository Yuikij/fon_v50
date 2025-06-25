export interface AnalysisResult {
  verdict: 'SMASH' | 'PASS' | 'MODERATE';
  rating: number;
  explanation: string;
}

export interface SavedResult extends AnalysisResult {
  image: string;
  timestamp: number;
  aiType: AIType;
}

export type AIType = 'brief' | 'descriptive' | 'novel';

export interface AITypeOption {
  value: AIType;
  name: string;
  description: string;
}

export interface ApiError {
  error: {
    message: string;
    status: number;
  };
}

export interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text?: string;
      inline_data?: {
        mime_type: string;
        data: string;
      };
    }>;
  }>;
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
  };
  safetySettings?: Array<any>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
} 