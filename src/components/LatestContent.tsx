import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, User, Play, Eye, Clock, ExternalLink } from "lucide-react";
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

export const LatestContent = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();

    // Set up real-time updates for published content
    const channel = supabase
      .channel('published-content-updates')
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch published content (excluding research/reports as those come from reports table)
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select(`
          *,
          department:departments(name, slug)
        `)
        .eq('published', true)
        .not('type', 'ilike', '%research%')
        .not('type', 'ilike', '%report%')
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      // Fetch public reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          id,
          title,
          description,
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

      // Transform reports to match content structure
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
        author: 'AfroStrategia',
        read_time: null,
        department: report.departments ? {
          name: report.departments.name,
          slug: report.departments.slug
        } : null,
        source: 'reports' as const
      }));

      // Merge and sort all content by date
      const allContent = [...(contentData || []).map(c => ({ ...c, source: 'content' as const })), ...transformedReports]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6);

      setContent(allContent);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'report':
        return 'bg-emerald-100 text-emerald-800';
      case 'policy':
        return 'bg-yellow-100 text-yellow-800';
      case 'research':
        return 'bg-blue-100 text-blue-800';
      case 'blog':
        return 'bg-purple-100 text-purple-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'infographic':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMediaIcon = (mediaType: string | null) => {
    switch (mediaType?.toLowerCase()) {
      case 'video':
        return Play;
      case 'image':
        return Eye;
      case 'blog':
        return FileText;
      default:
        return FileText;
    }
  };

  const getButtonText = (item: Content) => {
    const type = item.type.toLowerCase();
    const mediaType = item.media_type?.toLowerCase();
    
    if (mediaType === 'video' || type === 'video') return 'Watch';
    if (mediaType === 'blog' || type === 'blog') return 'View';
    if (type === 'infographic' || type === 'infographics') return 'View';
    if (type === 'research' || type === 'report' || type === 'policy-brief' || type === 'policy') return 'View';
    if (type === 'news-update' || type === 'op-ed') return 'View';
    
    return 'View';
  };

  const getButtonIcon = (item: Content) => {
    const type = item.type.toLowerCase();
    const mediaType = item.media_type?.toLowerCase();
    
    if (mediaType === 'video' || type === 'video') return Play;
    if (mediaType === 'blog' || type === 'blog') return Eye;
    return FileText;
  };

  const shouldShowDownloadButton = (item: Content) => {
    const type = item.type.toLowerCase();
    return (
      (type === 'research' || 
       type === 'report' || 
       type === 'policy-brief' || 
       type === 'policy' ||
       type === 'infographic' ||
       type === 'infographics' ||
       type === 'op-ed') && 
      item.file_url
    );
  };

  const handleOpenContent = (item: Content) => {
    if (item.media_type === 'blog' && item.slug) {
      // Open blog in same window or navigate to blog detail page
      window.open(`/blog/${item.slug}`, '_blank');
    } else if (item.media_url) {
      // Open media content in new window
      window.open(item.media_url, '_blank');
    } else if (item.file_url) {
      // Open file in new window
      window.open(item.file_url, '_blank');
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
            Latest Content & Publications
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Explore our most recent research papers, policy briefs, and strategic publications 
            shaping Africa's digital future through evidence-based insights and innovative solutions.
          </p>
        </div>

        {content.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">No Content Available</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Check back soon for our latest publications and research insights.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {content.map((item, index) => {
              const MediaIcon = getMediaIcon(item.media_type);
              return (
                <Card 
                  key={item.id} 
                  className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Thumbnail image for visual content */}
                  {item.thumbnail_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.media_type === 'video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Play className="h-8 w-8 text-white ml-1" />
                          </div>
                        </div>
                      )}
                      {item.media_type === 'blog' && item.read_time && (
                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                          <Clock className="h-3 w-3 text-white mr-1" />
                          <span className="text-xs text-white">{item.read_time} min</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <CardHeader className="pb-4 relative">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className={`${getTypeColor(item.type)} font-medium px-3 py-1 text-xs uppercase tracking-wide`}>
                        {item.type}
                      </Badge>
                      {item.department && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-background/50 border-primary/20 text-primary font-medium"
                        >
                          {item.department.name.replace('Department of ', '')}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-3">
                      {item.title}
                    </CardTitle>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <time dateTime={item.created_at}>
                          {format(new Date(item.created_at), 'MMMM dd, yyyy')}
                        </time>
                      </div>
                      {item.author && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span className="text-xs">{item.author}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 relative">
                    {item.body && (
                      <CardDescription className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                        {item.body}
                      </CardDescription>
                    )}
                    
                    <div className={`flex items-center pt-4 border-t border-border/50 ${shouldShowDownloadButton(item) ? 'justify-between' : 'justify-center'}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all duration-300"
                        onClick={() => handleOpenContent(item)}
                      >
                        {(() => {
                          const ButtonIcon = getButtonIcon(item);
                          return <ButtonIcon className="h-4 w-4 mr-2" />;
                        })()}
                        {getButtonText(item)}
                      </Button>
                      
                      {shouldShowDownloadButton(item) && (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = item.file_url!;
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-16">
          <a href="/publications">
            <Button 
              variant="outline"
              size="lg"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-700 px-10 py-4 font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explore More
              <FileText className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};