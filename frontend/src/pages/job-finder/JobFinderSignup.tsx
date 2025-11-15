import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveJobFinderProfile, setJobFinderSession, getJobFinderProfile } from "@/lib/storage";
import { toast } from "sonner";
import { ArrowLeft, Search } from "lucide-react";
import appLogo from "@/assets/app-logo.png";

const JobFinderSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '',
    degree: '',
    college: '',
    experience: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (getJobFinderProfile()) {
      toast.error("An account already exists. Please login instead.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const profile = {
        ...formData,
        age: parseInt(formData.age),
        skills: [], // Empty skills array
      };
      
      saveJobFinderProfile(profile);
      setJobFinderSession(formData.email);
      toast.success("Account created successfully!");
      navigate('/job-finder/dashboard');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-fade-in shadow-lg">
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
          <CardTitle className="text-2xl text-center">Create Your Profile</CardTitle>
          <CardDescription className="text-center">
            Join JobConnectAI and find your dream job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  required
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                placeholder="e.g., B.Tech in Computer Science"
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                required
                className="transition-all duration-200 focus:scale-105"
              />
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
              <Label htmlFor="college">College/University *</Label>
              <Input
                id="college"
                placeholder="e.g., IIT Madras"
                value={formData.college}
                onChange={(e) => setFormData({...formData, college: e.target.value})}
                required
                className="transition-all duration-200 focus:scale-105"
              />
            </div>

            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
              <Label htmlFor="experience">Experience (Optional)</Label>
              <Input
                id="experience"
                placeholder="e.g., 2 years in Web Development"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="transition-all duration-200 focus:scale-105"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full animate-fade-in hover:scale-105 transition-transform duration-200" 
              disabled={isLoading}
              style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}>
              <span className="text-muted-foreground">Already have an account? </span>
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold hover:scale-105 transition-transform"
                onClick={() => navigate('/job-finder/login')}
              >
                Login here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobFinderSignup;
