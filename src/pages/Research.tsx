
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Calendar, User, Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ResearchPaper {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  file_url?: string;
  file_name?: string;
  public: boolean;
  sensitivity_level: string | null;
  uploaded_by: string | null;
  author: string | null;
  department: {
    name: string;
    slug: string;
  } | null;
}

const Research = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchResearchPapers();

    // Set up real-time subscription
    const channel = supabase
      .channel('research-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
          filter: 'public=eq.true'
        },
        () => {
          fetchResearchPapers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchResearchPapers = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          department:departments(name, slug)
        `)
        .eq('public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching research papers:', error);
        setResearchPapers([]);
      } else {
        setResearchPapers(data || []);
      }
    } catch (error) {
      console.error('Error fetching research papers:', error);
      setResearchPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = researchPapers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (paper.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesDepartment = selectedDepartment === "all" || paper.department?.slug === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(researchPapers.filter(paper => paper.department).map(paper => paper.department!))];

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPapers = filteredPapers.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryColor = () => {
    return "bg-emerald-100 text-emerald-700";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-yellow-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton />
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Research & Policy Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Evidence-based research shaping Africa's digital transformation policy landscape
            </p>
          </div>
        </div>
      </section>

      {/* Featured Research */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Research</h2>
          {researchPapers.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {researchPapers.slice(0, 2).map((paper, index) => (
              <Card key={index} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getCategoryColor()}>
                      Research Paper
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-emerald-700 transition-colors">
                    {paper.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {paper.description ? (paper.description.length > 200 ? `${paper.description.substring(0, 200)}...` : paper.description) : 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-4 text-sm text-gray-500">
                       <div className="flex items-center space-x-1">
                         <User className="h-4 w-4" />
                         <span>{paper.author || 'AfroStrategia'}</span>
                       </div>
                       <div className="flex items-center space-x-1">
                         <Calendar className="h-4 w-4" />
                         <span>{formatDate(paper.created_at)}</span>
                       </div>
                     </div>
                      {paper.file_url && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-600 hover:text-emerald-700"
                            onClick={() => {
                              try {
                                window.open(paper.file_url, '_blank');
                              } catch (error) {
                                console.error('Error opening file:', error);
                                alert('There was an error opening this file. Please try again.');
                              }
                            }}
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-600 hover:text-emerald-700"
                            onClick={() => {
                              try {
                                const link = document.createElement('a');
                                link.href = paper.file_url!;
                                link.download = paper.file_name || 'document.pdf';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } catch (error) {
                                console.error('Error downloading file:', error);
                                alert('There was an error downloading this file. Please try again.');
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No featured research available</p>
            </div>
          )}
        </div>
      </section>

      {/* Research Library */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Research Library</h2>
            <div className="text-sm text-gray-600">
              {filteredPapers.length} research papers found
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search research papers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={(value) => {
              setSelectedDepartment(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filter by Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.slug} value={dept.slug}>
                    {dept.name.replace('Department of ', '')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Research Grid */}
          {filteredPapers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentPapers.map((paper) => (
                <Card key={paper.id} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getCategoryColor()}>
                        Research Paper
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-emerald-700 transition-colors">
                      {paper.title}
                    </CardTitle>
                    <CardDescription>
                      {paper.description ? (paper.description.length > 120 ? `${paper.description.substring(0, 120)}...` : paper.description) : 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col space-y-1 text-sm text-gray-500">
                         <div className="flex items-center space-x-1">
                           <User className="h-4 w-4" />
                           <span>{paper.author || 'AfroStrategia'}</span>
                         </div>
                         <div className="flex items-center space-x-1">
                           <Calendar className="h-4 w-4" />
                           <span>{formatDate(paper.created_at)}</span>
                         </div>
                       </div>
                      {paper.file_url ? (
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-600 hover:text-emerald-700"
                            onClick={() => {
                              try {
                                window.open(paper.file_url, '_blank');
                              } catch (error) {
                                console.error('Error opening file:', error);
                                alert('There was an error opening this file. Please try again.');
                              }
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-emerald-600 hover:text-emerald-700"
                            onClick={() => {
                              try {
                                const link = document.createElement('a');
                                link.href = paper.file_url!;
                                link.download = paper.file_name || 'document.pdf';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              } catch (error) {
                                console.error('Error downloading file:', error);
                                alert('There was an error downloading this file. Please try again.');
                              }
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700" disabled>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No research papers found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-emerald-700 hover:bg-emerald-800" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Research;
