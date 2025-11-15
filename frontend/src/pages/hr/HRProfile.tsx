import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHRSession, updateHRProfile, HRCredentials } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera } from "lucide-react";
import { toast } from "sonner";
import appLogo from "@/assets/app-logo.png";

const HRProfile = () => {
  const navigate = useNavigate();
  const [hrData, setHrData] = useState<HRCredentials | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = getHRSession();
    if (!session) {
      navigate('/hr/login');
    } else {
      setHrData(session);
    }
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && hrData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        updateHRProfile(hrData.username, { profileImage: base64Image });
        setHrData({ ...hrData, profileImage: base64Image });
        toast.success("Profile image updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  if (!hrData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/hr/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img src={appLogo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-primary">
                  <AvatarImage src={hrData.profileImage} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {hrData.companyName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button 
                  size="sm" 
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">{hrData.companyName}</h2>
                <p className="text-muted-foreground">Username: {hrData.username}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-medium">HR Recruiter</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-success">Active</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HRProfile;
