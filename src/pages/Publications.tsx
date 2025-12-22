import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Play, Clock, Search, ArrowRight, Sparkles, TrendingUp, BookOpen } from "lucide-react";
import { format } from "date-fns";

interface Content {
  id: string;
  title: string;
  body: string | null;
  type: string;
  published?: boolean;
  created_at: string;
  file_url: string | null;
  file_name: string | null;
  media_type: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  slug: string | null;
  author: string | null;
  read_time: number | null;
  department: {
    name: string;
    slug: string;
  } | null;
  source?: 'content' | 'reports';
}

const Publications = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  useEffect(() => {
    fetchContent();

    const contentChannel = supabase
      .channel('publications-updates')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'content',
          filter: 'published=eq.true'
        },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    const reportsChannel = supabase
      .channel('reports-updates')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'reports',
          filter: 'public=eq.true'
        },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contentChannel);
      supabase.removeChannel(reportsChannel);
    };
  }, []);

  const fetchContent = async () => {
    try {
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select(`
          *,
          department:departments(name, slug)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          id,
          title,
          description,
          author,
          created_at,
          file_url,
          file_name,
          thumbnail_url,
          department_id,
          departments!reports_department_id_fkey(name, slug)
        `)
        .eq('public', true)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      const transformedReports = (reportsData || []).map(report => ({
        id: report.id,
        title: report.title,
        body: report.description,
        type: 'Research',
        created_at: report.created_at,
        file_url: report.file_url,
        file_name: report.file_name,
        media_type: null,
        media_url: null,
        thumbnail_url: report.thumbnail_url,
        slug: null,
        author: report.author || 'AfroStrategia',
        read_time: null,
        department: report.departments ? {
          name: report.departments.name,
          slug: report.departments.slug
        } : null,
        source: 'reports' as const
      }));

      const allContent = [...(contentData || []).map(c => ({ ...c, source: 'content' as const })), ...transformedReports]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setContent(allContent);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'report':
        return { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50' };
      case 'policy':
        return { bg: 'bg-yellow-600', text: 'text-yellow-600', light: 'bg-yellow-50' };
      case 'research':
        return { bg: 'bg-emerald-700', text: 'text-emerald-700', light: 'bg-emerald-50' };
      case 'blog':
        return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' };
      case 'video':
        return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' };
      case 'infographic':
        return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' };
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground', light: 'bg-muted' };
    }
  };

  const handleOpenContent = (item: Content) => {
    if (item.media_type === 'blog' && item.slug) {
      window.open(`/blog/${item.slug}`, '_blank');
    } else if (item.media_url) {
      window.open(item.media_url, '_blank');
    } else if (item.file_url) {
      window.open(item.file_url, '_blank');
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || item.type.toLowerCase() === selectedType.toLowerCase();
    const matchesDepartment = selectedDepartment === "all" || item.department?.slug === selectedDepartment;
    return matchesSearch && matchesType && matchesDepartment;
  });

  const contentTypes = [...new Set(content.map(item => item.type))];
  const departments = [...new Set(content.filter(item => item.department).map(item => item.department!))];

  const featuredPost = filteredContent[0];
  const secondaryPosts = filteredContent.slice(1, 4);
  const remainingPosts = filteredContent.slice(4);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-emerald-100 rounded-lg w-64"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-emerald-100 rounded-2xl"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-yellow-100 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-800"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton className="text-white/80 hover:text-white mb-8" />
          
          <div className="text-center pb-12 pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-emerald-100 text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Insights & Publications</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-400">AfroStrategia</span> Blog
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
              Research, insights, and perspectives on Africa's digital transformation journey
            </p>
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-600" />
              <Input
                placeholder="Search articles, research, videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 bg-emerald-50/50 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-full"
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-36 bg-white border-emerald-200 rounded-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {contentTypes.map(type => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-44 bg-white border-emerald-200 rounded-full">
                  <SelectValue placeholder="Department" />
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
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredContent.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No articles found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any content matching your criteria. Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Section */}
            {featuredPost && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-1 w-12 bg-gradient-to-r from-emerald-600 to-yellow-500 rounded-full"></div>
                  <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Featured</h2>
                </div>
                
                <div className="grid lg:grid-cols-5 gap-8">
                  {/* Main Featured */}
                  <article 
                    className="lg:col-span-3 group cursor-pointer"
                    onClick={() => handleOpenContent(featuredPost)}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-emerald-100 to-yellow-100">
                      {featuredPost.thumbnail_url ? (
                        <img 
                          src={featuredPost.thumbnail_url} 
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-20 w-20 text-emerald-300" />
                        </div>
                      )}
                      {featuredPost.type.toLowerCase() === 'video' && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play className="h-7 w-7 text-emerald-700 ml-1" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getTypeStyles(featuredPost.type).bg} text-white border-0 px-3 py-1`}>
                          {featuredPost.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {featuredPost.department && (
                        <span className="text-sm font-medium text-emerald-600">
                          {featuredPost.department.name.replace('Department of ', '')}
                        </span>
                      )}
                      <h3 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight group-hover:text-emerald-700 transition-colors">
                        {featuredPost.title}
                      </h3>
                      {featuredPost.body && (
                        <p className="text-muted-foreground leading-relaxed line-clamp-3 text-lg">
                          {featuredPost.body}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        {featuredPost.author && (
                          <span className="font-semibold text-foreground">{featuredPost.author}</span>
                        )}
                        <span>•</span>
                        <time>{format(new Date(featuredPost.created_at), 'MMMM d, yyyy')}</time>
                        {featuredPost.read_time && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {featuredPost.read_time} min read
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </article>

                  {/* Secondary Featured */}
                  <div className="lg:col-span-2 space-y-6">
                    {secondaryPosts.map((item) => (
                      <article 
                        key={item.id}
                        className="group cursor-pointer flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300"
                        onClick={() => handleOpenContent(item)}
                      >
                        <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-yellow-100">
                          {item.thumbnail_url ? (
                            <img 
                              src={item.thumbnail_url} 
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="h-8 w-8 text-emerald-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getTypeStyles(item.type).bg}`}></span>
                            <span className="text-xs font-medium text-muted-foreground">{item.type}</span>
                          </div>
                          <h4 className="font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                            {item.title}
                          </h4>
                          <time className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'MMM d, yyyy')}
                          </time>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* All Articles Grid */}
            {remainingPosts.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-1 w-12 bg-gradient-to-r from-yellow-500 to-emerald-600 rounded-full"></div>
                  <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">All Publications</h2>
                  <span className="text-sm text-muted-foreground">({filteredContent.length} articles)</span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingPosts.map((item) => (
                    <article 
                      key={item.id}
                      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100/50"
                      onClick={() => handleOpenContent(item)}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-emerald-50 to-yellow-50">
                        {item.thumbnail_url ? (
                          <img 
                            src={item.thumbnail_url} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-12 w-12 text-emerald-200" />
                          </div>
                        )}
                        {item.type.toLowerCase() === 'video' && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="h-5 w-5 text-emerald-700 ml-0.5" />
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className={`${getTypeStyles(item.type).bg} text-white border-0 text-xs`}>
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-5 space-y-3">
                        {item.department && (
                          <span className="text-xs font-medium text-emerald-600">
                            {item.department.name.replace('Department of ', '')}
                          </span>
                        )}
                        <h3 className="font-bold text-foreground leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h3>
                        {item.body && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.body}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-emerald-50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {item.author && (
                              <span className="font-medium text-foreground">{item.author}</span>
                            )}
                            {item.author && <span>•</span>}
                            <time>{format(new Date(item.created_at), 'MMM d')}</time>
                          </div>
                          {item.file_url && (
                            <button 
                              className="p-1.5 rounded-full hover:bg-emerald-50 text-emerald-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.file_url!, '_blank');
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-800 py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-emerald-100 text-sm mb-6">
            <TrendingUp className="h-4 w-4" />
            <span>Stay Updated</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Get the latest insights delivered to your inbox
          </h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for research updates, policy briefs, and exclusive content on Africa's digital future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="bg-white/10 border-white/20 text-white placeholder:text-emerald-200 rounded-full"
            />
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-emerald-900 font-semibold rounded-full px-8">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Publications;
