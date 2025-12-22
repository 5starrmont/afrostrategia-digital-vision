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
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [pendingEmailApplication, setPendingEmailApplication] = useState<Opportunity | null>(null);

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
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200';
      case 'internship':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200';
      case 'attachment':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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
      setPendingEmailApplication(opp);
      setEmailDialogOpen(true);
    }
  };

  const handleEmailProviderSelect = (provider: string) => {
    if (!pendingEmailApplication?.application_email) return;
    
    const email = pendingEmailApplication.application_email;
    const subject = encodeURIComponent(`Application for ${pendingEmailApplication.title}`);
    
    let url = '';
    switch (provider) {
      case 'gmail':
        url = `https://mail.google.com/mail/?view=cm&to=${email}&su=${subject}`;
        break;
      case 'yahoo':
        url = `https://compose.mail.yahoo.com/?to=${email}&subject=${subject}`;
        break;
      case 'outlook':
        url = `https://outlook.live.com/mail/0/deeplink/compose?to=${email}&subject=${subject}`;
        break;
      case 'default':
      default:
        window.location.href = `mailto:${email}?subject=${decodeURIComponent(subject)}`;
        setEmailDialogOpen(false);
        setPendingEmailApplication(null);
        return;
    }
    
    window.open(url, '_blank');
    setEmailDialogOpen(false);
    setPendingEmailApplication(null);
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
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-yellow-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 rounded-full px-4 py-2 mb-6">
            <Users className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Join Our Team</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Careers at{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-yellow-600">
              AfroStrategia
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join our team and help shape Africa's digital future. Explore opportunities for jobs, 
            internships, and attachments across our various departments.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-gray-900">{opportunities.length}</p>
                <p className="text-sm text-gray-600">Open Positions</p>
              </div>
              <div className="h-12 w-px bg-gray-200 hidden md:block" />
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-gray-900">{departments.length}</p>
                <p className="text-sm text-gray-600">Departments</p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[160px] border-gray-300 bg-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="job">Jobs</SelectItem>
                  <SelectItem value="internship">Internships</SelectItem>
                  <SelectItem value="attachment">Attachments</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px] border-gray-300 bg-white">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent className="bg-white">
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
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'Opportunity' : 'Opportunities'} Available
          </h2>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse bg-white">
                  <CardContent className="p-6">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <Card className="text-center py-16 bg-white">
              <CardContent>
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Opportunities Available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Check back later for new openings, or adjust your filters to see more results.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map(opp => (
                <Card 
                  key={opp.id} 
                  className="group cursor-pointer bg-white hover:shadow-lg hover:border-emerald-300 transition-all duration-300 overflow-hidden border-gray-200"
                  onClick={() => handleCardClick(opp)}
                >
                  <CardContent className="p-6">
                    {/* Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className={getTypeBadgeStyles(opp.type)}>
                        {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
                      </Badge>
                      {isDeadlineNear(opp.application_deadline) && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                          Closing Soon
                        </Badge>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {opp.title}
                    </h3>
                    
                    {/* Department & Location */}
                    <div className="space-y-2 mb-4">
                      {opp.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="truncate">{opp.department.name}</span>
                        </div>
                      )}
                      {opp.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 shrink-0 text-yellow-600" />
                          <span className="truncate">{opp.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {opp.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(opp.created_at), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={getTypeBadgeStyles(selectedOpportunity.type)}>
                    {selectedOpportunity.type.charAt(0).toUpperCase() + selectedOpportunity.type.slice(1)}
                  </Badge>
                  {selectedOpportunity.employment_type && (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                      {getEmploymentTypeBadge(selectedOpportunity.employment_type)}
                    </Badge>
                  )}
                  {selectedOpportunity.department && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {selectedOpportunity.department.name}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {selectedOpportunity.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {selectedOpportunity.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-yellow-600" />
                      <span>{selectedOpportunity.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>Posted {format(new Date(selectedOpportunity.created_at), 'MMMM d, yyyy')}</span>
                  </div>
                  {selectedOpportunity.application_deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <span>Deadline: {format(new Date(selectedOpportunity.application_deadline), 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About This Role</h4>
                  <p className="text-gray-600 leading-relaxed">{selectedOpportunity.description}</p>
                </div>

                {/* Requirements */}
                {selectedOpportunity.requirements && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {selectedOpportunity.requirements}
                    </p>
                  </div>
                )}

                {/* Responsibilities */}
                {selectedOpportunity.responsibilities && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Responsibilities</h4>
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {selectedOpportunity.responsibilities}
                    </p>
                  </div>
                )}

                {/* Apply Button */}
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={() => handleApply(selectedOpportunity)} 
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white"
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

      {/* Email Provider Selection Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Choose Email Provider
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => handleEmailProviderSelect('gmail')}
            >
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <Mail className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Gmail</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => handleEmailProviderSelect('outlook')}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Outlook</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => handleEmailProviderSelect('yahoo')}
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Mail className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Yahoo</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => handleEmailProviderSelect('default')}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Mail className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Default App</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Careers;