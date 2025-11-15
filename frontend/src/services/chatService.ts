export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSource {
  title: string;
  source: string;
  category: string;
  url: string;
  preview: string;
}

export interface ChatResponse {
  response: string;
  sources: ChatSource[];
  conversation_id: string;
  timestamp: string;
}

export interface ChatRequest {
  query: string;
  conversation_id?: string;
  top_k?: number;
}

class ChatService {
  private baseUrl: string;

  constructor() {
    // Default to network IP for mobile access
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.0.2.176:8000';
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async searchDocuments(query: string, top_k: number = 5): Promise<{
    query: string;
    results: any[];
    count: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/search?query=${encodeURIComponent(query)}&top_k=${top_k}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<{
    status: string;
    vector_database_status: string;
    vector_database_count: number;
    ollama_status: string;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    total_documents: number;
    categories: string[];
    document_types: string[];
    collection_name: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
