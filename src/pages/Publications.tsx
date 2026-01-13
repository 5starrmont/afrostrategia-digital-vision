import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, FileText, Play, Search, ArrowRight, ArrowUpRight, LayoutGrid, List, Filter, Calendar, User, TrendingUp, Newspaper, Video, FileBarChart, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

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
  source?: "content" | "reports";
}

const Publications = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"magazine" | "grid">("magazine");

  useEffect(() => {
    const title = "Publications & Research | AfroStrategia Foundation";
    const description = "Explore AfroStrategia publications, research reports, videos and insights on Africa's digital transformation.";
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
    const canonicalUrl = `${window.location.origin}/publications`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, []);

  useEffect(() => {
    fetchContent();
    const contentChannel = supabase
      .channel("publications-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "content", filter: "published=eq.true" }, () => fetchContent())
      .subscribe();
    const reportsChannel = supabase
      .channel("reports-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "reports", filter: "public=eq.true" }, () => fetchContent())
      .subscribe();
    return () => {
      supabase.removeChannel(contentChannel);
      supabase.removeChannel(reportsChannel);
    };
  }, []);

  const fetchContent = async () => {
    try {
      const { data: contentData, error: contentError } = await supabase
        .from("content")
        .select(`*, department:departments(name, slug)`)
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (contentError) throw contentError;

      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select(`id, title, description, author, created_at, file_url, file_name, thumbnail_url, department_id, departments!reports_department_id_fkey(name, slug)`)
        .eq("public", true)
        .order("created_at", { ascending: false });
      if (reportsError) throw reportsError;

      const transformedReports = (reportsData || []).map((report) => ({
        id: report.id,
        title: report.title,
        body: report.description,
        type: "Research",
        created_at: report.created_at,
        file_url: report.file_url,
        file_name: report.file_name,
        media_type: null,
        media_url: null,
        thumbnail_url: report.thumbnail_url,
        slug: null,
        author: report.author || "AfroStrategia",
        read_time: null,
        department: report.departments ? { name: report.departments.name, slug: report.departments.slug } : null,
        source: "reports" as const,
      }));

      const allContent = [
        ...(contentData || []).map((c) => ({ ...c, source: "content" as const })),
        ...transformedReports,
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setContent(allContent);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenContent = (item: Content) => {
    if (item.media_type === "blog" && item.slug) {
      navigate(`/blog/${item.slug}`);
    } else if (item.media_url) {
      window.open(item.media_url, "_blank");
    } else if (item.file_url) {
      window.open(item.file_url, "_blank");
    }
  };

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || item.type.toLowerCase() === selectedType.toLowerCase();
      const matchesDepartment = selectedDepartment === "all" || item.department?.slug === selectedDepartment;
      return matchesSearch && matchesType && matchesDepartment;
    });
  }, [content, searchTerm, selectedType, selectedDepartment]);

  const contentTypes = useMemo(() => [...new Set(content.map((item) => item.type))].sort((a, b) => a.localeCompare(b)), [content]);
  const departments = useMemo(() => [...new Set(content.filter((item) => item.department).map((item) => item.department!))].sort((a, b) => a.name.localeCompare(b.name)), [content]);
  const typeCounts = useMemo(() => content.reduce<Record<string, number>>((acc, item) => { acc[item.type] = (acc[item.type] || 0) + 1; return acc; }, {}), [content]);

  const heroPost = filteredContent[0];
  const secondaryPosts = filteredContent.slice(1, 3);
  const editorsPicks = filteredContent.slice(3, 6);
  const remainingPosts = filteredContent.slice(6);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return <Video className="h-3.5 w-3.5" />;
      case 'research': return <FileBarChart className="h-3.5 w-3.5" />;
      case 'blog': return <Newspaper className="h-3.5 w-3.5" />;
      default: return <FileText className="h-3.5 w-3.5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return 'bg-red-500';
      case 'research': return 'bg-primary';
      case 'blog': return 'bg-brand';
      case 'policy': return 'bg-blue-500';
      default: return 'bg-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8 animate-pulse">
            <div className="h-12 w-72 bg-muted rounded-lg" />
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="h-[500px] bg-muted rounded-2xl" />
              <div className="space-y-4">
                <div className="h-60 bg-muted rounded-xl" />
                <div className="h-60 bg-muted rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Masthead */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 lg:py-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="h-1 w-12 bg-primary rounded-full" />
                <span className="text-sm font-medium uppercase tracking-widest text-primary">
                  Insights & Analysis
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-7xl font-serif font-bold text-foreground tracking-tight leading-[0.9]"
              >
                The Digital
                <br />
                <span className="italic text-primary">Africa</span> Journal
              </motion.h1>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>{content.length} Publications</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-border" />
              <span className="hidden sm:block">{format(new Date(), "MMMM yyyy")}</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setSelectedType("all")}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  selectedType === "all" 
                    ? "bg-foreground text-background" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                All
              </button>
              {contentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type.toLowerCase() ? "all" : type.toLowerCase())}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
                    selectedType === type.toLowerCase()
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {getTypeIcon(type)}
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40 bg-muted/50 border-0 hidden md:flex">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.slug} value={dept.slug}>
                      {dept.name.replace("Department of ", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {filteredContent.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No publications found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Hero Section - Featured Story */}
              {heroPost && (
                <section className="mb-16">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid lg:grid-cols-2 gap-0 bg-foreground rounded-3xl overflow-hidden group cursor-pointer"
                    onClick={() => handleOpenContent(heroPost)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
                      {heroPost.thumbnail_url ? (
                        <img
                          src={heroPost.thumbnail_url}
                          alt={heroPost.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-brand/20 flex items-center justify-center">
                          <BookOpen className="h-24 w-24 text-primary/30" />
                        </div>
                      )}
                      {heroPost.media_type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-background/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play className="h-8 w-8 text-foreground ml-1" fill="currentColor" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-6 left-6">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white ${getTypeColor(heroPost.type)}`}>
                          {heroPost.type}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="mb-4">
                        <span className="text-primary text-sm font-medium uppercase tracking-wider">
                          Featured Story
                        </span>
                      </div>
                      <h2 className="text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-background leading-tight mb-6 group-hover:text-primary transition-colors">
                        {heroPost.title}
                      </h2>
                      {heroPost.body && (
                        <p className="text-background/70 text-lg leading-relaxed mb-8 line-clamp-3">
                          {heroPost.body.replace(/<[^>]*>/g, "").slice(0, 200)}...
                        </p>
                      )}
                      <div className="flex items-center gap-6 text-background/60 text-sm">
                        {heroPost.author && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span>{heroPost.author}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(heroPost.created_at), "MMM d, yyyy")}</span>
                        </div>
                        {heroPost.read_time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{heroPost.read_time} min read</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-8">
                        <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                          Read Full Story
                          <ArrowRight className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </section>
              )}

              {/* Secondary Stories - Asymmetric Grid */}
              {secondaryPosts.length > 0 && (
                <section className="mb-16">
                  <div className="grid md:grid-cols-2 gap-6">
                    {secondaryPosts.map((post, index) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleOpenContent(post)}
                        className="group cursor-pointer bg-muted/30 rounded-2xl overflow-hidden hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row h-full">
                          <div className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto overflow-hidden">
                            {post.thumbnail_url ? (
                              <img
                                src={post.thumbnail_url}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-primary/10 to-brand/10 flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-primary/30" />
                              </div>
                            )}
                            {post.media_type === "video" && (
                              <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                                <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center">
                                  <Play className="h-5 w-5 text-foreground ml-0.5" fill="currentColor" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-6 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`w-2 h-2 rounded-full ${getTypeColor(post.type)}`} />
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {post.type}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            {post.body && (
                              <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                                {post.body.replace(/<[^>]*>/g, "").slice(0, 120)}...
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
                              {post.author && <span>{post.author}</span>}
                              <span>{format(new Date(post.created_at), "MMM d")}</span>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </section>
              )}

              {/* Editor's Picks Section */}
              {editorsPicks.length > 0 && (
                <section className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-brand" />
                      <h2 className="text-2xl font-serif font-bold text-foreground">Editor's Picks</h2>
                    </div>
                    <div className="h-px flex-1 bg-border ml-6" />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    {editorsPicks.map((post, index) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleOpenContent(post)}
                        className="group cursor-pointer"
                      >
                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
                          {post.thumbnail_url ? (
                            <img
                              src={post.thumbnail_url}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-brand/10 flex items-center justify-center">
                              <BookOpen className="h-10 w-10 text-primary/30" />
                            </div>
                          )}
                          {post.media_type === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                              <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center">
                                <Play className="h-4 w-4 text-foreground ml-0.5" fill="currentColor" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${getTypeColor(post.type)}`}>
                              {post.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {post.department && (
                            <span className="text-xs font-medium text-primary">
                              {post.department.name.replace("Department of ", "")}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {post.author && <span>{post.author}</span>}
                          <span>•</span>
                          <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </section>
              )}

              {/* Latest Stories - Magazine List */}
              {remainingPosts.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-serif font-bold text-foreground">Latest Stories</h2>
                    </div>
                    <div className="h-px flex-1 bg-border ml-6" />
                  </div>

                  <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Column */}
                    <div className="lg:col-span-8 space-y-0 divide-y divide-border">
                      {remainingPosts.slice(0, 8).map((post, index) => (
                        <motion.article
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleOpenContent(post)}
                          className="group cursor-pointer py-8 first:pt-0"
                        >
                          <div className="flex gap-6">
                            {/* Number */}
                            <div className="hidden sm:block flex-shrink-0">
                              <span className="text-5xl font-serif font-bold text-muted/50">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-3">
                                <span className={`w-2 h-2 rounded-full ${getTypeColor(post.type)}`} />
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  {post.type}
                                </span>
                                {post.department && (
                                  <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-xs text-primary font-medium">
                                      {post.department.name.replace("Department of ", "")}
                                    </span>
                                  </>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                              {post.body && (
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                                  {post.body.replace(/<[^>]*>/g, "").slice(0, 160)}...
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {post.author && (
                                  <span className="font-medium text-foreground/80">{post.author}</span>
                                )}
                                <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                                {post.read_time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {post.read_time} min
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Thumbnail */}
                            <div className="hidden md:block flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
                              {post.thumbnail_url ? (
                                <img
                                  src={post.thumbnail_url}
                                  alt={post.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-brand/10 flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-primary/30" />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                      <div className="sticky top-36 space-y-8">
                        {/* Topics */}
                        <div className="bg-muted/30 rounded-2xl p-6">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                            Browse by Topic
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {departments.map((dept) => (
                              <button
                                key={dept.slug}
                                onClick={() => setSelectedDepartment(selectedDepartment === dept.slug ? "all" : dept.slug)}
                                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                  selectedDepartment === dept.slug
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                              >
                                {dept.name.replace("Department of ", "")}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
                          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">
                            Content Library
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(typeCounts).slice(0, 4).map(([type, count]) => (
                              <div key={type} className="text-center">
                                <p className="text-3xl font-bold">{count}</p>
                                <p className="text-xs opacity-70 capitalize">{type}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Newsletter CTA */}
                        <div className="border border-border rounded-2xl p-6">
                          <h3 className="text-lg font-bold text-foreground mb-2">Stay Updated</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Get the latest insights on Africa's digital transformation delivered to your inbox.
                          </p>
                          <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                            Subscribe
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </aside>
                  </div>

                  {/* More Stories Grid */}
                  {remainingPosts.length > 8 && (
                    <div className="mt-16">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-serif font-bold text-foreground">More Stories</h2>
                        <div className="h-px flex-1 bg-border ml-6" />
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {remainingPosts.slice(8).map((post, index) => (
                          <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleOpenContent(post)}
                            className="group cursor-pointer"
                          >
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                              {post.thumbnail_url ? (
                                <img
                                  src={post.thumbnail_url}
                                  alt={post.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-brand/10 flex items-center justify-center">
                                  <BookOpen className="h-8 w-8 text-primary/30" />
                                </div>
                              )}
                              <div className="absolute top-2 left-2">
                                <span className={`w-2 h-2 rounded-full inline-block ${getTypeColor(post.type)}`} />
                              </div>
                            </div>
                            <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-1">
                              {post.title}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(post.created_at), "MMM d")}
                            </span>
                          </motion.article>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default Publications;
