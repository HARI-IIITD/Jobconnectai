# JobConnectAI 🚀

A comprehensive AI-powered job platform featuring intelligent CV grading, HR chatbot assistance, and personalized career guidance.

## ✨ Features

### 🔍 **AI-Powered HR Chatbot**
- **RAG Pipeline**: Advanced Retrieval-Augmented Generation for accurate responses
- **CV Database Search**: Search through 69+ pre-loaded CVs and candidate profiles
- **Real-time Assistance**: Help HR professionals find suitable candidates
- **Smart Filtering**: Filter by skills, experience, sector, and more

### 📊 **CV Grading System**
- **AI-Powered Analysis**: Uses machine learning for comprehensive CV evaluation
- **Competitive Scoring**: Score CVs against others in the same sector (0-100 scale)
- **Detailed Feedback**: JSON extraction of skills, experience, education, and projects
- **Multiple Formats**: Support for PDF and DOCX files
- **Sector Identification**: Automatic sector/role detection using AI

### 🎯 **Job Finder Dashboard**
- **CV Upload & Analysis**: Upload CV for instant grading and feedback
- **Personalized Career Assistant**: AI chatbot that knows your CV and provides tailored advice
- **Score Improvement Tips**: Get specific recommendations to improve your CV score
- **Career Guidance**: Sector-specific career advice and skill recommendations

### ⚡ **Performance Optimized**
- **Fast Response Times**: Optimized for 8-12 second responses
- **Smart Context Handling**: Intelligent CV context processing
- **Error Handling**: Comprehensive timeout and error management
- **Responsive Design**: Modern UI built with React and TypeScript

## 🏗️ Architecture

```
JobConnectAI/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/           # HR and Job Finder pages
│   │   ├── services/        # API services for chat and grading
│   │   ├── components/      # UI components (shadcn/ui)
│   │   └── lib/            # Storage and utilities
├── AI backend/              # FastAPI AI chatbot backend
│   ├── models/
│   │   ├── rag_pipeline.py # RAG implementation
│   │   ├── vector_database.py # ChromaDB integration
│   │   └── main.py         # FastAPI application
│   └── scrapers/           # Web scraping utilities
├── grading backend/         # FastAPI CV grading backend
│   ├── src/
│   │   ├── api_server.py   # Grading API server
│   │   ├── parsing/        # CV text extraction
│   │   ├── scoring/        # CV scoring algorithms
│   │   └── nlp/            # NLP processing
│   └── requirements.txt    # Python dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Ollama** with `qwen2.5:7b` model
- **Git**

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd JobConnectAI
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:8080`

### 3. Setup AI Backend

```bash
cd "../AI backend"
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Start the backend
cd models
python main.py
```

AI Backend will be available at: `http://localhost:8000`

### 4. Setup Grading Backend

```bash
cd "../../grading backend"
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Start the backend
cd src
python api_server.py
```

Grading Backend will be available at: `http://localhost:8001`

### 5. Setup Ollama

```bash
# Install Ollama (if not already installed)
# https://ollama.ai/download

# Pull the required model
ollama pull qwen2.5:7b

# Start Ollama service
ollama serve
```

## 🎮 Usage Guide

### **For HR Professionals**

1. **Login**: Use credentials like `hr@jobconnect.com` / `password`
2. **AI Chatbot**: Ask questions to find suitable candidates
   - "Find business analysts with Python experience"
   - "Show me candidates with React skills"
   - "Who has experience in fintech?"
3. **CV Review**: Browse and review candidate profiles

### **For Job Seekers**

1. **Sign Up**: Create a new account or login
2. **Upload CV**: Upload your CV (PDF/DOCX) for instant grading
3. **View Analysis**: See your score and detailed JSON breakdown
4. **Get Career Advice**: Chat with AI assistant for personalized guidance
   - "How can I improve my CV score?"
   - "What skills should I learn for my career?"
   - "How do I prepare for interviews in my field?"

### **Default Login Credentials**

**HR Accounts:**
- Username: `hr@jobconnect.com` | Password: `password`
- Username: `john.smith@techcorp.com` | Password: `password`
- Username: `sarah.jones@globalsolutions.com` | Password: `password`

**Job Finder:**
- Create your own account or use existing credentials

## 🛠️ Technical Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **shadcn/ui** for components
- **React Router** for navigation
- **Sonner** for notifications

### **AI Backend**
- **FastAPI** for REST API
- **ChromaDB** for vector storage
- **Ollama** for LLM integration
- **spaCy** for NLP processing
- **Transformers** for AI models

### **Grading Backend**
- **FastAPI** for REST API
- **spaCy** for text processing
- **Transformers** for sector classification
- **Scikit-learn** for TF-IDF scoring
- **python-docx** for document parsing

### **AI/ML Models**
- **qwen2.5:7b** for chatbot responses
- **en_core_web_sm** for NLP processing
- **Zero-shot classification** for sector detection
- **TF-IDF + Cosine Similarity** for CV scoring

## 📊 API Endpoints

### **AI Backend** (`localhost:8000`)
- `GET /api/health` - Health check
- `POST /api/chat` - Send chat messages
- `GET /api/search` - Search CV database
- `GET /api/stats` - Get system statistics

### **Grading Backend** (`localhost:8001`)
- `GET /api/health` - Health check
- `POST /api/grade` - Grade CV file
- `GET /api/sectors` - Get available sectors

## 🧪 Testing

### **Run Integration Tests**

```bash
# Test AI backend
cd "AI backend/models"
python test_integration.py

# Test grading backend
cd "../../grading backend"
python test_grading_integration.py

# Test CV-aware chatbot
python test_cv_aware_chatbot.py
```

## 🔧 Configuration

### **Environment Variables**

Create `.env` files in each backend directory:

**AI Backend (.env):**
```env
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_BASE_URL=http://localhost:11434
```

**Frontend (.env):**
```env
VITE_AI_API_URL=http://localhost:8000
VITE_GRADING_API_URL=http://localhost:8001
```

## 🚀 Performance Optimizations

- **Response Times**: Optimized to 8-12 seconds
- **Token Limits**: Reduced for faster generation
- **Document Retrieval**: Limited to essential documents
- **CV Context**: Smart processing with fallbacks
- **Caching**: Implemented for frequently accessed data

## 🐛 Troubleshooting

### **Common Issues**

1. **Ollama Connection Error**
   ```bash
   # Check if Ollama is running
   ollama list
   
   # Restart Ollama service
   ollama serve
   ```

2. **Spacy Model Not Found**
   ```bash
   python -m spacy download en_core_web_sm
   ```

3. **Port Already in Use**
   ```bash
   # Find and kill process on port
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

4. **Frontend Build Issues**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ollama** for providing the LLM infrastructure
- **FastAPI** for the modern Python web framework
- **React** and **TypeScript** for the frontend framework
- **shadcn/ui** for the beautiful UI components
- **ChromaDB** for the vector database

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

---

**Built with ❤️ for job seekers and HR professionals**
