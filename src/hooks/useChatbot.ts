import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import type { ApiResponse } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  image?: {
    mimeType: string;
    data: string;
  };
}

interface ChatResponse {
  response: string;
  timestamp: Date;
}

interface AnalyzeImageRequest {
  image: {
    mimeType: string;
    data: string;
  };
  message?: string;
}

interface ConversationStartersResponse {
  starters: string[];
}

/**
 * Hook to send a chat message
 */
export const useSendMessage = () => {
  return useMutation({
    mutationFn: async (data: ChatRequest): Promise<ChatResponse> => {
      const response = await apiClient.post<ApiResponse<ChatResponse>>('/chatbot/message', data);
      return response.data;
    },
  });
};

/**
 * Hook to analyze an image
 */
export const useAnalyzeImage = () => {
  return useMutation({
    mutationFn: async (data: AnalyzeImageRequest): Promise<ChatResponse> => {
      const response = await apiClient.post<ApiResponse<ChatResponse>>('/chatbot/analyze-image', data);
      return response.data;
    },
  });
};

/**
 * Hook to get conversation starters
 */
export const useConversationStarters = () => {
  return useQuery({
    queryKey: ['chatbot', 'starters'],
    queryFn: async (): Promise<string[]> => {
      const response = await apiClient.get<ApiResponse<ConversationStartersResponse>>('/chatbot/starters');
      return response.data.starters;
    },
    staleTime: 1000 * 60 * 60, // 1 hour - these don't change often
  });
};

/**
 * Helper function to convert File to base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
