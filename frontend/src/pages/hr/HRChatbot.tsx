import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getHRSession } from "@/lib/storage";
import { ArrowLeft, MessageSquare, Send, Sparkles, User, Bot, Loader2, AlertCircle } from "lucide-react";
import appLogo from "@/assets/app-logo.png";
import { chatService, ChatMessage, ChatSource } from "@/services/chatService";

const HRChatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getHRSession();
    if (!session) {
      navigate('/hr/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Check backend health on component mount
    checkBackendHealth();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkBackendHealth = async () => {
    try {
      const health = await chatService.checkHealth();
      setIsHealthy(health.status === 'healthy' && health.ollama_status === 'healthy');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setIsHealthy(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setSources([]);

    try {
      const response = await chatService.sendMessage({
        query: userMessage.content,
        conversation_id: conversationId || undefined,
        top_k: 5
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(response.conversation_id);
      setSources(response.sources);
      
      if (isHealthy === false) {
        setIsHealthy(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting to the AI service. Please ensure the backend server is running on localhost:8000 and Ollama is available.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsHealthy(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/hr/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img src={appLogo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-foreground">AI Chatbot</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isHealthy === false && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 text-orange-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Backend Connection Issue</p>
                  <p className="text-sm text-orange-700">
                    Please ensure the AI backend server is running on localhost:8000 and Ollama is available.
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
            <CardTitle className="text-2xl">AI Chatbot Assistant</CardTitle>
            <CardDescription>
              Get AI-powered insights about candidates and recruitment strategies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chat Messages */}
            <div className="bg-secondary rounded-lg p-4 h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Ask me anything about candidates, skills, or recruitment!</p>
                  <div className="mt-4 text-sm space-y-1">
                    <p>• Find candidates with specific skills</p>
                    <p>• Get interview question suggestions</p>
                    <p>• Compare candidate profiles</p>
                    <p>• Market salary insights</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                      <div className="bg-background border rounded-lg px-4 py-2">
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Sources */}
            {sources.length > 0 && (
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">Sources ({sources.length}):</h4>
                <div className="space-y-2">
                  {sources.map((source, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      <span className="font-medium">{source.title}</span>
                      {source.category && <span> • {source.category}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="pt-4 border-t">
              <div className="flex space-x-2">
                <Input 
                  placeholder="Type your message here..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HRChatbot;
