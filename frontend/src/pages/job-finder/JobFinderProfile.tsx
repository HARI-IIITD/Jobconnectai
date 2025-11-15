import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getJobFinderProfile, getJobFinderSession, updateJobFinderProfile, type JobFinderProfile } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { toast } from "sonner";
import appLogo from "@/assets/app-logo.png";

const JobFinderProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<JobFinderProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const session = getJobFinderSession();
    if (!session) {
      navigate('/job-finder/login');
    } else {
      const userProfile = getJobFinderProfile();
      setProfile(userProfile);
    }
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        const updatedProfile = { ...profile, profileImage: base64Image };
        setProfile(updatedProfile);
        updateJobFinderProfile(updatedProfile);
        toast.success("Profile image updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (profile) {
      updateJobFinderProfile(profile);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/job-finder/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img src={appLogo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-foreground">My Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} size="sm">
                Edit Profile
              </Button>
            ) : (
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-primary">
                  <AvatarImage src={profile.profileImage} />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {profile.fullName.substring(0, 2).toUpperCase()}
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
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                {isEditing ? (
                  <Input
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  />
                ) : (
                  <p className="text-foreground font-medium">{profile.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-foreground font-medium">{profile.email}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.age} years</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Degree</Label>
                  {isEditing ? (
                    <Input
                      value={profile.degree}
                      onChange={(e) => setProfile({...profile, degree: e.target.value})}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.degree}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>College/University</Label>
                {isEditing ? (
                  <Input
                    value={profile.college}
                    onChange={(e) => setProfile({...profile, college: e.target.value})}
                  />
                ) : (
                  <p className="text-foreground font-medium">{profile.college}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Experience</Label>
                {isEditing ? (
                  <Input
                    value={profile.experience || ''}
                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                  />
                ) : (
                  <p className="text-foreground font-medium">{profile.experience || 'Not specified'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default JobFinderProfile;
