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
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center space-x-3">
            <img src={appLogo} alt="Logo" className="w-12 h-12" />
            <Search className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Job Finder Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to continue your job search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:scale-105"
              />
            </div>
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:scale-105"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full animate-fade-in hover:scale-105 transition-transform duration-200" 
              disabled={isLoading}
              style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center text-sm animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold hover:scale-105 transition-transform"
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
