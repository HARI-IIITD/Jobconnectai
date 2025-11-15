import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { getHRSession } from "@/lib/storage";
import { MOCK_CVS, getUniqueSectors, CandidateCV } from "@/data/mockCVs";
import { ArrowLeft, Mail, Calendar, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import appLogo from "@/assets/app-logo.png";

const HRCVReview = () => {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState<CandidateCV[]>([]);
  const [filteredCvs, setFilteredCvs] = useState<CandidateCV[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(0);

  useEffect(() => {
    const session = getHRSession();
    if (!session) {
      navigate('/hr/login');
    }
  }, [navigate]);

  useEffect(() => {
    try {
      setCvs(MOCK_CVS);
      setFilteredCvs(MOCK_CVS);
    } catch (e) {
      console.error("HRCVReview: failed to load mock data", e);
      setCvs([]);
      setFilteredCvs([]);
    }
  }, []);

  useEffect(() => {
    let filtered = [...cvs];
    
    if (selectedSector && selectedSector !== "all") {
      filtered = filtered.filter(cv => cv.sector === selectedSector);
    }
    
    filtered = filtered.filter(cv => cv.resumeScore >= minScore);
    
    setFilteredCvs(filtered);
  }, [selectedSector, minScore, cvs]);

  const handleContactViaGmail = (email: string, name: string) => {
    window.location.href = `mailto:${email}?subject=Job Opportunity at Our Company&body=Dear ${name},%0D%0A%0D%0AWe came across your profile and are impressed with your qualifications.%0D%0A%0D%0ABest regards`;
  };

  const handleScheduleInterview = (email: string, name: string) => {
    window.location.href = `mailto:${email}?subject=Interview Invitation&body=Dear ${name},%0D%0A%0D%0AWe would like to schedule an interview with you. Please let us know your availability.%0D%0A%0D%0ABest regards`;
  };

  return (
    <div className="min-h-screen hero-gradient">
      <header className="glass-effect border-b border-border/20 shadow-xl">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/hr/dashboard')} className="hover:bg-white/10 hover-zoom">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img src={appLogo} alt="Logo" className="w-12 h-12 hover-bounce" />
          <h1 className="text-2xl font-black gradient-text">CV Review</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-8 glass-effect animate-fade-in hover-neon">
          <CardHeader>
            <CardTitle className="font-black gradient-text text-2xl">Filter Candidates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-bold text-foreground">Filter by Sector</Label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="glass-effect border-border/20 hover-glow">
                    <SelectValue placeholder="All Sectors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {getUniqueSectors().map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-foreground">Minimum Resume Score: {minScore}</Label>
                <Slider
                  value={[minScore]}
                  onValueChange={(value) => setMinScore(value[0])}
                  max={100}
                  step={5}
                  className="mt-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 animate-fade-in">
          {filteredCvs.map((cv, idx) => (
            <Card 
              key={cv.id} 
              className="glass-effect hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 hover:scale-[1.02] animate-fade-in hover-neon border-border/20"
              style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'backwards' }}
            >
              <CardContent className="pt-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-3xl gradient-bg flex items-center justify-center hover-bounce">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-foreground">{cv.name}</h3>
                          {cv.sector && (
                            <p className="text-lg font-bold text-primary">{cv.sector}</p>
                          )}
                          {(cv.degree || cv.college) && (
                            <p className="text-sm text-muted-foreground font-medium">
                              {cv.degree}
                              {cv.college && <span> · {cv.college}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 hover:bg-white/10 hover-zoom"
                        onClick={() => handleContactViaGmail(cv.email, cv.name)}
                        aria-label="Contact via email"
                      >
                        <Mail className="w-5 h-5" />
                      </Button>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-3">
                        {cv.skills.map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="secondary"
                            className="glass-effect border-border/20 hover-scale hover-glow px-3 py-1 text-sm font-bold"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {cv.projects && cv.projects.length > 0 && (
                      <p className="text-sm text-muted-foreground font-medium">
                        Projects: {cv.projects[0]}
                        {cv.projects.length > 1 && " + more"}
                      </p>
                    )}
                    {cv.certifications && cv.certifications.length > 0 && (
                      <p className="text-sm text-muted-foreground font-medium">
                        Certifications: {cv.certifications[0]}
                        {cv.certifications.length > 1 && " + more"}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-4">
                    <div className="text-right">
                      <div className="text-4xl font-black gradient-text">{cv.resumeScore}</div>
                      <div className="text-sm text-muted-foreground font-bold">Resume Score</div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="glass-effect hover-neon border-border/20 px-6 py-2 font-bold">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto glass-effect border-border/20">
                        <DialogHeader>
                          <DialogTitle className="font-black gradient-text">{cv.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-muted-foreground font-bold">Email</Label>
                              <p className="font-bold break-all">{cv.email}</p>
                            </div>
                            {cv.sector && (
                              <div className="space-y-1">
                                <Label className="text-muted-foreground font-bold">Role / Sector</Label>
                                <p className="font-bold">{cv.sector}</p>
                              </div>
                            )}
                            {(cv.degree || cv.college) && (
                              <div className="space-y-1">
                                <Label className="text-muted-foreground font-bold">Education</Label>
                                <p className="font-bold">
                                  {cv.degree}
                                  {cv.college && (
                                    <span className="text-muted-foreground"> – {cv.college}</span>
                                  )}
                                </p>
                              </div>
                            )}
                            {cv.experience && (
                              <div className="space-y-1 sm:col-span-2">
                                <Label className="text-muted-foreground font-bold">Experience Snapshot</Label>
                                <p className="text-sm text-muted-foreground whitespace-pre-line max-h-40 overflow-y-auto glass-effect rounded-xl p-3 border border-border/10">
                                  {cv.experience}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground font-bold">Skills</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {cv.skills.map(skill => (
                                  <Badge key={skill} className="glass-effect border-border/20">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                            {cv.projects && cv.projects.length > 0 && (
                              <div className="sm:col-span-2">
                                <Label className="text-muted-foreground font-bold">Highlighted Projects</Label>
                                <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-muted-foreground max-h-36 overflow-y-auto">
                                  {cv.projects.map((project, idx) => (
                                    <li key={idx}>{project}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {cv.certifications && cv.certifications.length > 0 && (
                              <div>
                                <Label className="text-muted-foreground font-bold">Certifications</Label>
                                <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-muted-foreground max-h-32 overflow-y-auto">
                                  {cv.certifications.map((cert, idx) => (
                                    <li key={idx}>{cert}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {cv.hobbies && cv.hobbies.length > 0 && (
                              <div>
                                <Label className="text-muted-foreground font-bold">Interests</Label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {cv.hobbies.map((hobby, idx) => (
                                    <Badge key={idx} variant="outline" className="glass-effect border-border/20">{hobby}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-muted-foreground font-bold">Resume Score</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="text-3xl font-black gradient-text">{cv.resumeScore}</div>
                              <div className="text-sm text-muted-foreground">/ 100</div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 pt-4">
                            <Button 
                              className="flex-1 gradient-bg hover-glow"
                              onClick={() => handleContactViaGmail(cv.email, cv.name)}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Contact via Gmail
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1 glass-effect hover-glow border-border/20"
                              onClick={() => handleScheduleInterview(cv.email, cv.name)}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Interview
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredCvs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No candidates found matching your filters.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRCVReview;
