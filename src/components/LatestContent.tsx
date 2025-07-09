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
  published: boolean;
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
}

export const LatestContent = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          department:departments(name, slug)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setContent(data || []);
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
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all duration-300"
                        onClick={() => handleOpenContent(item)}
                      >
                        <MediaIcon className="h-4 w-4 mr-2" />
                        {item.media_type === 'blog' ? 'Read' : item.media_type === 'video' ? 'Watch' : 'View'}
                      </Button>
                      
                      {item.file_url && (
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
          <Button 
            variant="outline"
            size="lg"
            className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 px-10 py-4 font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            View All Publications
            <FileText className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};