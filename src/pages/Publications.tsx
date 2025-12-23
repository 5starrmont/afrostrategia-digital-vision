import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Play, Clock, Search, BookOpen } from "lucide-react";
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
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
      <header className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton className="mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Publications
          </h1>
          <p className="text-muted-foreground text-lg">
            Research, insights, and perspectives on Africa's digital transformation
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search publications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-36">
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
                <SelectTrigger className="w-full sm:w-44">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredContent.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No publications found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Article */}
            {featuredPost && (
              <article 
                className="group cursor-pointer"
                onClick={() => handleOpenContent(featuredPost)}
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                    {featuredPost.thumbnail_url ? (
                      <img 
                        src={featuredPost.thumbnail_url} 
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    {featuredPost.type.toLowerCase() === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-background/90 rounded-full flex items-center justify-center shadow-lg">
                          <Play className="h-6 w-6 text-foreground ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{featuredPost.type}</Badge>
                      {featuredPost.department && (
                        <span className="text-sm text-muted-foreground">
                          {featuredPost.department.name.replace('Department of ', '')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    {featuredPost.body && (
                      <p className="text-muted-foreground line-clamp-3">
                        {featuredPost.body}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {featuredPost.author && (
                        <span className="font-medium text-foreground">{featuredPost.author}</span>
                      )}
                      <time>{format(new Date(featuredPost.created_at), 'MMM d, yyyy')}</time>
                      {featuredPost.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {featuredPost.read_time} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Divider */}
            {remainingPosts.length > 0 && (
              <div className="border-t border-border" />
            )}

            {/* Article List */}
            {remainingPosts.length > 0 && (
              <div className="space-y-8">
                {remainingPosts.map((item) => (
                  <article 
                    key={item.id}
                    className="group cursor-pointer"
                    onClick={() => handleOpenContent(item)}
                  >
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 w-32 h-24 md:w-48 md:h-32 bg-muted rounded-lg overflow-hidden">
                        {item.thumbnail_url ? (
                          <img 
                            src={item.thumbnail_url} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                          {item.department && (
                            <span className="text-xs text-muted-foreground">
                              {item.department.name.replace('Department of ', '')}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        {item.body && (
                          <p className="text-muted-foreground text-sm line-clamp-2 hidden md:block">
                            {item.body}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {item.author && <span>{item.author}</span>}
                          <time>{format(new Date(item.created_at), 'MMM d, yyyy')}</time>
                          {item.read_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.read_time} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Publications;
