from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Import our modules (assuming they're in the same package)
from vector_database import VectorDatabase, load_qa_data, load_cv_data
try:
    from rag_pipeline import RAGPipeline
except Exception:
    RAGPipeline = None

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI CV Resume Chatbot API",
    description="API for querying CV and Resume data",
    version="1.0.0"
)

# Configure CORS - Allow all origins for development
# In production, replace ["*"] with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Initialize components
vector_database = None
rag_pipeline = None

# Pydantic models
class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="User query")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")
    top_k: Optional[int] = Field(3, ge=1, le=5, description="Number of relevant documents to retrieve")
    cv_context: Optional[Dict[str, Any]] = Field(None, description="User CV context for personalized responses")
    cv_score: Optional[float] = Field(None, description="User CV score for reference")

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict]
    conversation_id: str
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    vector_database_status: str
    vector_database_count: int
    ollama_status: str
    timestamp: str

class StatsResponse(BaseModel):
    total_documents: int
    categories: List[str]
    document_types: List[str]
    collection_name: str


class BuildRequest(BaseModel):
    reset: Optional[bool] = Field(False, description="If true, reset the DB before adding data")
    max_items: Optional[int] = Field(None, description="Max number of items to add (for testing)")
    filename: Optional[str] = Field("Dataset_CV.json", description="Data filename to load from data/raw")

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize components on startup"""
    global vector_database, rag_pipeline
    
    logger.info("Initializing AI CV Resume Chatbot API...")
    
    try:
        # Initialize vector database
        vector_database = VectorDatabase(
            persist_directory=os.getenv("VECTOR_DB_PATH", "../data/vectordb"),
            embedding_model=os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
            collection_name=os.getenv("VECTOR_DB_COLLECTION", "cv_qa")
        )
        logger.info("Vector database initialized")
        
        # Initialize RAG pipeline
        if RAGPipeline:
            try:
                rag_pipeline = RAGPipeline(
                    vector_database=vector_database,
                    ollama_model=os.getenv("OLLAMA_MODEL", "qwen2.5:7b"),
                    ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
                    relevance_threshold=0.15  # Lower threshold to use RAG more easily
                )
                logger.info("RAG pipeline initialized")
            except Exception as e:
                logger.warning(f"RAG pipeline could not be initialized: {e}")
                rag_pipeline = None
        else:
            logger.info("RAG pipeline not available (module import failed). Continuing without it.")
        
        logger.info("API startup complete")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

# Routes
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "AI CV Resume Chatbot API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check API health and component status"""
    try:
        # Check vector DB
        vector_db_count = vector_database.collection.count() if vector_database else 0
        vector_db_status = "healthy" if vector_db_count > 0 else "empty"
        
        # Check Ollama
        ollama_status = "healthy" if rag_pipeline and rag_pipeline.check_ollama() else "unavailable"
        
        return HealthResponse(
            status="healthy",
            vector_database_status=vector_db_status,
            vector_database_count=vector_db_count,
            ollama_status=ollama_status,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats", response_model=StatsResponse, tags=["Statistics"])
async def get_stats():
    """Get database statistics"""
    try:
        if not vector_database:
            raise HTTPException(status_code=500, detail="Vector database not initialized")
        
        stats = vector_database.get_stats()
        return StatsResponse(**stats)
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.options("/api/chat", tags=["Chat"])
async def chat_options():
    """Handle CORS preflight for chat endpoint"""
    return {"message": "OK"}

@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """Process chat query and return response"""
    try:
        if not rag_pipeline:
            raise HTTPException(status_code=500, detail="RAG pipeline not initialized")
        
        logger.info(f"Processing query: {request.query[:100]}...")
        
        # Enhance query with CV context if provided
        enhanced_query = request.query
        if request.cv_context:
            # Ultra-minimal CV context for speed
            cv_parts = []
            
            if request.cv_score is not None:
                cv_parts.append(f"Score:{request.cv_score}")
            
            if request.cv_context.get('Sector'):
                cv_parts.append(f"Role:{request.cv_context['Sector']}")
            
            if request.cv_context.get('Skills'):
                skills = request.cv_context['Skills']
                if isinstance(skills, list) and len(skills) > 0:
                    cv_parts.append(f"Skills:{skills[0]}")  # Only first skill
            
            # Ultra-short prompt
            if cv_parts:
                cv_summary = " ".join(cv_parts)
                enhanced_query = f"{cv_summary}. {request.query} Be brief."
                logger.info(f"Query enhanced with minimal CV context")
        
        # Generate response using RAG pipeline
        result = rag_pipeline.query(
            query=enhanced_query,
            top_k=1,  # Always use only 1 document for maximum speed
            conversation_id=request.conversation_id
        )
        
        # Prepare sources
        sources = []
        for doc, metadata in zip(result['documents'], result['metadatas']):
            # Extract CV information from the response field
            response_text = metadata.get('response', '')
            name = sector = None
            
            # Parse name from response
            if '**Name:**' in response_text:
                name_line = [line for line in response_text.split('\n') if '**Name:**' in line]
                if name_line:
                    name = name_line[0].replace('**Name:**', '').strip()
            
            # Parse sector from response  
            if '**Sector/Role:**' in response_text:
                sector_line = [line for line in response_text.split('\n') if '**Sector/Role:**' in line]
                if sector_line:
                    sector = sector_line[0].replace('**Sector/Role:**', '').strip()
            
            source = {
                "title": name or "Unknown Candidate",
                "source": metadata.get('source', 'CV Database'),
                "category": sector or "Unknown Sector",
                "url": metadata.get('url', ''),
                "preview": doc[:200] + "..." if len(doc) > 200 else doc
            }
            sources.append(source)
        
        return ChatResponse(
            response=result['response'],
            sources=sources,
            conversation_id=result['conversation_id'],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search", tags=["Search"])
async def search_documents(query: str, top_k: int = 5):
    """Search for relevant documents without generating response"""
    try:
        if not vector_database:
            raise HTTPException(status_code=500, detail="Vector database not initialized")
        
        results = vector_database.search(query, n_results=top_k)

        documents = []
        docs = results.get('documents', [[]])[0]
        metadatas = results.get('metadatas', [[]])[0]
        distances = results.get('distances', [[]])[0] if 'distances' in results else [None] * len(docs)

        for doc, metadata, dist in zip(docs, metadatas, distances):
            # Extract CV information from the response field
            response_text = metadata.get('response', '')
            name = sector = email = None
            
            # Parse name from response
            if '**Name:**' in response_text:
                name_line = [line for line in response_text.split('\n') if '**Name:**' in line]
                if name_line:
                    name = name_line[0].replace('**Name:**', '').strip()
            
            # Parse sector from response  
            if '**Sector/Role:**' in response_text:
                sector_line = [line for line in response_text.split('\n') if '**Sector/Role:**' in line]
                if sector_line:
                    sector = sector_line[0].replace('**Sector/Role:**', '').strip()
            
            # Parse email from response
            if '**Email:**' in response_text:
                email_line = [line for line in response_text.split('\n') if '**Email:**' in line]
                if email_line:
                    email = email_line[0].replace('**Email:**', '').strip()
            
            documents.append({
                "id": metadata.get('id'),
                "name": name,
                "sector": sector,
                "email": email,
                "instruction": metadata.get('instruction'),
                "response": metadata.get('response'),
                "content_preview": doc[:400] + "..." if len(doc) > 400 else doc,
                "score": None if dist is None else float(dist)
            })

        return {
            "query": query,
            "results": documents,
            "count": len(documents)
        }
        
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/build-db", tags=["Admin"])
async def build_database(req: BuildRequest):
    """Build or update the vector database from the JSON files.

    This endpoint allows the frontend or admin to trigger a non-interactive build.
    """
    try:
        if not vector_database:
            raise HTTPException(status_code=500, detail="Vector database not initialized")

        if req.reset:
            vector_database.reset_database()

        # Use CV data loading function if it's the CV dataset
        if req.filename == "Dataset_CV.json":
            data = load_cv_data(req.filename, "../scrapers/data/raw")
        else:
            data = load_qa_data(req.filename, "../scrapers/data/raw")
            
        if not data:
            raise HTTPException(status_code=404, detail="No data found to load")

        if req.max_items:
            data = data[:req.max_items]

        vector_database.add_documents(data, batch_size=100)

        return {"status": "ok", "added": len(data)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error building DB: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/doc/{doc_id}", tags=["Documents"])
async def get_document(doc_id: str):
    """Fetch a document by its numeric id or 'qa_<id>' format."""
    try:
        if not vector_database:
            raise HTTPException(status_code=500, detail="Vector database not initialized")

        # Normalize id
        if doc_id.startswith("qa_"):
            lookup_id = doc_id
        else:
            lookup_id = f"qa_{doc_id}"

        result = vector_database.collection.get(ids=[lookup_id])

        if not result or not result.get('ids'):
            raise HTTPException(status_code=404, detail="Document not found")

        # Chroma returns lists per field
        return {
            "id": result['ids'][0],
            "document": result.get('documents', [[]])[0][0] if result.get('documents') else None,
            "metadata": result.get('metadatas', [[]])[0][0] if result.get('metadatas') else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document {doc_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)