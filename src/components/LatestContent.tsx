import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, ArrowRight, Clock, ChevronRight } from "lucide-react";
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
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

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
        return 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20';
      case 'policy':
        return 'bg-brand-yellow/10 text-brand-yellow-dark border-brand-yellow/30';
      case 'research':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'blog':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'video':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'infographic':
        return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-muted rounded w-80 mx-auto"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-2xl"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-muted rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const featuredPost = content[0];
  const recentPosts = content.slice(1, 5);

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-emerald/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-yellow/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14 gap-6">
          <div>
            <Badge variant="outline" className="mb-4 border-brand-emerald/30 text-brand-emerald bg-brand-emerald/5">
              <FileText className="h-3 w-3 mr-1" />
              Latest Updates
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">
              From Our <span className="text-brand-emerald">Blog</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Insights, research, and strategic perspectives shaping Africa's digital transformation.
            </p>
          </div>
          <Link to="/publications">
            <Button 
              variant="outline" 
              size="lg"
              className="border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-white transition-all duration-300 group"
            >
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {content.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border/50">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">No Posts Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Check back soon for our latest publications and insights.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Featured Post */}
            {featuredPost && (
              <article className="group relative">
                <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-500">
                  {/* Featured Image */}
                  <div className="relative h-64 lg:h-80 overflow-hidden bg-gradient-to-br from-brand-emerald/20 to-brand-yellow/10">
                    {featuredPost.thumbnail_url ? (
                      <img 
                        src={featuredPost.thumbnail_url} 
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-20 w-20 text-brand-emerald/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Type Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${getTypeColor(featuredPost.type)} border font-medium`}>
                        {featuredPost.type}
                      </Badge>
                    </div>
                    
                    {/* Featured Label */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-brand-yellow text-brand-yellow-dark font-semibold border-0">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 lg:p-8">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <time dateTime={featuredPost.created_at}>
                          {format(new Date(featuredPost.created_at), 'MMM dd, yyyy')}
                        </time>
                      </div>
                      {featuredPost.author && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1.5" />
                          <span>{featuredPost.author}</span>
                        </div>
                      )}
                      {featuredPost.read_time && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5" />
                          <span>{featuredPost.read_time} min read</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl lg:text-3xl font-bold text-foreground group-hover:text-brand-emerald transition-colors duration-300 mb-4 line-clamp-2">
                      {featuredPost.title}
                    </h3>
                    
                    {featuredPost.body && (
                      <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                        {featuredPost.body}
                      </p>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      className="text-brand-emerald hover:text-brand-emerald hover:bg-brand-emerald/10 p-0 h-auto font-semibold group/btn"
                      onClick={() => {
                        if (featuredPost.media_type === 'blog' && featuredPost.slug) {
                          window.open(`/blog/${featuredPost.slug}`, '_blank');
                        } else if (featuredPost.media_url) {
                          window.open(featuredPost.media_url, '_blank');
                        } else if (featuredPost.file_url) {
                          window.open(featuredPost.file_url, '_blank');
                        }
                      }}
                    >
                      Read Full Article
                      <ChevronRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </article>
            )}

            {/* Recent Posts List */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                Recent Posts
              </h3>
              <div className="space-y-4 flex-1">
                {recentPosts.map((post, index) => (
                  <article 
                    key={post.id}
                    className="group flex gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-brand-emerald/30 hover:bg-card transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      if (post.media_type === 'blog' && post.slug) {
                        window.open(`/blog/${post.slug}`, '_blank');
                      } else if (post.media_url) {
                        window.open(post.media_url, '_blank');
                      } else if (post.file_url) {
                        window.open(post.file_url, '_blank');
                      }
                    }}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-brand-emerald/10 to-brand-yellow/5">
                      {post.thumbnail_url ? (
                        <img 
                          src={post.thumbnail_url} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-brand-emerald/40" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`${getTypeColor(post.type)} text-xs border`}>
                          {post.type}
                        </Badge>
                        {post.department && (
                          <span className="text-xs text-muted-foreground">
                            {post.department.name.replace('Department of ', '')}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-foreground group-hover:text-brand-emerald transition-colors line-clamp-2 text-sm lg:text-base mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <time dateTime={post.created_at}>
                          {format(new Date(post.created_at), 'MMM dd, yyyy')}
                        </time>
                        {post.author && (
                          <>
                            <span>•</span>
                            <span>{post.author}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex-shrink-0 flex items-center">
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-brand-emerald group-hover:translate-x-1 transition-all" />
                    </div>
                  </article>
                ))}
              </div>
              
              {/* Mobile CTA */}
              <div className="mt-6 lg:hidden">
                <Link to="/publications" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-white"
                  >
                    View All Posts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
