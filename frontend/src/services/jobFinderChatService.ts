import { getCVData } from "@/lib/storage";

export interface JobFinderChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export interface JobFinderChatSource {
  title: string;
  source: string;
  category: string;
  url: string;
  preview: string;
}

export interface JobFinderChatRequest {
  query: string;
  conversation_id?: string;
  top_k?: number;
  cv_context?: Record<string, any>;
  cv_score?: number;
}

export interface JobFinderChatResponse {
  response: string;
  sources: JobFinderChatSource[];
  conversation_id: string;
  timestamp: string;
}

class JobFinderChatService {
  private baseUrl: string;

  constructor() {
    // Use the AI backend URL with network IP for mobile access
    this.baseUrl = import.meta.env.VITE_AI_API_URL || 'http://10.0.2.176:8000';
  }

  async sendMessage(request: JobFinderChatRequest): Promise<JobFinderChatResponse> {
    try {
      // Auto-include CV context if available, but with fallback for speed
      const cvData = getCVData();
      let useCVContext = true;
      
      if (cvData && !request.cv_context) {
        // For complex questions, skip CV context for speed
        const complexKeywords = ['improve', 'detailed', 'comprehensive', 'explain', 'how to', 'what should', 'recommend'];
        const isComplex = complexKeywords.some(keyword => 
          request.query.toLowerCase().includes(keyword)
        );
        
        if (isComplex) {
          useCVContext = false;
          console.log('Skipping CV context for faster response to complex question');
        } else {
          request.cv_context = cvData.extractedData;
          request.cv_score = cvData.score;
        }
      }

      // Optimize request for speed
      const optimizedRequest = {
        ...request,
        top_k: 1  // Always use 1 document for maximum speed
      };

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optimizedRequest),
        signal: AbortSignal.timeout(25000) // 25 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new Error('The AI is taking longer than expected. Try asking a simpler question for a faster response.');
      }
      console.error('Error sending message to job finder chat:', error);
      throw error;
    }
  }

  async searchDocuments(query: string, top_k: number = 5) {
    try {
      const response = await fetch(`${this.baseUrl}/api/search?query=${encodeURIComponent(query)}&top_k=${top_k}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking job finder chat service health:', error);
      throw error;
    }
  }

  async getStats() {
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

  // Generate suggested questions based on CV data
  generateSuggestedQuestions(): string[] {
    const cvData = getCVData();
    
    if (!cvData) {
      return [
        "What are the most in-demand skills in the job market?",
        "How can I improve my resume?",
        "What industries are hiring right now?",
        "How do I prepare for a technical interview?"
      ];
    }

    const questions = [];
    const score = cvData.score;
    const sector = cvData.extractedData?.Sector;
    const skills = cvData.extractedData?.Skills;

    // Score-based questions
    if (score < 70) {
      questions.push("How can I improve my CV score to get above 70?");
      questions.push("What are the key missing elements in my CV?");
    } else if (score < 85) {
      questions.push("How can I take my CV from good to great?");
      questions.push("What skills should I add to reach the 90+ range?");
    } else {
      questions.push("How can I maintain my competitive edge?");
      questions.push("What advanced skills should I consider learning?");
    }

    // Sector-specific questions
    if (sector) {
      questions.push(`What are the top skills for ${sector} roles?`);
      questions.push(`How can I advance my career in ${sector}?`);
      questions.push(`What companies are hiring ${sector}s?`);
    }

    // Skills-based questions
    if (skills && skills.length > 0) {
      questions.push("How should I highlight my skills on my resume?");
      questions.push("What certifications would complement my current skills?");
      questions.push("Which of my skills are most valuable to employers?");
    }

    // Experience and career questions
    questions.push("How can I better describe my experience?");
    questions.push("What kind of projects should I work on to improve my profile?");
    questions.push("How do I negotiate salary based on my qualifications?");

    // Limit to 8 questions and shuffle
    return questions.slice(0, 8);
  }

  // Format CV data for display
  formatCVContext(cvData: any): string {
    if (!cvData) return "No CV data available";
    
    let formatted = "";
    
    if (cvData.Name) {
      formatted += `**Name:** ${cvData.Name}\n`;
    }
    
    if (cvData.Sector) {
      formatted += `**Sector:** ${cvData.Sector}\n`;
    }
    
    if (cvData.Email) {
      formatted += `**Email:** ${cvData.Email}\n`;
    }
    
    if (cvData.Experience) {
      formatted += `**Experience:** ${cvData.Experience.substring(0, 100)}...\n`;
    }
    
    if (cvData.Skills && Array.isArray(cvData.Skills)) {
      formatted += `**Skills:** ${cvData.Skills.slice(0, 5).join(", ")}\n`;
    }
    
    return formatted || "CV data available";
  }
}

export const jobFinderChatService = new JobFinderChatService();
