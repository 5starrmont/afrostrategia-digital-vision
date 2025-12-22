import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, User, Play, Eye, Clock, Search, Filter, ArrowRight, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

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

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'report':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'policy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'research':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'blog':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'video':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'infographic':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-muted text-muted-foreground';
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
  const remainingPosts = filteredContent.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <BackButton />
            <h1 className="text-xl font-bold text-foreground">Blog & Publications</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-border/50 focus:bg-background"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-40 bg-muted/50 border-border/50">
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
              <SelectTrigger className="w-full sm:w-48 bg-muted/50 border-border/50">
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
          <p className="text-sm text-muted-foreground mt-4">
            {filteredContent.length} article{filteredContent.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredContent.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Post */}
            {featuredPost && (
              <article 
                className="group cursor-pointer"
                onClick={() => handleOpenContent(featuredPost)}
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {featuredPost.thumbnail_url ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                      <img 
                        src={featuredPost.thumbnail_url} 
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {featuredPost.type.toLowerCase() === 'video' && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <Play className="h-6 w-6 text-foreground ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <FileText className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getTypeColor(featuredPost.type)} text-xs font-medium`}>
                        {featuredPost.type}
                      </Badge>
                      {featuredPost.department && (
                        <span className="text-xs text-muted-foreground">
                          {featuredPost.department.name.replace('Department of ', '')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.body && (
                      <p className="text-muted-foreground leading-relaxed line-clamp-3">
                        {featuredPost.body}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {featuredPost.author && (
                        <span className="font-medium text-foreground">{featuredPost.author}</span>
                      )}
                      <time dateTime={featuredPost.created_at}>
                        {format(new Date(featuredPost.created_at), 'MMM d, yyyy')}
                      </time>
                      {featuredPost.read_time && (
                        <span>{featuredPost.read_time} min read</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenContent(featuredPost);
                        }}
                      >
                        Read Article
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      {featuredPost.file_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(featuredPost.file_url!, '_blank');
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Divider */}
            {remainingPosts.length > 0 && (
              <div className="border-t border-border/50" />
            )}

            {/* Article List */}
            <div className="space-y-0 divide-y divide-border/50">
              {remainingPosts.map((item) => (
                <article 
                  key={item.id}
                  className="group py-8 first:pt-0 cursor-pointer"
                  onClick={() => handleOpenContent(item)}
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    {item.thumbnail_url ? (
                      <div className="hidden sm:block flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={item.thumbnail_url} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="hidden sm:flex flex-shrink-0 w-48 h-32 rounded-lg bg-gradient-to-br from-muted to-muted/50 items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`${getTypeColor(item.type)} text-xs font-medium`}>
                          {item.type}
                        </Badge>
                        {item.department && (
                          <span className="text-xs text-muted-foreground">
                            {item.department.name.replace('Department of ', '')}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      
                      {item.body && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.body}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {item.author && (
                          <span className="font-medium text-foreground/80">{item.author}</span>
                        )}
                        <time dateTime={item.created_at}>
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                        </time>
                        {item.read_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.read_time} min
                          </span>
                        )}
                        {item.file_url && (
                          <button 
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.file_url!, '_blank');
                            }}
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex items-center">
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Publications;
