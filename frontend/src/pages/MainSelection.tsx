import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Search, Sparkles, ArrowRight, Zap, Star, Flame } from "lucide-react";
import appLogo from "@/assets/app-logo.png";

const MainSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hero-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-sky-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-wiggle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse"></div>
      </div>

      <div className="w-full max-w-2xl px-4 py-6 space-y-8 animate-fade-in relative z-10">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 rainbow-bg rounded-full blur-2xl opacity-60 animate-pulse"></div>
            <img 
              src={appLogo} 
              alt="JobConnectAI Logo" 
              className="relative w-24 h-24 md:w-40 md:h-40 mx-auto animate-scale-in hover-bounce"
            />
            <div className="absolute -top-2 -right-2">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Star className="w-4 h-4 md:w-6 md:h-6 text-sky-400 animate-wiggle" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-black gradient-text animate-pulse">JobConnectAI</h1>
            <p className="text-lg md:text-2xl text-foreground font-bold hover-neon">💎 AI-Powered Career Revolution 💎</p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-3 text-foreground font-bold">
              <Sparkles className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
              <span className="text-sm md:text-lg">Smart Resume Scoring & Perfect Job Matches</span>
              <Sparkles className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card 
            className="group glass-effect p-6 md:p-10 cursor-pointer transition-all duration-700 hover:shadow-2xl hover:-translate-y-4 hover:scale-105 animate-fade-in hover-neon border-0"
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
            onClick={() => navigate('/hr/login')}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl gradient-bg flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 hover-bounce">
                  <Briefcase className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="space-y-1 md:space-y-2 text-center md:text-left">
                  <h3 className="text-xl md:text-3xl font-black text-foreground group-hover:text-primary transition-colors duration-300">I'm an HR</h3>
                  <p className="text-sm md:text-lg font-bold text-muted-foreground">Find top talent with AI precision 🎯</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Flame className="w-5 h-5 md:w-6 md:h-6 text-cyan-500 animate-pulse" />
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:translate-x-3 group-hover:scale-125 transition-all duration-300" />
              </div>
            </div>
          </Card>

          <Card 
            className="group glass-effect p-6 md:p-10 cursor-pointer transition-all duration-700 hover:shadow-2xl hover:-translate-y-4 hover:scale-105 animate-fade-in hover-neon border-0"
            style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
            onClick={() => navigate('/job-finder/signup')}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl gradient-bg flex items-center justify-center group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 hover-bounce">
                  <Search className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <div className="space-y-1 md:space-y-2 text-center md:text-left">
                  <h3 className="text-xl md:text-3xl font-black text-foreground group-hover:text-primary transition-colors duration-300">Job Finder</h3>
                  <p className="text-sm md:text-lg font-bold text-muted-foreground">Land your dream career path 🚀</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-sky-500 animate-wiggle" />
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:translate-x-3 group-hover:scale-125 transition-all duration-300" />
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <p className="text-lg md:text-xl font-black gradient-text">Choose your journey ✨</p>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-sm md:text-lg font-bold">
            <span className="px-3 py-1 md:px-4 md:py-2 rounded-full glass-effect hover-glow">🚀 Powered by AI</span>
            <span className="px-3 py-1 md:px-4 md:py-2 rounded-full glass-effect hover-glow">⚡ Lightning Fast</span>
            <span className="px-3 py-1 md:px-4 md:py-2 rounded-full glass-effect hover-glow">🎯 Precision Matching</span>
            <span className="px-3 py-1 md:px-4 md:py-2 rounded-full glass-effect hover-glow">💎 Dream Jobs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSelection;
