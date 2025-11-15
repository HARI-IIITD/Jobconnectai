#!/usr/bin/env python3
"""
Interactive Chat Interface for CV Resume Chatbot
"""

import requests
import json
import sys

def chat_with_cv_bot():
    """Interactive chat interface for CV queries"""
    
    print("=" * 60)
    print("CV Resume Chatbot - Interactive Mode")
    print("=" * 60)
    print("Type your questions about CVs and resumes below.")
    print("Type 'quit', 'exit', or 'q' to exit.")
    print("Type 'help' for example questions.")
    print("-" * 60)
    
    api_url = "http://localhost:8000/api/chat"
    
    while True:
        try:
            # Get user input
            question = input("\n❓ Your question: ").strip()
            
            # Check for exit commands
            if question.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye!")
                break
            
            # Check for help command
            if question.lower() == 'help':
                print("\n📝 Example questions you can ask:")
                print("• Find business analysts with Python experience")
                print("• Who has MBA in Business Analytics?")
                print("• Show me data scientists with machine learning skills")
                print("• Find candidates with Power BI experience")
                print("• Who worked as Senior Business Analyst?")
                print("• Show me candidates from IIM Bangalore")
                print("• Find people with SQL and Python skills")
                continue
            
            # Skip empty questions
            if not question:
                continue
            
            print(f"\n🔍 Searching: {question}")
            print("⏳ Processing...")
            
            # Make API request
            payload = {"query": question}
            headers = {"Content-Type": "application/json"}
            
            response = requests.post(api_url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"\n🤖 Answer:")
                print("-" * 40)
                print(result['response'])
                print("-" * 40)
                
                # Show sources if available
                if result.get('sources'):
                    print(f"\n📚 Sources ({len(result['sources'])}):")
                    for i, source in enumerate(result['sources'], 1):
                        print(f"{i}. {source['title']} - {source['category']}")
                        if source.get('preview'):
                            preview = source['preview'][:150] + "..." if len(source['preview']) > 150 else source['preview']
                            print(f"   Preview: {preview}")
                        print()
                else:
                    print("\n⚠️  No specific sources found for this query.")
                    
            else:
                print(f"\n❌ Error: {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"Details: {error_detail.get('detail', 'Unknown error')}")
                except:
                    print(f"Response: {response.text}")
                    
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except requests.exceptions.Timeout:
            print("\n⏰ Request timed out. Please try again.")
        except requests.exceptions.ConnectionError:
            print("\n🔌 Cannot connect to the API server.")
            print("Make sure the server is running on http://localhost:8000")
            print("Run: python main.py")
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")

def search_cv_data():
    """Search CV data without LLM generation"""
    
    print("=" * 60)
    print("CV Data Search - Direct Search Mode")
    print("=" * 60)
    print("Type keywords to search in CV database.")
    print("Type 'quit', 'exit', or 'q' to exit.")
    print("-" * 60)
    
    api_url = "http://localhost:8000/api/search"
    
    while True:
        try:
            # Get user input
            query = input("\n🔍 Search keywords: ").strip()
            
            # Check for exit commands
            if query.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye!")
                break
            
            # Skip empty queries
            if not query:
                continue
            
            print(f"\n🔍 Searching for: {query}")
            
            # Make API request
            response = requests.post(f"{api_url}?query={query}&top_k=5", timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"\n📊 Found {result['count']} results:")
                print("=" * 60)
                
                for i, doc in enumerate(result['results'], 1):
                    print(f"\n{i}. 📋 {doc.get('name', 'Unknown')}")
                    print(f"   🏢 Sector: {doc.get('sector', 'Unknown')}")
                    print(f"   📧 Email: {doc.get('email', 'Unknown')}")
                    print(f"   📄 Preview: {doc.get('content_preview', 'No preview')[:200]}...")
                    print(f"   🎯 Score: {doc.get('score', 'N/A')}")
                    print("-" * 40)
                    
            else:
                print(f"\n❌ Error: {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"Details: {error_detail.get('detail', 'Unknown error')}")
                except:
                    print(f"Response: {response.text}")
                    
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n💥 Unexpected error: {e}")

if __name__ == "__main__":
    print("Choose mode:")
    print("1. Chat with AI (requires Ollama)")
    print("2. Direct Search (faster, no AI)")
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == "1":
        chat_with_cv_bot()
    elif choice == "2":
        search_cv_data()
    else:
        print("Invalid choice. Running chat mode...")
        chat_with_cv_bot()
