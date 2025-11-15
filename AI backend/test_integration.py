#!/usr/bin/env python3
"""
Test script to verify the AI backend integration
"""

import requests
import json
import sys
import time

def test_backend_connection():
    """Test if the backend is running and accessible"""
    print("🔍 Testing backend connection...")
    
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Backend is healthy!")
            print(f"   - Status: {health['status']}")
            print(f"   - Vector DB: {health['vector_database_status']} ({health['vector_database_count']} docs)")
            print(f"   - Ollama: {health['ollama_status']}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend at http://localhost:8000")
        print("   Make sure the backend is running with: python main.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

def test_chat_endpoint():
    """Test the chat endpoint with a simple query"""
    print("\n💬 Testing chat endpoint...")
    
    try:
        payload = {
            "query": "Find business analysts with Python experience",
            "top_k": 3
        }
        
        response = requests.post(
            "http://localhost:8000/api/chat",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat endpoint working!")
            print(f"   - Response length: {len(result['response'])} characters")
            print(f"   - Sources found: {len(result['sources'])}")
            print(f"   - Conversation ID: {result['conversation_id'][:8]}...")
            
            # Show preview of response
            response_preview = result['response'][:200] + "..." if len(result['response']) > 200 else result['response']
            print(f"   - Response preview: {response_preview}")
            
            return True
        else:
            print(f"❌ Chat endpoint returned status {response.status_code}")
            try:
                error = response.json()
                print(f"   Error: {error.get('detail', 'Unknown error')}")
            except:
                print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Chat request timed out (30s)")
        return False
    except Exception as e:
        print(f"❌ Error testing chat endpoint: {e}")
        return False

def test_search_endpoint():
    """Test the search endpoint"""
    print("\n🔍 Testing search endpoint...")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/search?query=python&top_k=3",
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Search endpoint working!")
            print(f"   - Results found: {result['count']}")
            
            for i, doc in enumerate(result['results'][:2], 1):
                name = doc.get('name', 'Unknown')
                sector = doc.get('sector', 'Unknown')
                print(f"   - Result {i}: {name} ({sector})")
            
            return True
        else:
            print(f"❌ Search endpoint returned status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing search endpoint: {e}")
        return False

def main():
    """Run all integration tests"""
    print("=" * 60)
    print("AI Backend Integration Test")
    print("=" * 60)
    
    # Test backend connection
    if not test_backend_connection():
        print("\n❌ Backend connection failed. Please start the backend first:")
        print("   cd 'AI backend/models'")
        print("   python main.py")
        sys.exit(1)
    
    # Test chat endpoint
    chat_ok = test_chat_endpoint()
    
    # Test search endpoint
    search_ok = test_search_endpoint()
    
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    
    if chat_ok and search_ok:
        print("✅ All tests passed! The integration is ready.")
        print("\n📝 Next steps:")
        print("   1. Start the frontend: cd frontend && npm run dev")
        print("   2. Navigate to HR section and open the AI Chatbot")
        print("   3. Try queries like:")
        print("      - 'Find business analysts with Python experience'")
        print("      - 'Who has MBA in Business Analytics?'")
        print("      - 'Show me data scientists with machine learning skills'")
    else:
        print("⚠️  Some tests failed. Check the error messages above.")
        if not chat_ok:
            print("   - Chat endpoint issue: Check Ollama installation and model")
        if not search_ok:
            print("   - Search endpoint issue: Check vector database setup")

if __name__ == "__main__":
    main()
