import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, Clock, Calendar, ExternalLink, Mail } from 'lucide-react';
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

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'internship':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'attachment':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground';
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Careers at AfroStrategia
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join our team and help shape Africa's digital future. Explore opportunities for jobs, 
            internships, and attachments across our various departments.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'Opportunity' : 'Opportunities'} Available
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="job">Jobs</SelectItem>
                  <SelectItem value="internship">Internships</SelectItem>
                  <SelectItem value="attachment">Attachments</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Opportunities Available</h3>
                <p className="text-muted-foreground">
                  Check back later for new openings, or adjust your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredOpportunities.map(opp => (
                <Card key={opp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getTypeBadgeColor(opp.type)}>
                            {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
                          </Badge>
                          {opp.employment_type && (
                            <Badge variant="secondary">
                              {getEmploymentTypeBadge(opp.employment_type)}
                            </Badge>
                          )}
                          {opp.department && (
                            <Badge variant="outline">
                              {opp.department.name}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{opp.title}</CardTitle>
                      </div>
                      <Button onClick={() => handleApply(opp)} className="shrink-0">
                        {opp.application_url ? (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Apply Now
                          </>
                        ) : opp.application_email ? (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Apply via Email
                          </>
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {opp.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{opp.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Posted {format(new Date(opp.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      {opp.application_deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline: {format(new Date(opp.application_deadline), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-foreground mb-4">{opp.description}</p>
                    
                    {opp.requirements && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-foreground mb-2">Requirements</h4>
                        <p className="text-muted-foreground whitespace-pre-line">{opp.requirements}</p>
                      </div>
                    )}
                    
                    {opp.responsibilities && (
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Responsibilities</h4>
                        <p className="text-muted-foreground whitespace-pre-line">{opp.responsibilities}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
