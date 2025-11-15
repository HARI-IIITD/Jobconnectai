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
    <div className="min-h-screen hero-gradient">
      <header className="glass-effect border-b border-border/20 shadow-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/job-finder/dashboard')} className="hover:bg-white/10 hover-zoom">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <img src={appLogo} alt="Logo" className="w-10 h-10 hover-bounce" />
            <h1 className="text-xl font-black gradient-text">AI Career Assistant</h1>
          </div>
          <div className="flex items-center space-x-2">
            {cvData && (
              <div className="flex items-center space-x-2 mr-3">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground font-bold hidden sm:inline">
                  Score: {cvData.score}/100
                </span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={resetChat} className="glass-effect hover-neon border-border/20 font-bold">
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {isHealthy === false && (
          <Card className="mb-4 border-orange-200 bg-orange-50 glass-effect hover-neon">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3 text-orange-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">AI Backend Connection Issue</p>
                  <p className="text-sm text-orange-700">
                    Please ensure the AI backend is running on 10.0.2.176:8000.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glass-effect animate-fade-in hover-neon">
          <CardHeader className="text-center space-y-3 pb-4">
            <div className="mx-auto w-14 h-14 rounded-full gradient-bg flex items-center justify-center hover-bounce">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-black gradient-text">
              {cvData ? "Personalized Career Assistant" : "AI Career Assistant"}
            </CardTitle>
            <CardDescription className="text-sm text-foreground font-bold">
              {cvData 
                ? "Get personalized advice based on your CV profile and career goals"
                : "Upload your CV to get personalized career advice, or ask general questions"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="glass-effect rounded-2xl p-4 h-[500px] overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] lg:max-w-[60%] px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'gradient-bg text-white shadow-lg hover-scale'
                        : 'glass-effect text-foreground border border-border/20 hover-glow'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {message.sender === 'user' ? (
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover-wiggle">
                          <User className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center hover-wiggle">
                          <Bot className="w-3 h-3" />
                        </div>
                      )}
                      <span className="text-xs font-bold opacity-70">
                        {message.sender === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] lg:max-w-[60%] glass-effect text-foreground border border-border/20 px-4 py-3 rounded-2xl hover-glow">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-bold">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className="glass-effect p-4 rounded-2xl border border-border/20">
                <h4 className="text-sm font-bold gradient-text flex items-center mb-3">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Sources
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {sources.map((source, index) => (
                    <div key={index} className="text-xs p-3 glass-effect rounded-xl border border-border/10">
                      <div className="font-bold text-foreground">{source.title}</div>
                      <div className="text-muted-foreground mt-1">{source.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && messages.length <= 1 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold gradient-text">Get started with these questions:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedQuestions.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-xs h-auto py-3 px-4 whitespace-normal text-left justify-start glass-effect hover-glow border-border/20"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex space-x-3">
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
                className="flex-1 glass-effect border-border/20 focus:border-primary/50"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !input.trim()}
                size="sm"
                className="gradient-bg hover-glow px-6"
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
