import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobFinderProfile, getJobFinderSession, clearJobFinderSession, JobFinderProfile, saveCVData, CVData } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, MessageSquare, LogOut, User, FileCheck, Loader2, AlertCircle, FileText, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import appLogo from "@/assets/app-logo.png";
import { gradingService, CVAnalysisResponse } from "@/services/gradingService";

const JobFinderDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<JobFinderProfile | null>(null);
  const [uploadedCV, setUploadedCV] = useState<File | null>(null);
  const [cvScore, setCvScore] = useState<number | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState<CVAnalysisResponse | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [showCVData, setShowCVData] = useState(false);
  const [isGradingHealthy, setIsGradingHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const session = getJobFinderSession();
    if (!session) {
      navigate('/job-finder/login');
    } else {
      const userProfile = getJobFinderProfile();
      setProfile(userProfile);
    }
    // Check grading backend health
    checkGradingHealth();
  }, [navigate]);

  const checkGradingHealth = async () => {
    try {
      const health = await gradingService.checkHealth();
      setIsGradingHealthy(health.status === 'healthy');
    } catch (error) {
      console.error('Grading backend health check failed:', error);
      setIsGradingHealthy(false);
    }
  };

  const handleLogout = () => {
    clearJobFinderSession();
    navigate('/');
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.docx')) {
        toast.error("Only PDF and DOCX files are supported");
        return;
      }

      setUploadedCV(file);
      setIsGrading(true);
      setCvAnalysis(null);
      setCvScore(null);
      setShowCVData(false);
      
      toast.success("CV uploaded successfully! Analyzing...");
      
      try {
        const analysis = await gradingService.gradeCV(file);
        
        if (analysis.success) {
          setCvAnalysis(analysis);
          setCvScore(analysis.score || 0);
          
          // Save CV data to storage for chatbot use
          const cvData: CVData = {
            fileName: file.name,
            score: analysis.score || 0,
            analysis: analysis,
            extractedData: analysis.json_data || {},
            uploadedAt: new Date().toISOString()
          };
          saveCVData(cvData);
          
          const gradeInfo = gradingService.getScoreGrade(analysis.score || 0);
          toast.success(`CV analyzed! Score: ${analysis.score}/100 (${gradeInfo.grade})`);
          
          if (isGradingHealthy === false) {
            setIsGradingHealthy(true);
          }
        } else {
          toast.error(analysis.message || "Failed to analyze CV");
        }
      } catch (error) {
        console.error('Error grading CV:', error);
        toast.error("Failed to analyze CV. Please ensure the grading backend is running.");
        setIsGradingHealthy(false);
      } finally {
        setIsGrading(false);
      }
    }
  };

  const handleApplyToCompany = () => {
    if (cvScore && cvScore >= 70) {
      toast.success("Application submitted! Companies will be able to view your profile.");
    } else {
      toast.error("Please improve your CV score before applying.");
    }
  };

  const getScoreDisplay = () => {
    if (!cvScore) return null;
    const gradeInfo = gradingService.getScoreGrade(cvScore);
    return { score: cvScore, ...gradeInfo };
  };

  if (!profile) return null;

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
        {isGradingHealthy === false && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 text-orange-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Grading Backend Connection Issue</p>
                  <p className="text-sm text-orange-700">
                    Please ensure the grading backend server is running on localhost:8001.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6 animate-fade-in">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-primary-foreground">
                  <AvatarImage src={profile.profileImage} />
                  <AvatarFallback className="bg-primary-foreground text-primary text-xl">
                    {profile.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {profile.fullName.split(' ')[0]}!</h2>
                  <p className="text-primary-foreground/90">{profile.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
              onClick={() => navigate('/job-finder/profile')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>Update your information</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 animate-fade-in"
              style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
              onClick={() => navigate('/job-finder/chatbot')}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>AI Chatbot</CardTitle>
                    <CardDescription>Get CV feedback</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <Card className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Upload your CV to get AI-powered scoring and connect with recruiters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-all duration-300 hover:scale-105 hover:bg-secondary/20">
                <input
                  type="file"
                  id="cv-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCVUpload}
                  disabled={isGrading}
                />
                <label htmlFor="cv-upload" className={`cursor-pointer ${isGrading ? 'pointer-events-none opacity-50' : ''}`}>
                  {isGrading ? (
                    <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  )}
                  <p className="text-sm font-medium">
                    {isGrading ? "Analyzing your CV..." : (uploadedCV ? uploadedCV.name : "Click to upload or drag and drop")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC or DOCX (Max 5MB)
                  </p>
                </label>
              </div>

              {cvAnalysis && cvAnalysis.success && (
                <Card className="bg-secondary border-primary/20 animate-scale-in">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Your Resume Score</p>
                        {(() => {
                          const scoreDisplay = getScoreDisplay();
                          return scoreDisplay ? (
                            <>
                              <div className="flex items-center space-x-2">
                                <div className={`text-3xl font-bold ${scoreDisplay.color}`}>{scoreDisplay.score}</div>
                                <span className="text-muted-foreground">/ 100</span>
                                <Badge variant="secondary" className={scoreDisplay.color}>
                                  {scoreDisplay.grade}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{scoreDisplay.message}</p>
                            </>
                          ) : null;
                        })()}
                      </div>
                      <FileCheck className="w-12 h-12 text-primary" />
                    </div>
                    
                    {cvAnalysis.sector && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-muted-foreground">Detected Sector:</p>
                        <Badge variant="outline" className="mt-1">{cvAnalysis.sector}</Badge>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {cvScore && cvScore >= 70 && (
                        <Button onClick={handleApplyToCompany} className="flex-1">
                          Apply to Companies
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCVData(!showCVData)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {showCVData ? 'Hide' : 'Show'} CV Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {showCVData && cvAnalysis && cvAnalysis.json_data && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">Extracted CV Data</CardTitle>
                    </div>
                    <CardDescription>
                      Structured information extracted from your CV
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white rounded-lg p-4 border border-blue-200 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {gradingService.formatCVData(cvAnalysis.json_data)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          </div>
      </main>
    </div>
  );
};

export default JobFinderDashboard;
