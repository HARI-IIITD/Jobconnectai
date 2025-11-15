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
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/hr/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <img src={appLogo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold text-foreground">CV Review</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle>Filter Candidates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Filter by Sector</Label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Minimum Resume Score: {minScore}</Label>
                <Slider
                  value={[minScore]}
                  onValueChange={(value) => setMinScore(value[0])}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 animate-fade-in">
          {filteredCvs.map((cv, idx) => (
            <Card 
              key={cv.id} 
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'backwards' }}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{cv.name}</h3>
                          {cv.sector && (
                            <p className="text-xs font-medium text-primary/80">{cv.sector}</p>
                          )}
                          {(cv.degree || cv.college) && (
                            <p className="text-xs text-muted-foreground">
                              {cv.degree}
                              {cv.college && <span> · {cv.college}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => handleContactViaGmail(cv.email, cv.name)}
                        aria-label="Contact via email"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {cv.skills.map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="secondary"
                            className="hover:scale-110 transition-transform duration-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {cv.projects && cv.projects.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Projects: {cv.projects[0]}
                        {cv.projects.length > 1 && " + more"}
                      </p>
                    )}
                    {cv.certifications && cv.certifications.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Certifications: {cv.certifications[0]}
                        {cv.certifications.length > 1 && " + more"}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{cv.resumeScore}</div>
                      <div className="text-xs text-muted-foreground">Resume Score</div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{cv.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-muted-foreground">Email</Label>
                              <p className="font-medium break-all">{cv.email}</p>
                            </div>
                            {cv.sector && (
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Role / Sector</Label>
                                <p className="font-medium">{cv.sector}</p>
                              </div>
                            )}
                            {(cv.degree || cv.college) && (
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Education</Label>
                                <p className="font-medium">
                                  {cv.degree}
                                  {cv.college && (
                                    <span className="text-muted-foreground"> – {cv.college}</span>
                                  )}
                                </p>
                              </div>
                            )}
                            {cv.experience && (
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Experience Snapshot</Label>
                                <p className="text-sm text-muted-foreground whitespace-pre-line max-h-40 overflow-y-auto border rounded-md p-2 bg-muted/40">
                                  {cv.experience}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-muted-foreground">Skills</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {cv.skills.map(skill => (
                                  <Badge key={skill}>{skill}</Badge>
                                ))}
                              </div>
                            </div>
                            {cv.projects && cv.projects.length > 0 && (
                              <div>
                                <Label className="text-muted-foreground">Highlighted Projects</Label>
                                <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-muted-foreground max-h-36 overflow-y-auto">
                                  {cv.projects.map((project, idx) => (
                                    <li key={idx}>{project}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            {cv.certifications && cv.certifications.length > 0 && (
                              <div>
                                <Label className="text-muted-foreground">Certifications</Label>
                                <ul className="mt-2 space-y-1 text-sm list-disc list-inside text-muted-foreground max-h-32 overflow-y-auto">
                                  {cv.certifications.map((cert, idx) => (
                                    <li key={idx}>{cert}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {cv.hobbies && cv.hobbies.length > 0 && (
                              <div>
                                <Label className="text-muted-foreground">Interests</Label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {cv.hobbies.map((hobby, idx) => (
                                    <Badge key={idx} variant="outline">{hobby}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Resume Score</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="text-3xl font-bold text-primary">{cv.resumeScore}</div>
                              <div className="text-sm text-muted-foreground">/ 100</div>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button 
                              className="flex-1"
                              onClick={() => handleContactViaGmail(cv.email, cv.name)}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Contact via Gmail
                            </Button>
                            <Button 
                              variant="outline"
                              className="flex-1"
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
