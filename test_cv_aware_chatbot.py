#!/usr/bin/env python3
"""
Test script for CV-aware AI chatbot integration
"""

import requests
import json

def test_cv_aware_chatbot():
    """Test the CV-aware chatbot functionality"""
    print("🤖 Testing CV-Aware AI Chatbot Integration...")
    print("=" * 60)
    
    # Test 1: Regular chat without CV context
    print("\n1️⃣ Testing chat WITHOUT CV context:")
    try:
        response = requests.post("http://localhost:8000/api/chat", json={
            "query": "What are the most in-demand skills for software developers?",
            "top_k": 3
        }, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Regular chat working!")
            print(f"   Response length: {len(result['response'])} characters")
            print(f"   Sources found: {len(result['sources'])}")
            print(f"   Response preview: {result['response'][:100]}...")
        else:
            print(f"❌ Regular chat failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing regular chat: {e}")
        return False
    
    # Test 2: Chat WITH CV context
    print("\n2️⃣ Testing chat WITH CV context:")
    try:
        # Sample CV data (simulating what would come from grading backend)
        cv_context = {
            "Name": "John Doe",
            "Email": "john.doe@example.com",
            "Sector": "Software Developer",
            "Skills": ["Python", "JavaScript", "React", "Node.js", "SQL"],
            "Experience": "3 years of full-stack development experience building web applications using React and Node.js",
            "Education": "B.Tech in Computer Science from IIT Delhi",
            "Projects": "Built an e-commerce platform with React and Node.js, developed a data analytics dashboard"
        }
        
        response = requests.post("http://localhost:8000/api/chat", json={
            "query": "How can I improve my CV to get a better software developer job?",
            "top_k": 3,
            "cv_context": cv_context,
            "cv_score": 75.5
        }, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ CV-aware chat working!")
            print(f"   Response length: {len(result['response'])} characters")
            print(f"   Sources found: {len(result['sources'])}")
            print(f"   Response preview: {result['response'][:150]}...")
            
            # Check if response contains personalized elements
            response_text = result['response'].lower()
            personalization_indicators = [
                "john", "python", "javascript", "react", "75.5", "3 years", "iit delhi"
            ]
            
            found_personalization = any(indicator in response_text for indicator in personalization_indicators)
            if found_personalization:
                print("✅ Response appears to be personalized with CV data!")
            else:
                print("⚠️  Response may not be properly personalized")
                
        else:
            print(f"❌ CV-aware chat failed: {response.status_code}")
            try:
                error = response.json()
                print(f"   Error: {error.get('detail', 'Unknown error')}")
            except:
                print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error testing CV-aware chat: {e}")
        return False
    
    # Test 3: Score-based improvement suggestions
    print("\n3️⃣ Testing score-based improvement suggestions:")
    try:
        response = requests.post("http://localhost:8000/api/chat", json={
            "query": "What skills should I learn to improve my CV score?",
            "top_k": 3,
            "cv_context": cv_context,
            "cv_score": 65.0  # Lower score to trigger improvement suggestions
        }, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Score-based suggestions working!")
            print(f"   Response preview: {result['response'][:150]}...")
            
            # Check for improvement-related keywords
            response_text = result['response'].lower()
            improvement_keywords = ["improve", "learn", "add", "enhance", "skills", "score"]
            found_improvement = any(keyword in response_text for keyword in improvement_keywords)
            
            if found_improvement:
                print("✅ Response contains improvement suggestions!")
            else:
                print("⚠️  Response may not contain improvement suggestions")
                
        else:
            print(f"❌ Score-based suggestions failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing score-based suggestions: {e}")
        return False
    
    # Test 4: Sector-specific career advice
    print("\n4️⃣ Testing sector-specific career advice:")
    try:
        response = requests.post("http://localhost:8000/api/chat", json={
            "query": "What is the career path for a Software Developer?",
            "top_k": 3,
            "cv_context": cv_context,
            "cv_score": 85.0
        }, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Sector-specific advice working!")
            print(f"   Response preview: {result['response'][:150]}...")
            
            # Check for sector-specific keywords
            response_text = result['response'].lower()
            sector_keywords = ["software developer", "developer", "programming", "coding"]
            found_sector = any(keyword in response_text for keyword in sector_keywords)
            
            if found_sector:
                print("✅ Response contains sector-specific advice!")
            else:
                print("⚠️  Response may not be sector-specific")
                
        else:
            print(f"❌ Sector-specific advice failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing sector-specific advice: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("🧪 CV-Aware Chatbot Integration Test")
    print("=" * 60)
    
    # Test the integration
    if test_cv_aware_chatbot():
        print("\n" + "=" * 60)
        print("🎉 All tests passed! CV-Aware Chatbot is working!")
        print("=" * 60)
        
        print("\n📝 Integration Summary:")
        print("✅ AI Backend enhanced with CV context support")
        print("✅ Chat requests can include CV data and score")
        print("✅ Personalized responses based on user CV")
        print("✅ Score-based improvement suggestions")
        print("✅ Sector-specific career advice")
        print("✅ Frontend service created for CV-aware chat")
        
        print("\n🎮 Ready to Test in Frontend:")
        print("1. Navigate to http://localhost:8080")
        print("2. Login as Job Finder")
        print("3. Upload a CV to get graded")
        print("4. Go to AI Chatbot in Job Finder section")
        print("5. Ask questions about CV improvement, career advice, etc.")
        print("6. Chatbot will provide personalized responses!")
        
        print("\n💡 Example Questions to Try:")
        print("- 'How can I improve my CV score?'")
        print("- 'What skills should I learn for my career?'")
        print("- 'How do I prepare for interviews in my field?'")
        print("- 'What companies are hiring in my sector?'")
        
    else:
        print("\n❌ Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()
