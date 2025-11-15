#!/usr/bin/env python3
"""
FastAPI server for CV grading and analysis
"""

import os
import json
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any, Optional
import logging

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import our modules
from parsing.pdf_text import extract_text_from_pdf
from parsing.docx_text import extract_text_from_docx
from parsing.resume_parser import extract_name, extract_email, extract_sections, identify_sector
from scoring.score import rank_cvs_in_sector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="CV Grading API",
    description="API for uploading, parsing, and grading CVs",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# -----------------------------
# 📁 PATH SETUP
# -----------------------------
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RAW_DIR = os.path.join(BASE_DIR, "data", "resumes_raw")
TEXT_DIR = os.path.join(BASE_DIR, "data", "resumes_text")
JSON_DIR = os.path.join(BASE_DIR, "data", "cv_jsons")

for d in [RAW_DIR, TEXT_DIR, JSON_DIR]:
    os.makedirs(d, exist_ok=True)

# -----------------------------
# 🧠 LOAD MODELS
# -----------------------------
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    logger.info("Spacy model loaded successfully")
except Exception as e:
    logger.warning(f"Could not load spacy model: {e}")
    nlp = None

try:
    from transformers import pipeline
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    logger.info("Transformers classifier loaded successfully")
except Exception as e:
    logger.warning(f"Could not load transformers model: {e}")
    classifier = None

# -----------------------------
# 🔧 HELPER FUNCTIONS
# -----------------------------
def identify_sector_ai(cv_text: str) -> str:
    """
    Identify the job sector of a CV using a zero-shot classification model.
    """
    if not classifier:
        # Fallback to rule-based identification
        return identify_sector(cv_text) or "General"

    # Define sector labels
    candidate_labels = [
        "Software Developer",
        "Data Scientist", 
        "Product Manager",
        "UI/UX Designer",
        "DevOps Engineer",
        "Business Analyst",
        "Marketing Specialist",
        "Prompt Engineer",
        "Cybersecurity Engineer",
        "Human Resources Manager",
        "Finance Analyst"
    ]

    try:
        # Run the AI model
        result = classifier(
            sequences=cv_text,
            candidate_labels=candidate_labels,
            multi_label=False
        )

        # Get the top label
        best_sector = result["labels"][0]
        confidence = result["scores"][0]

        logger.info(f"Predicted Sector: {best_sector} (Confidence: {confidence:.2f})")
        return best_sector
    except Exception as e:
        logger.error(f"Error in AI sector identification: {e}")
        return identify_sector(cv_text) or "General"

def extract_all_info(text: str) -> Dict[str, Any]:
    """Extract all information from CV text"""
    try:
        sections = extract_sections(text)
        final_data = {
            "Name": extract_name(text),
            "Email": extract_email(text),
            "Sector": identify_sector_ai(text),
            **sections
        }
        return final_data
    except Exception as e:
        logger.error(f"Error extracting info: {e}")
        return {
            "Name": "Unknown",
            "Email": "Unknown",
            "Sector": "General",
            "Error": str(e)
        }

# -----------------------------
# 📊 PYDANTIC MODELS
# -----------------------------
class CVAnalysisResponse(BaseModel):
    success: bool
    message: str
    extracted_data: Optional[Dict[str, Any]] = None
    score: Optional[float] = None
    sector: Optional[str] = None
    json_data: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    spacy_loaded: bool
    classifier_loaded: bool
    timestamp: str

# -----------------------------
# 🚀 API ROUTES
# -----------------------------
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "CV Grading API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check API health and model status"""
    from datetime import datetime
    return HealthResponse(
        status="healthy",
        spacy_loaded=nlp is not None,
        classifier_loaded=classifier is not None,
        timestamp=datetime.now().isoformat()
    )

@app.post("/api/grade-cv", response_model=CVAnalysisResponse, tags=["CV Grading"])
async def grade_cv(file: UploadFile = File(...)):
    """
    Upload and grade a CV file (PDF or DOCX)
    
    Returns:
    - Extracted CV information
    - AI-identified sector
    - Score compared to other CVs in the same sector
    - Complete JSON data
    """
    
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF and DOCX files are supported"
        )
    
    # Create temporary file
    temp_file = None
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
        
        logger.info(f"Processing file: {file.filename}")
        
        # Extract text based on file type
        if file.filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(temp_file_path)
        elif file.filename.lower().endswith('.docx'):
            text = extract_text_from_docx(temp_file_path)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type"
            )
        
        if not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the file"
            )
        
        logger.info(f"Extracted {len(text)} characters of text")
        
        # Identify sector using AI
        logger.info("Identifying sector using AI...")
        sector = identify_sector_ai(text)
        main_sector = sector.split("(")[0].strip()
        
        # Extract structured information
        logger.info("Extracting structured information...")
        extracted_data = extract_all_info(text)
        extracted_data["Sector"] = main_sector
        
        # Create sector folder
        sector_dir = os.path.join(JSON_DIR, main_sector.replace(" ", "_"))
        os.makedirs(sector_dir, exist_ok=True)
        
        # Save JSON data
        json_filename = Path(file.filename).stem + ".json"
        json_file_path = os.path.join(sector_dir, json_filename)
        
        with open(json_file_path, "w", encoding="utf-8") as f:
            json.dump(extracted_data, f, indent=4, ensure_ascii=False)
        
        logger.info(f"Saved JSON data to: {json_file_path}")
        
        # Score the CV against others in the same sector
        logger.info("Scoring CV against sector peers...")
        try:
            sector_scores = rank_cvs_in_sector(sector_dir)
            user_score = sector_scores.get(json_filename, 0.0)
            logger.info(f"CV scored: {user_score}/100")
        except Exception as e:
            logger.error(f"Error scoring CV: {e}")
            user_score = 0.0
        
        return CVAnalysisResponse(
            success=True,
            message="CV analyzed successfully",
            extracted_data=extracted_data,
            score=user_score,
            sector=main_sector,
            json_data=extracted_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing CV: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing CV: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)

@app.get("/api/sectors", tags=["Data"])
async def get_available_sectors():
    """Get list of available sectors with CV counts"""
    try:
        sectors = {}
        for item in os.listdir(JSON_DIR):
            sector_path = os.path.join(JSON_DIR, item)
            if os.path.isdir(sector_path):
                json_count = len([f for f in os.listdir(sector_path) if f.endswith('.json')])
                sectors[item.replace('_', ' ')] = json_count
        
        return {
            "sectors": sectors,
            "total_sectors": len(sectors)
        }
    except Exception as e:
        logger.error(f"Error getting sectors: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# 🚀 RUN SERVER
# -----------------------------
if __name__ == "__main__":
    logger.info("Starting CV Grading API server...")
    logger.info(f"Base directory: {BASE_DIR}")
    logger.info(f"JSON directory: {JSON_DIR}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,  # Different port to avoid conflict with AI backend
        reload=False
    )
