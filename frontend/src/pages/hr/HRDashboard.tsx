import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHRSession, clearHRSession, HRCredentials } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, MessageSquare, LogOut, User } from "lucide-react";
import appLogo from "@/assets/app-logo.png";

const HRDashboard = () => {
  const navigate = useNavigate();
  const [hrData, setHrData] = useState<HRCredentials | null>(null);

  useEffect(() => {
    const session = getHRSession();
    if (!session) {
      navigate('/hr/login');
    } else {
      setHrData(session);
    }
  }, [navigate]);

  const handleLogout = () => {
    clearHRSession();
    navigate('/');
  };

  if (!hrData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={appLogo} alt="Logo" className="w-10 h-10" />
            <h1 className="text-xl font-bold text-foreground">JobConnectAI</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6 animate-fade-in">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-primary-foreground">
                  <AvatarImage src={hrData.profileImage} />
                  <AvatarFallback className="bg-primary-foreground text-primary text-xl">
                    {hrData.companyName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {hrData.username}!</h2>
                  <p className="text-primary-foreground/90">{hrData.companyName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
              onClick={() => navigate('/hr/profile')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your account</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
              onClick={() => navigate('/hr/cv-review')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>CV Review</CardTitle>
                    <CardDescription>Browse candidate resumes</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
              onClick={() => navigate('/hr/chatbot')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>AI Chatbot</CardTitle>
                    <CardDescription>Get AI-powered insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;
