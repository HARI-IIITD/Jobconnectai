# AI CV Resume Chatbot Backend

A FastAPI-based backend service for querying CV and resume data using Retrieval-Augmented Generation (RAG) with vector database search and Ollama integration.

## 🚀 Features

- **Vector Database Search**: ChromaDB with sentence-transformers embeddings
- **RAG Pipeline**: Intelligent document retrieval with LLM generation
- **RESTful API**: FastAPI with automatic documentation
- **CORS Support**: Cross-origin requests enabled for frontend integration
- **Health Monitoring**: Built-in health check endpoints
- **Conversation Management**: Session-based chat with context retention

## 📋 Prerequisites

### Required Software
- **Python 3.8+**
- **Ollama** (for LLM inference)
- **Git** (optional, for cloning)

### System Requirements
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 2GB free space for models and data
- **Network**: Internet connection for initial model downloads

## 🛠️ Installation

### 1. Clone or Download the Repository
```bash
# If using git
git clone <repository-url>
cd "Chatbot backend/AI backend"

# Or download and extract the files to your desired location
```

### 2. Create and Activate Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Install and Setup Ollama

#### Windows
```bash
# Download and install Ollama from https://ollama.ai/download
# After installation, restart your terminal/command prompt
```

#### macOS/Linux
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

### 5. Download the Language Model
```bash
# Pull the recommended model (Qwen2.5:7b)
ollama pull qwen2.5:7b

# Alternative models (optional)
ollama pull llama3.2:3b
ollama pull mistral:7b
```

## 📁 Project Structure

```
AI backend/
├── models/
│   ├── main.py              # FastAPI application entry point
│   ├── rag_pipeline.py      # RAG implementation
│   ├── vector_database.py   # Vector database management
│   └── chat_interface.py    # Chat utilities
├── scrapers/
│   └── data/
│       └── raw/
│           └── Dataset_CV.json  # CV/Resume data
├── data/
│   └── vectordb/            # Vector database storage
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🚀 Running the Application

### Step 1: Prepare the Vector Database

The vector database needs to be populated with CV/resume data before running the API:

```bash
# Navigate to the models directory
cd models

# Run the vector database setup
python vector_database.py
```

This will:
- Load CV data from `../scrapers/data/raw/Dataset_CV.json`
- Create embeddings using sentence-transformers
- Store vectors in ChromaDB at `../data/vectordb`

### Step 2: Start the API Server

```bash
# From the models directory
python main.py

# Or use uvicorn directly for more options
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:
- **Main API**: `http://localhost:8000`
- **Documentation**: `http://localhost:8000/docs`
- **Alternative Docs**: `http://localhost:8000/redoc`

### Step 3: Verify the Setup

1. **Check API Health**
   ```bash
   curl http://localhost:8000/api/health
   ```

2. **Check Database Stats**
   ```bash
   curl http://localhost:8000/api/stats
   ```

3. **Test a Query**
   ```bash
   curl -X POST "http://localhost:8000/api/chat" \
        -H "Content-Type: application/json" \
        -d '{"query": "Find business analysts with Python skills"}'
   ```

## 📚 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint with API info |
| GET | `/api/health` | Health check of all components |
| GET | `/api/stats` | Database statistics |
| POST | `/api/chat` | Main chat/query endpoint |
| POST | `/api/search` | Search documents without LLM response |
| GET | `/api/doc/{doc_id}` | Retrieve specific document by ID |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/build-db` | Build/rebuild vector database |

### Example API Usage

#### Chat Query
```bash
curl -X POST "http://localhost:8000/api/chat" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "Who has experience in machine learning?",
       "top_k": 5,
       "conversation_id": "optional-session-id"
     }'
```

#### Search Documents
```bash
curl -X POST "http://localhost:8000/api/search?query=data scientist&top_k=3"
```

#### Build Database
```bash
curl -X POST "http://localhost:8000/api/build-db" \
     -H "Content-Type: application/json" \
     -d '{
       "reset": false,
       "max_items": 1000,
       "filename": "Dataset_CV.json"
     }'
```

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file in the `models` directory:

```env
# Vector Database Configuration
VECTOR_DB_PATH=../data/vectordb
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
VECTOR_DB_COLLECTION=cv_qa

# Ollama Configuration
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_BASE_URL=http://localhost:11434

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

### Model Configuration

You can modify the models in `rag_pipeline.py`:

```python
# Change the default model
rag_pipeline = RAGPipeline(
    vector_database=vector_db,
    ollama_model="llama3.2:3b",  # Change this
    relevance_threshold=0.2       # Adjust sensitivity
)
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Ollama Connection Failed
**Error**: `Ollama is not running or model is not available`

**Solution**:
```bash
# Start Ollama service
ollama serve

# In a new terminal, pull the model
ollama pull qwen2.5:7b

# Verify Ollama is working
curl http://localhost:11434/api/tags
```

#### 2. Vector Database Empty
**Error**: `Vector database is empty`

**Solution**:
```bash
# Rebuild the database
cd models
python vector_database.py

# Or use the API endpoint
curl -X POST "http://localhost:8000/api/build-db" \
     -H "Content-Type: application/json" \
     -d '{"reset": true}'
```

#### 3. Port Already in Use
**Error**: `Port 8000 is already in use`

**Solution**:
```bash
# Use a different port
uvicorn main:app --host 0.0.0.0 --port 8001

# Or kill the existing process (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or kill the existing process (macOS/Linux)
lsof -ti:8000 | xargs kill -9
```

#### 4. Memory Issues
**Error**: `Out of memory` or slow responses

**Solution**:
- Use a smaller model: `ollama pull qwen2.5:3b`
- Increase system RAM or close other applications
- Reduce `top_k` parameter in queries
- Adjust `relevance_threshold` in RAG pipeline

#### 5. CORS Errors (Frontend Integration)
**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
The API is configured for CORS with all origins allowed for development. For production, update the CORS settings in `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Specific domains
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### Performance Optimization

1. **Use GPU Acceleration** (if available):
   ```bash
   # Install PyTorch with CUDA support
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

2. **Optimize Vector Search**:
   - Reduce `top_k` parameter for faster searches
   - Use smaller embedding models for faster indexing

3. **Cache Management**:
   - Vector database is automatically persisted
   - Clear cache if needed: delete `data/vectordb` directory

## 🧪 Testing

### Test the RAG Pipeline
```bash
cd models
python rag_pipeline.py
```

### Test Individual Components
```bash
# Test vector database
python vector_database.py

# Test chat interface
python chat_interface.py
```

## 📊 Monitoring

### Health Checks
```bash
# Full health check
curl http://localhost:8000/api/health

# Expected response
{
  "status": "healthy",
  "vector_database_status": "healthy",
  "vector_database_count": 1000,
  "ollama_status": "healthy",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Database Statistics
```bash
curl http://localhost:8000/api/stats
```

## 🚀 Production Deployment

### Docker Deployment (Recommended)

1. **Create Dockerfile**:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Build and Run**:
```bash
docker build -t cv-chatbot-api .
docker run -p 8000:8000 cv-chatbot-api
```

### Environment Considerations

- **Security**: Configure specific CORS origins for production
- **Scaling**: Consider load balancer for multiple API instances
- **Monitoring**: Add logging and metrics collection
- **Backups**: Regular backups of vector database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check API logs for detailed error messages
4. Ensure Ollama is running and the model is downloaded
5. Verify the vector database is populated

## 🔄 Version History

- **v1.0.0**: Initial release with RAG pipeline and FastAPI integration
- CV/Resume data search and retrieval
- Ollama integration for LLM responses
- Vector database with ChromaDB
- RESTful API with documentation
