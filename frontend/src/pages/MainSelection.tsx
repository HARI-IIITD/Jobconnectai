import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Search } from "lucide-react";
import appLogo from "@/assets/app-logo.png";

const MainSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <img 
            src={appLogo} 
            alt="JobConnectAI Logo" 
            className="w-24 h-24 mx-auto mb-4 animate-scale-in"
          />
          <h1 className="text-4xl font-bold text-foreground">JobConnectAI</h1>
          <p className="text-muted-foreground text-lg">AI-Powered Resume Scoring & Job Connection</p>
        </div>

        <div className="space-y-4">
          <Card 
            className="p-6 cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 bg-card border-2 border-border animate-fade-in hover:border-primary/50"
            style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
            onClick={() => navigate('/hr/login')}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-card-foreground">I'm an HR</h3>
                <p className="text-sm text-muted-foreground">Find the perfect candidates</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 bg-card border-2 border-border animate-fade-in hover:border-primary/50"
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
            onClick={() => navigate('/job-finder/signup')}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Search className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-card-foreground">I'm a Job Finder</h3>
                <p className="text-sm text-muted-foreground">Discover your dream job</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Select your role to continue</p>
        </div>
      </div>
    </div>
  );
};

export default MainSelection;
