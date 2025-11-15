#!/usr/bin/env python3
"""
Test script to verify the CV grading integration
"""

import requests
import json
import os
from pathlib import Path

def test_grading_backend():
    """Test the CV grading backend"""
    print("🔍 Testing CV Grading Backend...")
    
    # Test health endpoint
    try:
        response = requests.get("http://localhost:8001/api/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Grading backend is healthy!")
            print(f"   - Status: {health['status']}")
            print(f"   - Spacy loaded: {health['spacy_loaded']}")
            print(f"   - Classifier loaded: {health['classifier_loaded']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to grading backend: {e}")
        return False
    
    # Test sectors endpoint
    try:
        response = requests.get("http://localhost:8001/api/sectors", timeout=10)
        if response.status_code == 200:
            sectors = response.json()
            print(f"✅ Sectors endpoint working!")
            print(f"   - Total sectors: {sectors['total_sectors']}")
            for sector, count in list(sectors['sectors'].items())[:3]:
                print(f"   - {sector}: {count} CVs")
        else:
            print(f"⚠️  Sectors endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Error testing sectors: {e}")
    
    return True

def find_test_cv():
    """Find a test CV file"""
    # Look for CV files in the grading backend data
    cv_dirs = [
        "c:/ACADEMICS/JobConnectAI/grading baackend/data/resumes_raw",
        "c:/ACADEMICS/JobConnectAI/grading baackend/data/resumes_raw/HR_Manager_CVs",
        "c:/ACADEMICS/JobConnectAI/grading baackend/data/resumes_raw/Marketing_Specialist_CVs"
    ]
    
    for cv_dir in cv_dirs:
        if os.path.exists(cv_dir):
            for file in os.listdir(cv_dir):
                if file.lower().endswith('.pdf'):
                    return os.path.join(cv_dir, file)
    
    return None

def test_cv_grading():
    """Test CV grading with a real file"""
    print("\n📄 Testing CV Grading...")
    
    cv_file = find_test_cv()
    if not cv_file:
        print("❌ No test CV file found")
        return False
    
    print(f"📁 Using test file: {os.path.basename(cv_file)}")
    
    try:
        with open(cv_file, 'rb') as f:
            files = {'file': (os.path.basename(cv_file), f, 'application/pdf')}
            response = requests.post(
                "http://localhost:8001/api/grade-cv",
                files=files,
                timeout=60
            )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ CV grading successful!")
            print(f"   - Success: {result['success']}")
            print(f"   - Score: {result.get('score', 'N/A')}/100")
            print(f"   - Sector: {result.get('sector', 'N/A')}")
            print(f"   - Message: {result['message']}")
            
            if result.get('extracted_data'):
                print(f"   - Extracted fields: {list(result['extracted_data'].keys())}")
            
            return True
        else:
            print(f"❌ CV grading failed: {response.status_code}")
            try:
                error = response.json()
                print(f"   Error: {error.get('detail', 'Unknown error')}")
            except:
                print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing CV grading: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("CV Grading Integration Test")
    print("=" * 60)
    
    # Test backend
    if not test_grading_backend():
        print("\n❌ Backend tests failed. Please check the grading backend.")
        return
    
    # Test CV grading
    grading_ok = test_cv_grading()
    
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    
    if grading_ok:
        print("✅ All tests passed! The CV grading integration is ready.")
        print("\n📝 Next steps:")
        print("   1. Start the frontend: cd frontend && npm run dev")
        print("   2. Navigate to Job Finder section")
        print("   3. Upload a CV to test the grading functionality")
        print("   4. View the extracted JSON data and score")
    else:
        print("⚠️  Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()
