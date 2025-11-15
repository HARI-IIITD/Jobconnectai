import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getJobFinderSession, getCVData } from "@/lib/storage";
import { ArrowLeft, Send, Sparkles, User, Bot, Loader2, AlertCircle, FileText, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import appLogo from "@/assets/app-logo.png";
import { 
  jobFinderChatService, 
  JobFinderChatMessage, 
  JobFinderChatSource 
} from "@/services/jobFinderChatService";

const JobFinderChatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<JobFinderChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<JobFinderChatSource[]>([]);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [cvData, setCvData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getJobFinderSession();
    if (!session) {
      navigate('/job-finder/login');
      return;
    }

    // Load CV data and check backend health
    loadCVData();
    checkBackendHealth();
  }, [navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const loadCVData = () => {
    const data = getCVData();
    setCvData(data);
    
    if (data) {
      // Generate personalized suggested questions
      const questions = jobFinderChatService.generateSuggestedQuestions();
      setSuggestedQuestions(questions);
      
      // Add welcome message with CV context
      const welcomeMessage: JobFinderChatMessage = {
        id: "welcome",
        content: `Hello! I can help you improve your CV and career prospects. I can see you've uploaded your CV${data.score ? ` with a score of ${data.score}/100` : ''}. ${data.extractedData?.Sector ? ` You're in the ${data.extractedData.Sector} sector.` : ''} How can I assist you today?`,
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else {
      // Add welcome message without CV
      const welcomeMessage: JobFinderChatMessage = {
        id: "welcome",
        content: "Hello! I'm your AI career assistant. Upload your CV first to get personalized advice, or ask me general questions about career development, resume writing, and interview preparation.",
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Generate general suggested questions
      const generalQuestions = [
        "What are the most in-demand skills in the job market?",
        "How can I improve my resume?",
        "What industries are hiring right now?",
        "How do I prepare for a technical interview?"
      ];
      setSuggestedQuestions(generalQuestions);
    }
  };

  const checkBackendHealth = async () => {
    try {
      const health = await jobFinderChatService.checkHealth();
      setIsHealthy(health.status === 'healthy');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setIsHealthy(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: JobFinderChatMessage = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setSources([]);

    try {
      const response = await jobFinderChatService.sendMessage({
        query: userMessage.content,
        top_k: 1  // Use 1 document for maximum speed
      });

      const assistantMessage: JobFinderChatMessage = {
        id: Date.now().toString(),
        content: response.response,
        sender: "assistant",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSources(response.sources);
      
      if (isHealthy === false) {
        setIsHealthy(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: JobFinderChatMessage = {
        id: Date.now().toString(),
        content: "I'm having trouble connecting right now. Please ensure the AI backend is running and try again.",
        sender: "assistant",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsHealthy(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    loadCVData();
    setSources([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/job-finder/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img src={appLogo} alt="Logo" className="w-10 h-10" />
            <h1 className="text-xl font-bold text-foreground">AI Career Assistant</h1>
          </div>
          <div className="flex items-center space-x-2">
            {cvData && (
              <div className="flex items-center space-x-2 mr-4">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  CV Score: {cvData.score}/100
                </span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={resetChat}>
              Reset Chat
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isHealthy === false && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 text-orange-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">AI Backend Connection Issue</p>
                  <p className="text-sm text-orange-700">
                    Please ensure the AI backend is running on localhost:8000.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {cvData ? "Personalized Career Assistant" : "AI Career Assistant"}
            </CardTitle>
            <CardDescription>
              {cvData 
                ? "Get personalized advice based on your CV profile and career goals"
                : "Upload your CV to get personalized career advice, or ask general questions"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Messages */}
            <div className="bg-muted rounded-lg p-4 h-96 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">
                        {message.sender === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-background border rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Relevant Sources
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {sources.map((source, index) => (
                    <div key={index} className="text-xs p-2 bg-secondary rounded border">
                      <div className="font-medium">{source.title}</div>
                      <div className="text-muted-foreground">{source.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && messages.length <= 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Suggested Questions:</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs h-auto py-2 px-3 whitespace-normal text-left"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  cvData 
                    ? "Ask about improving your CV, career advice, interview tips..."
                    : "Ask about career development, resume writing, interview preparation..."
                }
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !input.trim()}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {!cvData && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Want personalized advice?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto"
                    onClick={() => navigate('/job-finder/dashboard')}
                  >
                    Upload your CV first
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JobFinderChatbot;
