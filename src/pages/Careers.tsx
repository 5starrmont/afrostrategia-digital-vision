import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Briefcase, MapPin, Clock, Calendar, ExternalLink, Mail, ArrowRight, Building2, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Opportunity {
  id: string;
  title: string;
  type: 'job' | 'internship' | 'attachment';
  location: string | null;
  employment_type: string | null;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  application_deadline: string | null;
  application_email: string | null;
  application_url: string | null;
  created_at: string;
  department: { name: string; slug: string } | null;
}

interface Department {
  id: string;
  name: string;
  slug: string;
}

const Careers = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchOpportunities();
    fetchDepartments();
  }, []);

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*, department:departments(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOpportunities(data as unknown as Opportunity[]);
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, slug')
      .order('name');

    if (!error && data) {
      setDepartments(data);
    }
  };

  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
      case 'internship':
        return 'bg-accent text-accent-foreground border-border';
      case 'attachment':
        return 'bg-secondary text-secondary-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getEmploymentTypeBadge = (type: string | null) => {
    if (!type) return null;
    const labels: Record<string, string> = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'remote': 'Remote'
    };
    return labels[type] || type;
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const typeMatch = selectedType === 'all' || opp.type === selectedType;
    const deptMatch = selectedDepartment === 'all' || opp.department?.slug === selectedDepartment;
    return typeMatch && deptMatch;
  });

  const handleApply = (opp: Opportunity) => {
    if (opp.application_url) {
      window.open(opp.application_url, '_blank');
    } else if (opp.application_email) {
      window.location.href = `mailto:${opp.application_email}?subject=Application for ${opp.title}`;
    }
  };

  const handleCardClick = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setDialogOpen(true);
  };

  const isDeadlineNear = (deadline: string | null) => {
    if (!deadline) return false;
    const daysUntil = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil > 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-6">
            <Users className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Join Our Team</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Careers at AfroStrategia
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Join our team and help shape Africa's digital future. Explore opportunities for jobs, 
            internships, and attachments across our various departments.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-foreground">{opportunities.length}</p>
                <p className="text-sm text-muted-foreground">Open Positions</p>
              </div>
              <div className="h-12 w-px bg-border hidden md:block" />
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-foreground">{departments.length}</p>
                <p className="text-sm text-muted-foreground">Departments</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[160px] bg-background">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="job">Jobs</SelectItem>
                  <SelectItem value="internship">Internships</SelectItem>
                  <SelectItem value="attachment">Attachments</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.slug}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities List */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'Opportunity' : 'Opportunities'} Available
          </h2>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-5 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-muted rounded w-2/3 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card className="text-center py-16 bg-card">
              <CardContent>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Opportunities Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Check back later for new openings, or adjust your filters to see more results.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map(opp => (
                <Card 
                  key={opp.id} 
                  className="group cursor-pointer bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden"
                  onClick={() => handleCardClick(opp)}
                >
                  <CardContent className="p-6">
                    {/* Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className={getTypeBadgeStyles(opp.type)}>
                        {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
                      </Badge>
                      {isDeadlineNear(opp.application_deadline) && (
                        <Badge variant="destructive" className="text-xs">
                          Closing Soon
                        </Badge>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {opp.title}
                    </h3>
                    
                    {/* Department & Location */}
                    <div className="space-y-2 mb-4">
                      {opp.department && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4 shrink-0" />
                          <span className="truncate">{opp.department.name}</span>
                        </div>
                      )}
                      {opp.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{opp.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {opp.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(opp.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Opportunity Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={getTypeBadgeStyles(selectedOpportunity.type)}>
                    {selectedOpportunity.type.charAt(0).toUpperCase() + selectedOpportunity.type.slice(1)}
                  </Badge>
                  {selectedOpportunity.employment_type && (
                    <Badge variant="secondary">
                      {getEmploymentTypeBadge(selectedOpportunity.employment_type)}
                    </Badge>
                  )}
                  {selectedOpportunity.department && (
                    <Badge variant="outline">
                      {selectedOpportunity.department.name}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  {selectedOpportunity.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {selectedOpportunity.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedOpportunity.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Posted {format(new Date(selectedOpportunity.created_at), 'MMMM d, yyyy')}</span>
                  </div>
                  {selectedOpportunity.application_deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {format(new Date(selectedOpportunity.application_deadline), 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">About This Role</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedOpportunity.description}</p>
                </div>

                {/* Requirements */}
                {selectedOpportunity.requirements && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Requirements</h4>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {selectedOpportunity.requirements}
                    </p>
                  </div>
                )}

                {/* Responsibilities */}
                {selectedOpportunity.responsibilities && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Responsibilities</h4>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {selectedOpportunity.responsibilities}
                    </p>
                  </div>
                )}

                {/* Apply Button */}
                <div className="pt-4 border-t border-border">
                  <Button 
                    onClick={() => handleApply(selectedOpportunity)} 
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {selectedOpportunity.application_url ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply Now
                      </>
                    ) : selectedOpportunity.application_email ? (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Apply via Email
                      </>
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Careers;