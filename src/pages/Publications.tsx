import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, FileText, Play, Search, TrendingUp, Sparkles, ArrowRight, ChevronRight, Filter, LayoutGrid, List } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // SEO (no extra deps)
  useEffect(() => {
    const title = "Publications | AfroStrategia Foundation";
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "content",
          filter: "published=eq.true",
        },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    const reportsChannel = supabase
      .channel("reports-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
          filter: "public=eq.true",
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
        .from("content")
        .select(
          `
          *,
          department:departments(name, slug)
        `
        )
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (contentError) throw contentError;

      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select(
          `
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
        `
        )
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
        department: report.departments
          ? {
              name: report.departments.name,
              slug: report.departments.slug,
            }
          : null,
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

  const contentTypes = useMemo(() => {
    return [...new Set(content.map((item) => item.type))].sort((a, b) => a.localeCompare(b));
  }, [content]);

  const departments = useMemo(() => {
    return [...new Set(content.filter((item) => item.department).map((item) => item.department!))].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [content]);

  const typeCounts = useMemo(() => {
    return content.reduce<Record<string, number>>((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
  }, [content]);

  const featuredPost = filteredContent[0];
  const remainingPosts = filteredContent.slice(1);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'report':
        return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
      case 'policy':
        return 'bg-brand/10 text-brand border-brand/20 hover:bg-brand/20';
      case 'research':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20';
      case 'blog':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20';
      case 'video':
        return 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20';
      case 'infographic':
        return 'bg-teal-500/10 text-teal-600 border-teal-500/20 hover:bg-teal-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border hover:bg-accent';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Play className="h-3 w-3" />;
      case 'research':
        return <BookOpen className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Animated loading skeleton */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-brand/5" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-6 w-32 bg-muted rounded-full animate-pulse" />
                <div className="h-12 w-96 bg-muted rounded-lg animate-pulse" />
                <div className="h-6 w-72 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-80 bg-gradient-to-br from-muted to-muted/50 rounded-3xl animate-pulse" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Hero Section */}
      <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-brand/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <BackButton className="mb-8" />

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Latest Updates
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {content.length} publications
                  </span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
                    Latest Content
                  </span>
                  <br />
                  <span className="text-primary">&</span>{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand to-foreground">
                    Publications
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-lg text-muted-foreground"
                >
                  Research, reports, and strategic insights shaping Africa's digital transformation.
                </motion.p>
              </div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex gap-4"
              >
                {Object.entries(typeCounts).slice(0, 3).map(([type, count], index) => (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                    className="bg-card/80 backdrop-blur border border-border/50 rounded-2xl p-4 min-w-[100px] text-center hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedType(type.toLowerCase())}
                  >
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <div className="text-xs text-muted-foreground capitalize">{type}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-3 items-center w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search publications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40 bg-card/50 border-border/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {contentTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48 bg-card/50 border-border/50 hidden sm:flex">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.slug} value={dept.slug}>
                      {dept.name.replace("Department of ", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {filteredContent.length} results
              </span>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-background shadow-sm' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedType === "all"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card border border-border hover:border-primary/50 text-foreground"
              }`}
            >
              All
            </motion.button>
            {contentTypes.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedType(selectedType === type.toLowerCase() ? "all" : type.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedType === type.toLowerCase()
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : `border ${getTypeColor(type)}`
                }`}
              >
                {getTypeIcon(type)}
                {type}
                <span className="ml-1 opacity-60">({typeCounts[type] || 0})</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        <AnimatePresence mode="wait">
          {filteredContent.length === 0 ? (
            <motion.section
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">No publications found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
              <Button onClick={() => { setSearchTerm(""); setSelectedType("all"); setSelectedDepartment("all"); }}>
                Clear Filters
              </Button>
            </motion.section>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Featured Post */}
              {featuredPost && (
                <motion.article
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="group relative"
                >
                  <div
                    className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-xl cursor-pointer"
                    onClick={() => handleOpenContent(featuredPost)}
                    onMouseEnter={() => setHoveredCard(featuredPost.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Image Section */}
                      <div className="relative aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden">
                        <motion.div
                          animate={{ scale: hoveredCard === featuredPost.id ? 1.05 : 1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="absolute inset-0"
                        >
                          {featuredPost.thumbnail_url ? (
                            <img
                              src={featuredPost.thumbnail_url}
                              alt={featuredPost.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent to-brand/20 flex items-center justify-center">
                              <FileText className="h-20 w-20 text-primary/30" />
                            </div>
                          )}
                        </motion.div>
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r" />
                        
                        {/* Featured Label */}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className="bg-brand text-brand-foreground border-0 shadow-lg">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        </div>

                        {/* Video Play Button */}
                        {featuredPost.type.toLowerCase() === "video" && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-20 h-20 bg-background/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                              <Play className="h-8 w-8 text-foreground ml-1" />
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-3 flex-wrap mb-4">
                          <Badge className={`border ${getTypeColor(featuredPost.type)}`}>
                            {getTypeIcon(featuredPost.type)}
                            <span className="ml-1">{featuredPost.type}</span>
                          </Badge>
                          {featuredPost.department && (
                            <Badge variant="outline" className="text-muted-foreground">
                              {featuredPost.department.name.replace("Department of ", "")}
                            </Badge>
                          )}
                        </div>

                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>

                        {featuredPost.body && (
                          <p className="text-muted-foreground text-lg mb-6 line-clamp-3">
                            {featuredPost.body}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                          {featuredPost.author && (
                            <span className="font-medium text-foreground">{featuredPost.author}</span>
                          )}
                          <span>•</span>
                          <time>{format(new Date(featuredPost.created_at), "MMM d, yyyy")}</time>
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

                        <Button className="w-fit group/btn bg-primary hover:bg-primary/90">
                          Read Article
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              )}

              {/* Content Grid/List */}
              {remainingPosts.length > 0 && (
                <div className={viewMode === 'grid' 
                  ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
                }>
                  {remainingPosts.map((item, index) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      className="group"
                      onMouseEnter={() => setHoveredCard(item.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {viewMode === 'grid' ? (
                        // Grid Card
                        <Card
                          className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
                          onClick={() => handleOpenContent(item)}
                        >
                          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                            <motion.div
                              animate={{ scale: hoveredCard === item.id ? 1.08 : 1 }}
                              transition={{ duration: 0.4 }}
                              className="w-full h-full"
                            >
                              {item.thumbnail_url ? (
                                <img
                                  src={item.thumbnail_url}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-brand/10 flex items-center justify-center">
                                  <FileText className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                              )}
                            </motion.div>
                            
                            {/* Overlay on hover */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: hoveredCard === item.id ? 1 : 0 }}
                              className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                            />

                            {/* Video play icon */}
                            {item.type.toLowerCase() === "video" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                  animate={{ scale: hoveredCard === item.id ? 1.1 : 1 }}
                                  className="w-12 h-12 bg-background/90 rounded-full flex items-center justify-center shadow-lg"
                                >
                                  <Play className="h-5 w-5 text-foreground ml-0.5" />
                                </motion.div>
                              </div>
                            )}

                            {/* Type badge */}
                            <div className="absolute top-3 left-3">
                              <Badge className={`border text-xs ${getTypeColor(item.type)}`}>
                                {item.type}
                              </Badge>
                            </div>
                          </div>

                          <CardContent className="p-5">
                            {item.department && (
                              <span className="text-xs text-muted-foreground mb-2 block">
                                {item.department.name.replace("Department of ", "")}
                              </span>
                            )}
                            
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                              {item.title}
                            </h3>

                            {item.body && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {item.body}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                {item.author && <span>{item.author}</span>}
                                <span>•</span>
                                <time>{format(new Date(item.created_at), "MMM d")}</time>
                              </div>
                              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-primary" />
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        // List Card
                        <Card
                          className="overflow-hidden border-border/50 hover:border-primary/30 hover:bg-accent/50 transition-all duration-300 cursor-pointer"
                          onClick={() => handleOpenContent(item)}
                        >
                          <CardContent className="p-4 sm:p-5">
                            <div className="flex gap-4 sm:gap-6">
                              <div className="flex-shrink-0 w-24 h-20 sm:w-40 sm:h-28 rounded-xl overflow-hidden bg-muted">
                                <motion.div
                                  animate={{ scale: hoveredCard === item.id ? 1.05 : 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="w-full h-full"
                                >
                                  {item.thumbnail_url ? (
                                    <img
                                      src={item.thumbnail_url}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-brand/10 flex items-center justify-center">
                                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                  )}
                                </motion.div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <Badge className={`border text-xs ${getTypeColor(item.type)}`}>
                                    {item.type}
                                  </Badge>
                                  {item.department && (
                                    <span className="text-xs text-muted-foreground">
                                      {item.department.name.replace("Department of ", "")}
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                  {item.title}
                                </h3>

                                {item.body && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 hidden sm:block">
                                    {item.body}
                                  </p>
                                )}

                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {item.author && <span>{item.author}</span>}
                                  <span>•</span>
                                  <time>{format(new Date(item.created_at), "MMM d, yyyy")}</time>
                                  {item.read_time && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {item.read_time} min
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="hidden sm:flex items-center">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                  <ArrowRight className="h-5 w-5" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Publications;
