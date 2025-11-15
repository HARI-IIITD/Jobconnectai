#!/usr/bin/env python3
"""
Test script to demonstrate CV chatbot functionality
"""

import requests
import json

def test_search():
    """Test the search endpoint"""
    print("Testing CV Search...")
    print("=" * 50)
    
    api_url = "http://localhost:8000/api/search"
    
    # Test queries
    queries = [
        "business analyst",
        "python", 
        "MBA",
        "data scientist"
    ]
    
    for query in queries:
        print(f"\n🔍 Searching for: {query}")
        try:
            response = requests.post(f"{api_url}?query={query}&top_k=3", timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Found {result['count']} results:")
                
                for i, doc in enumerate(result['results'][:2], 1):
                    name = doc.get('name', 'Unknown')
                    sector = doc.get('sector', 'Unknown') 
                    email = doc.get('email', 'Unknown')
                    print(f"  {i}. {name} - {sector}")
                    if isinstance(email, list) and email:
                        print(f"     📧 {email[0]}")
                    
            else:
                print(f"❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"💥 Error: {e}")

def test_chat():
    """Test the chat endpoint"""
    print("\n\nTesting AI Chat...")
    print("=" * 50)
    
    api_url = "http://localhost:8000/api/chat"
    
    # Test questions
    questions = [
        "Find business analysts with Python experience",
        "Who has MBA in Business Analytics?",
        "Show me data scientists"
    ]
    
    for question in questions:
        print(f"\n❓ Question: {question}")
        try:
            payload = {"query": question}
            headers = {"Content-Type": "application/json"}
            
            response = requests.post(api_url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                answer = result['response']
                
                # Show first 300 characters of answer
                preview = answer[:300] + "..." if len(answer) > 300 else answer
                print(f"🤖 Answer: {preview}")
                
                if result.get('sources'):
                    print(f"📚 Sources: {len(result['sources'])} found")
                    
            else:
                print(f"❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"💥 Error: {e}")

def check_health():
    """Check API health"""
    print("Checking API Health...")
    print("=" * 50)
    
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        
        if response.status_code == 200:
            health = response.json()
            print(f"✅ API Status: {health['status']}")
            print(f"📊 Database: {health['vector_database_status']} ({health['vector_database_count']} documents)")
            print(f"🤖 Ollama: {health['ollama_status']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            
    except Exception as e:
        print(f"💥 Cannot connect to API: {e}")
        print("Make sure the server is running: python main.py")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 CV Resume Chatbot Test")
    print("=" * 60)
    
    # Check if API is running
    if check_health():
        # Test search functionality
        test_search()
        
        # Test chat functionality
        test_chat()
        
        print("\n\n✅ Tests completed!")
        print("\nTo run interactively:")
        print("1. Start server: python main.py")
        print("2. Use curl or Postman to test:")
        print('   curl -X POST "http://localhost:8000/api/chat" -H "Content-Type: application/json" -d \'{"query": "Find business analysts"}\'')
    else:
        print("\n❌ Please start the API server first:")
        print("   python main.py")
