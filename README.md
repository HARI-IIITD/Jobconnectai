# Team Members information
1. Hari Krishna Sharma (24BDS024) : 24bds024@iiitdwd.ac.in
2. Aayush Jha (24BDS002) : 24bds002@iiitdwd.ac.in
3. Jenish Bhati (24BDS027) : 24bds027@iiitdwd.ac.in
4. Anil Gurjar (24BDS004) : 24bds004@iiitdwd.ac.in  

# JobConnectAI �

A modern AI-powered career platform featuring intelligent CV analysis, HR chatbot assistance, and personalized career guidance with a vibrant, engaging user interface.

## 🎥 Demo Video

**(https://youtube.com/shorts/bqrZfp2_drs?feature=share)**

See JobConnectAI in action! This quick demo showcases:
- **HR Portal**: AI-powered candidate search and CV review
- **Job Seeker Portal**: CV upload, grading, and career guidance
- **AI Chatbot**: Natural language queries and personalized responses
- **Modern UI**: Glass morphism design and smooth animations


## ✨ Key Features

### 🎯 **Role-Based Platform**
- **HR Portal**: Advanced candidate search and CV review system
- **Job Finder Portal**: Personalized career guidance and CV improvement tools
- **Unified Authentication**: Secure login system for both user types

### 🤖 **AI-Powered HR Assistant**
- **RAG Pipeline**: Advanced Retrieval-Augmented Generation using ChromaDB
- **Smart Candidate Search**: Query through 69+ pre-loaded CVs using natural language
- **Real-time Filtering**: Filter by skills, experience, sector, and resume scores
- **Interactive Chat Interface**: Modern messaging UI with typing indicators

### 📊 **Intelligent CV Grading**
- **AI-Powered Analysis**: Machine learning-based comprehensive CV evaluation
- **Competitive Scoring**: Score CVs against sector benchmarks (0-100 scale)
- **Detailed JSON Extraction**: Skills, experience, education, projects, and certifications
- **Multi-format Support**: PDF and DOCX file processing
- **Automatic Sector Detection**: AI-powered role/sector classification

### 💫 **Modern User Experience**
- **Vibrant Light Blue Theme**: Professional yet engaging color scheme
- **Glass Morphism Design**: Modern translucent UI elements
- **Rich Animations**: Floating elements, hover effects, and micro-interactions
- **Mobile-First Responsive**: Optimized for all screen sizes
- **Accessibility Features**: High contrast and readable typography

## 🏗️ Technical Architecture

```
JobConnectAI/
├── frontend/                    # React + TypeScript Frontend
│   ├── src/
│   │   ├── pages/              # Role-specific pages
│   │   │   ├── hr/             # HR dashboard and CV review
│   │   │   └── job-finder/     # Job finder portal
│   │   ├── components/         # shadcn/ui components
│   │   ├── services/           # API integration services
│   │   ├── lib/               # Storage and utilities
│   │   └── index.css          # Global styling and animations
├── AI backend/                 # FastAPI AI Chatbot Backend
│   ├── models/
│   │   ├── rag_pipeline.py    # RAG implementation
│   │   ├── vector_database.py # ChromaDB vector storage
│   │   └── main.py           # FastAPI application
│   └── requirements.txt       # Python dependencies
├── grading backend/            # FastAPI CV Grading Backend
│   ├── src/
│   │   ├── api_server.py     # Grading API server
│   │   ├── parsing/          # Document text extraction
│   │   ├── scoring/          # CV scoring algorithms
│   │   └── nlp/              # NLP processing
│   └── requirements.txt       # Python dependencies
└── README.md                  # This documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Ollama** with `qwen2.5:7b` model
- **Git**

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd JobConnectAI
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend available at:** `http://localhost:8080`

### 3. Start AI Backend

```bash
# Navigate to AI backend
cd "AI backend/models"

# Activate virtual environment
# On Windows:
cd .. && venv\Scripts\activate && cd models
# On macOS/Linux:
cd .. && source venv/bin/activate && cd models

# Start the AI backend server using uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Started server process [xxxx]
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)

**AI Backend available at:** `http://localhost:8000`

### 4. Grading Backend Setup

```bash
cd "../../grading backend"
pip install -r requirements.txt

# Download required NLP model
python -m spacy download en_core_web_sm

# Start the grading backend
cd src
python api_server.py
```

**Grading Backend available at:** `http://localhost:8001`

### 5. Ollama Setup

```bash
# Install Ollama from https://ollama.ai/download

# Pull the required AI model
ollama pull qwen2.5:7b

# Start Ollama service
ollama serve
```

## 🎮 User Guide

### **HR Professionals Workflow**

1. **Login**: Use HR credentials to access the dashboard
2. **AI Assistant**: Interact with the chatbot to find candidates
   - *"Find business analysts with Python experience"*
   - *"Show me candidates with React skills and high scores"*
   - *"Who has fintech experience?"*
3. **CV Review**: Browse filtered candidate profiles with animated cards
4. **Contact Candidates**: Direct email integration for outreach

### **Job Seekers Workflow**

1. **Sign Up**: Create a personalized account
2. **Upload CV**: Submit PDF/DOCX for instant AI analysis
3. **View Results**: See detailed score breakdown and recommendations
4. **Career Guidance**: Chat with AI assistant for personalized advice
   - *"How can I improve my CV score?"*
   - *"What skills should I learn for my target role?"*
   - *"How do I prepare for technical interviews?"*

## 🔐 Default Credentials

**HR Accounts:**
- Username: `hr@jobconnect.com` | Password: `password`
- Username: `john.smith@techcorp.com` | Password: `password`
- Username: `sarah.jones@globalsolutions.com` | Password: `password`

**Job Finder:**
- Create your own account through the signup process

## 🛠️ Technology Stack

### **Frontend Technologies**
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development
- **TailwindCSS** for responsive styling
- **shadcn/ui** for modern UI components
- **React Router** for seamless navigation
- **Sonner** for elegant notifications
- **Lucide React** for beautiful icons

### **AI/ML Infrastructure**
- **FastAPI** for high-performance REST APIs
- **ChromaDB** for vector similarity search
- **Ollama** for local LLM deployment
- **spaCy** for advanced NLP processing
- **Transformers** for AI model integration
- **Scikit-learn** for text analysis

### **Design & UX**
- **Glass Morphism** effects for modern aesthetics
- **CSS Animations** with keyframes and transitions
- **Mobile-First** responsive design
- **Accessibility** optimized with proper contrast ratios
- **Vibrant Light Blue** color theme for professional appeal

## 📊 API Documentation

### **AI Backend** (`localhost:8000`)
```http
GET  /api/health          # Service health check
POST /api/chat           # Send messages to AI assistant
GET  /api/search         # Search CV database
GET  /api/stats          # System statistics
```

### **Grading Backend** (`localhost:8001`)
```http
GET  /api/health         # Service health check
POST /api/grade          # Grade uploaded CV files
GET  /api/sectors        # Available career sectors
```

## 🎨 UI/UX Features

### **Animations & Interactions**
- **Floating Background Elements**: Animated light blue orbs
- **Hover Effects**: Scale, glow, and neon effects
- **Micro-interactions**: Bouncing logos and pulsing icons
- **Staggered Animations**: Progressive element appearance
- **Glass Effects**: Translucent cards with backdrop blur

### **Responsive Design**
- **Mobile Optimized**: Touch-friendly interfaces
- **Tablet Support**: Adaptive layouts for all devices
- **Desktop Enhancement**: Full-featured experience
- **Performance Optimized**: Smooth 60fps animations

## 🧪 Testing & Development

### **Run Tests**
```bash
# Test AI backend integration
cd "AI backend/models"
python test_integration.py

# Test grading system
cd "../../grading backend"
python test_grading_integration.py

# Test CV-aware chatbot
python test_cv_aware_chatbot.py
```

### **Development Tools**
- **Hot Reload**: Instant development feedback
- **TypeScript**: Type-safe development
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting

## ⚙️ Configuration

### **Environment Variables**

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

## 🚀 Performance Features

- **Optimized Response Times**: 8-12 second AI responses
- **Smart Token Management**: Efficient LLM usage
- **Vector Database Caching**: Fast candidate retrieval
- **Progressive Loading**: Smooth user experience
- **Mobile Performance**: Optimized for touch devices

## � Troubleshooting

### **Common Solutions**

1. **Ollama Connection Issues**
   ```bash
   ollama list
   ollama serve
   ```

2. **Missing NLP Models**
   ```bash
   python -m spacy download en_core_web_sm
   ```

3. **Port Conflicts**
   ```bash
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

4. **Frontend Issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🤝 Contributing Guidelines

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 🙏 Acknowledgments

- **Ollama** for local LLM infrastructure
- **FastAPI** for modern Python web framework
- **React & TypeScript** for robust frontend development
- **shadcn/ui** for beautiful component library
- **ChromaDB** for efficient vector storage
- **TailwindCSS** for utility-first styling

**Built with 💎 and modern AI technology for career advancement**
