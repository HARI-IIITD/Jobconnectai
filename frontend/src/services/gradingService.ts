export interface CVAnalysisResponse {
  success: boolean;
  message: string;
  extracted_data?: Record<string, any>;
  score?: number;
  sector?: string;
  json_data?: Record<string, any>;
}

export interface HealthResponse {
  status: string;
  spacy_loaded: boolean;
  classifier_loaded: boolean;
  timestamp: string;
}

export interface SectorInfo {
  sectors: Record<string, number>;
  total_sectors: number;
}

class GradingService {
  private baseUrl: string;

  constructor() {
    // Default to network IP for mobile access
    this.baseUrl = import.meta.env.VITE_GRADING_API_URL || 'http://10.0.2.176:8001';
  }

  async gradeCV(file: File): Promise<CVAnalysisResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/grade-cv`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header when using FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error grading CV:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking grading service health:', error);
      throw error;
    }
  }

  async getAvailableSectors(): Promise<SectorInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sectors`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting sectors:', error);
      throw error;
    }
  }

  formatCVData(cvData: Record<string, any>): string {
    try {
      // Format the CV data into a readable string
      let formatted = '';
      
      if (cvData.Name) {
        formatted += `**Name:** ${cvData.Name}\n\n`;
      }
      
      if (cvData.Email) {
        formatted += `**Email:** ${cvData.Email}\n\n`;
      }
      
      if (cvData.Sector) {
        formatted += `**Sector/Role:** ${cvData.Sector}\n\n`;
      }
      
      // Add other sections
      const sections = ['Skills', 'Experience', 'Education', 'Projects', 'Certifications', 'Languages'];
      
      sections.forEach(section => {
        if (cvData[section]) {
          formatted += `**${section}:**\n`;
          if (Array.isArray(cvData[section])) {
            cvData[section].forEach((item: any, index: number) => {
              if (typeof item === 'string') {
                formatted += `• ${item}\n`;
              } else if (typeof item === 'object') {
                formatted += `• ${JSON.stringify(item, null, 2)}\n`;
              }
            });
          } else if (typeof cvData[section] === 'string') {
            formatted += `${cvData[section]}\n`;
          } else if (typeof cvData[section] === 'object') {
            formatted += `${JSON.stringify(cvData[section], null, 2)}\n`;
          }
          formatted += '\n';
        }
      });
      
      return formatted || 'No structured data available';
    } catch (error) {
      console.error('Error formatting CV data:', error);
      return 'Error formatting CV data';
    }
  }

  getScoreGrade(score: number): { grade: string; color: string; message: string } {
    if (score >= 90) {
      return {
        grade: 'A+',
        color: 'text-green-600',
        message: 'Excellent! Your CV is in the top percentile.'
      };
    } else if (score >= 80) {
      return {
        grade: 'A',
        color: 'text-green-500',
        message: 'Great! Your CV is very competitive.'
      };
    } else if (score >= 70) {
      return {
        grade: 'B+',
        color: 'text-blue-500',
        message: 'Good! Your CV is above average.'
      };
    } else if (score >= 60) {
      return {
        grade: 'B',
        color: 'text-yellow-500',
        message: 'Fair. Consider improving your CV.'
      };
    } else {
      return {
        grade: 'C',
        color: 'text-red-500',
        message: 'Needs improvement. Consider revising your CV.'
      };
    }
  }
}

export const gradingService = new GradingService();
