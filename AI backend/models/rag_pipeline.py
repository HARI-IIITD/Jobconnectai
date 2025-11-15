import requests
import json
import logging
from typing import Dict, List, Optional
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGPipeline:
    """Retrieval-Augmented Generation pipeline for CV and resume queries"""
    
    def __init__(
        self,
        vector_database,
        ollama_model: str = "qwen2.5:7b",
        ollama_base_url: str = "http://localhost:11434",
        temperature: float = 0.1,  # Reduced for faster, more deterministic responses
        relevance_threshold: float = 0.25 # Lower threshold to use RAG less often
    ):
        self.vector_db = vector_database
        self.ollama_model = ollama_model
        self.ollama_base_url = ollama_base_url
        self.temperature = temperature
        self.relevance_threshold = relevance_threshold
        self.conversations = {}  # Store conversation history
        
        logger.info(f"RAG Pipeline initialized with model: {ollama_model}")
        logger.info(f"Relevance threshold: {relevance_threshold}")
        logger.info("Domain: CV and Resume analysis")
    
    def check_ollama(self) -> bool:
        """Check if Ollama is running and model is available"""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                model_names = [m['name'] for m in models]
                return any(self.ollama_model in name for name in model_names)
            return False
        except Exception as e:
            logger.error(f"Error checking Ollama: {e}")
            return False
    
    def retrieve_context(self, query: str, top_k: int = 3) -> Dict:
        """Retrieve relevant documents from vector database"""
        logger.info(f"Retrieving top {top_k} documents for query")
        
        results = self.vector_db.search(query, n_results=top_k)
        
        return {
            'documents': results['documents'][0],
            'metadatas': results['metadatas'][0],
            'distances': results.get('distances', [[]])[0]
        }
    
    def build_prompt(
        self,
        query: str,
        context_docs: List[str],
        context_metadata: List[Dict],
        conversation_history: List[Dict] = None,
        use_rag: bool = True
    ) -> str:
        """Build prompt for LLM with or without retrieved context"""
        
        if use_rag:
            # RAG mode: Use database context
            system_prompt = """You are an AI career assistant specializing in CV and resume analysis, recruitment, and career guidance. 
Your role is to provide accurate, helpful, and well-informed responses based on the provided CV/resume data.

Guidelines:
1. Answer questions clearly, comprehensively, and in a conversational manner
2. Base your answers on the provided CV and resume examples from the database
3. Cite candidate names and reference IDs when using specific information
4. Provide complete explanations with examples where applicable
5. Focus on skills, qualifications, experience, and career-related information
6. If asked about career advice, provide practical suggestions based on the data patterns

Context from CV/Resume Database:
"""
            
            # Add context documents with sources (now Q&A pairs)
            for i, (doc, metadata) in enumerate(zip(context_docs, context_metadata), 1):
                source_info = f"[Reference {i}]"
                
                # Extract CV/resume information from metadata
                name = metadata.get('Name', 'Unknown Candidate')
                sector = metadata.get('Sector', 'Unknown Sector')
                email = metadata.get('Email', 'No email')
                cv_id = metadata.get('id', str(i))
                
                system_prompt += f"\n{source_info} (ID: {cv_id}):\n"
                system_prompt += f"Candidate: {name}\n"
                system_prompt += f"Sector: {sector}\n"
                if email and email != 'No email':
                    system_prompt += f"Email: {email}\n"
                system_prompt += f"Profile: {doc}\n"
        else:
            # Pure LLM mode: No database context, use general knowledge
            system_prompt = """You are an AI career assistant with expertise in CV/resume analysis, recruitment, and career guidance.

Guidelines:
1. Answer questions clearly, comprehensively, and in a conversational manner
2. Use your general knowledge about careers, skills, and recruitment
3. Provide practical career advice and suggestions
4. Focus on professional development and job-related guidance
5. If you're not certain about specific career details, acknowledge it
6. Suggest ways to improve skills or find relevant opportunities

Note: This response is based on general career knowledge. For specific candidate information from our database, please try rephrasing your query with more specific keywords.
"""
        
        # Add conversation history if available
        prompt = system_prompt + "\n\nConversation:\n"
        
        if conversation_history:
            for msg in conversation_history[-3:]:  # Last 3 exchanges
                role = msg['role'].capitalize()
                prompt += f"{role}: {msg['content']}\n"
        
        # Add current query
        prompt += f"User: {query}\nAssistant: "
        
        return prompt
    
    def generate_response(self, prompt: str, max_tokens: int = 300) -> str:
        """Generate response using Ollama"""
        try:
            url = f"{self.ollama_base_url}/api/generate"
            
            payload = {
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": self.temperature,
                    "num_predict": max_tokens,  # Reduced for faster responses
                    "num_ctx": 1024,  # Further reduced context window
                    "top_k": 10,  # Further reduced sampling
                    "top_p": 0.7,  # Even faster sampling
                    "repeat_penalty": 1.05,  # Minimal repeat penalty
                    "mirostat": 2,  # Enable mirostat for faster, more consistent responses
                    "mirostat_tau": 3.0,  # Target entropy
                    "mirostat_eta": 0.1  # Learning rate
                }
            }
            
            logger.info("Generating response from Ollama...")
            response = requests.post(url, json=payload, timeout=30)  # Reduced timeout
            response.raise_for_status()
            
            result = response.json()
            return result.get('response', '').strip()
            
        except requests.exceptions.Timeout:
            logger.error("Ollama request timed out")
            return "I apologize, but the response is taking too long. Please try a shorter question."
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return f"I apologize, but I encountered an error. Please try again."
    
    def get_conversation_history(self, conversation_id: str) -> List[Dict]:
        """Get conversation history for a given ID"""
        return self.conversations.get(conversation_id, [])
    
    def update_conversation_history(
        self,
        conversation_id: str,
        user_query: str,
        assistant_response: str
    ):
        """Update conversation history"""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        self.conversations[conversation_id].extend([
            {"role": "user", "content": user_query},
            {"role": "assistant", "content": assistant_response}
        ])
        
        # Keep only last 10 messages (5 exchanges)
        if len(self.conversations[conversation_id]) > 10:
            self.conversations[conversation_id] = self.conversations[conversation_id][-10:]
    
    def query(
        self,
        query: str,
        top_k: int = 5,
        conversation_id: Optional[str] = None
    ) -> Dict:
        """
        Main query method - orchestrates the entire RAG pipeline
        
        Args:
            query: User query
            top_k: Number of documents to retrieve
            conversation_id: Optional conversation ID for context
            
        Returns:
            Dictionary with response, sources, conversation_id, and mode (rag/llm)
        """
        # Generate conversation ID if not provided
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
        
        # Step 1: Retrieve relevant context
        context = self.retrieve_context(query, top_k=top_k)
        
        # Step 2: Check relevance - use distance/similarity score
        # ChromaDB returns distances (lower = more similar)
        # If all distances are high (low similarity), use pure LLM mode
        distances = context.get('distances', [1.0] * top_k)
        avg_distance = sum(distances) / len(distances) if distances else 1.0
        
        # Convert distance to similarity score (0-1, where 1 is most similar)
        avg_similarity = 1 - avg_distance
        
        use_rag = avg_similarity >= self.relevance_threshold
        
        if use_rag:
            logger.info(f"Using RAG mode (similarity: {avg_similarity:.3f})")
        else:
            logger.info(f"Using pure LLM mode (similarity too low: {avg_similarity:.3f})")
        
        # Step 3: Get conversation history
        history = self.get_conversation_history(conversation_id)
        
        # Step 4: Build prompt (with or without RAG)
        if use_rag:
            prompt = self.build_prompt(
                query=query,
                context_docs=context['documents'],
                context_metadata=context['metadatas'],
                conversation_history=history,
                use_rag=True
            )
        else:
            prompt = self.build_prompt(
                query=query,
                context_docs=[],
                context_metadata=[],
                conversation_history=history,
                use_rag=False
            )
        
        # Step 5: Generate response with optimized token limit
        response = self.generate_response(prompt, max_tokens=250)
        
        # Step 6: Update conversation history
        self.update_conversation_history(conversation_id, query, response)
        
        # Return complete result
        return {
            'response': response,
            'documents': context['documents'] if use_rag else [],
            'metadatas': context['metadatas'] if use_rag else [],
            'conversation_id': conversation_id,
            'mode': 'rag' if use_rag else 'llm',
            'similarity_score': avg_similarity
        }

def test_rag_pipeline():
    """Test the RAG pipeline with CV/resume data"""
    from vector_database import VectorDatabase
    
    # Initialize components
    print("Initializing Vector Database...")
    vector_db = VectorDatabase(
        persist_directory="../data/vectordb",
        collection_name="cv_qa"
    )
    
    # Check if DB has data
    db_count = vector_db.collection.count()
    print(f"Vector DB contains {db_count} CV/resume records")
    
    if db_count == 0:
        print("\n⚠️  Vector database is empty!")
        print("Please run: python vector_database.py to populate it first")
        return
    
    print("Initializing RAG Pipeline...")
    rag = RAGPipeline(vector_database=vector_db)
    
    # Check Ollama
    if not rag.check_ollama():
        print("\n⚠️  Warning: Ollama is not running or model is not available")
        print(f"Please ensure Ollama is running and execute: ollama pull {rag.ollama_model}")
        print("\nContinuing with retrieval test only...\n")
        
        # Test retrieval only
        test_query = "business analyst with python skills"
        print(f"Testing retrieval for: {test_query}")
        print("-" * 60)
        
        results = rag.retrieve_context(test_query, top_k=3)
        print(f"\nFound {len(results['documents'])} relevant CV records:\n")
        
        for i, (doc, metadata) in enumerate(zip(results['documents'], results['metadatas']), 1):
            print(f"{i}. Candidate ID: {metadata.get('id')}")
            print(f"   Name: {metadata.get('Name', 'Unknown')}")
            print(f"   Sector: {metadata.get('Sector', 'Unknown')}")
            print(f"   Profile Preview: {doc[:150]}...")
            print()
        
        return
    
    # Test queries
    test_queries = [
        "Find business analysts with Python experience",
        "Who has MBA in Business Analytics?",
        "Show me data scientists with machine learning skills"
    ]
    
    print("\n" + "="*60)
    print("Testing RAG Pipeline with CV/Resume Data")
    print("="*60)
    
    conversation_id = None
    
    for query in test_queries:
        print(f"\n❓ Query: {query}")
        print("-" * 60)
        
        result = rag.query(query, top_k=3, conversation_id=conversation_id)
        conversation_id = result['conversation_id']
        
        mode = result.get('mode', 'rag').upper()
        similarity = result.get('similarity_score', 0.0)
        print(f"🔍 Mode: {mode} (Similarity: {similarity:.3f})\n")
        
        print(f"💬 Response:\n{result['response']}\n")
        
        if result.get('metadatas'):
            print("📚 Sources from CV Database:")
            for i, metadata in enumerate(result['metadatas'], 1):
                name = metadata.get('Name', 'Unknown')
                sector = metadata.get('Sector', 'Unknown')
                cv_id = metadata.get('id', 'N/A')
                print(f"  {i}. [ID: {cv_id}] {name} - {sector}")
        else:
            print("📚 No database sources used (pure LLM response)")
        print()

if __name__ == "__main__":
    test_rag_pipeline()