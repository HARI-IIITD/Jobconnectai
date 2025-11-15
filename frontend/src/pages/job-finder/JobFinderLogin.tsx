import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validateJobFinderLogin, setJobFinderSession } from "@/lib/storage";
import { toast } from "sonner";
import { ArrowLeft, Search } from "lucide-react";
import appLogo from "@/assets/app-logo.png";

const JobFinderLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const profile = validateJobFinderLogin(email, password);
      if (profile) {
        setJobFinderSession(email);
        toast.success(`Welcome back, ${profile.fullName}!`);
        navigate('/job-finder/dashboard');
      } else {
        toast.error("Invalid credentials. Please check your email and password.");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in glass-effect border-border/20 hover-neon">
        <CardHeader className="space-y-4 pb-6">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit hover:bg-white/10 hover-zoom"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center space-x-3">
            <img src={appLogo} alt="Logo" className="w-16 h-16 hover-bounce" />
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center hover-scale">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl md:text-2xl text-center font-bold gradient-text">Job Finder Login</CardTitle>
          <CardDescription className="text-center text-sm md:text-base">
            Sign in to continue your job search
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
              <Label htmlFor="email" className="text-sm font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 glass-effect border-border/20 focus:border-primary/50 hover-glow"
              />
            </div>
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <Label htmlFor="password" className="text-sm font-bold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 glass-effect border-border/20 focus:border-primary/50 hover-glow"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 animate-fade-in gradient-bg hover-neon font-bold text-base" 
              disabled={isLoading}
              style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button 
                variant="link" 
                className="p-0 h-auto font-bold hover:scale-105 transition-transform text-primary"
                onClick={() => navigate('/job-finder/signup')}
              >
                Sign up here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobFinderLogin;
