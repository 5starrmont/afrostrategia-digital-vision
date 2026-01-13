import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, FileText, Play, Search, ArrowRight, ChevronRight, LayoutGrid, List, Filter, Calendar, User, TrendingUp, Newspaper, Video, FileBarChart } from "lucide-react";
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

  const featuredPost = filteredContent[0];
  const remainingPosts = filteredContent.slice(1);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'research': return <FileBarChart className="h-4 w-4" />;
      case 'blog': return <Newspaper className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeStyle = (type: string, isActive = false) => {
    if (isActive) return "bg-emerald-700 text-white shadow-lg";
    switch (type.toLowerCase()) {
      case 'video': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'research': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'blog': return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100';
      case 'policy': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="bg-gradient-to-br from-emerald-50 via-white to-yellow-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8 animate-pulse">
              <div className="h-8 w-48 bg-emerald-100 rounded-lg" />
              <div className="h-14 w-96 bg-gray-200 rounded-lg" />
              <div className="h-6 w-80 bg-gray-100 rounded" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-72 bg-white rounded-2xl shadow-sm" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-yellow-50 py-16 lg:py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-100 mb-6"
            >
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Publications & Research</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{content.length} items</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6"
            >
              Insights Shaping{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-yellow-600">
                Africa's Digital Future
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 leading-relaxed mb-8"
            >
              Explore our comprehensive collection of research papers, policy briefs, blog articles, 
              and multimedia content on digital governance, trade, and innovation across Africa.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              {Object.entries(typeCounts).slice(0, 4).map(([type, count], index) => (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => setSelectedType(selectedType === type.toLowerCase() ? "all" : type.toLowerCase())}
                  className={`flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                    selectedType === type.toLowerCase() ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    type.toLowerCase() === 'research' ? 'bg-emerald-100 text-emerald-600' :
                    type.toLowerCase() === 'blog' ? 'bg-yellow-100 text-yellow-600' :
                    type.toLowerCase() === 'video' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getTypeIcon(type)}
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500 capitalize">{type}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search publications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-36 border-gray-200">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {contentTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48 border-gray-200 hidden md:flex">
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

            {/* View Toggle & Results Count */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filteredContent.length}</span> results
              </span>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedType("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                selectedType === "all" ? "bg-emerald-700 text-white border-emerald-700" : "bg-white border-gray-200 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              All Publications
            </motion.button>
            {contentTypes.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(selectedType === type.toLowerCase() ? "all" : type.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 border ${
                  selectedType === type.toLowerCase() ? getTypeStyle(type, true) : getTypeStyle(type)
                }`}
              >
                {getTypeIcon(type)}
                {type}
                <span className="opacity-60">({typeCounts[type] || 0})</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {filteredContent.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">No publications found</h2>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
                <Button 
                  onClick={() => { setSearchTerm(""); setSelectedType("all"); setSelectedDepartment("all"); }}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  Clear All Filters
                </Button>
              </motion.div>
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
                    className="group"
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer"
                      onClick={() => handleOpenContent(featuredPost)}
                      onMouseEnter={() => setHoveredCard(featuredPost.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="grid lg:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[400px] overflow-hidden">
                          <motion.div
                            animate={{ scale: hoveredCard === featuredPost.id ? 1.05 : 1 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0"
                          >
                            {featuredPost.thumbnail_url ? (
                              <img src={featuredPost.thumbnail_url} alt={featuredPost.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-yellow-100 flex items-center justify-center">
                                <FileText className="h-20 w-20 text-emerald-300" />
                              </div>
                            )}
                          </motion.div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-transparent" />
                          
                          {/* Featured Badge */}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="inline-flex items-center gap-1.5 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                              <TrendingUp className="h-3.5 w-3.5" />
                              Featured
                            </span>
                          </div>

                          {/* Video Play Button */}
                          {featuredPost.type.toLowerCase() === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center shadow-2xl"
                              >
                                <Play className="h-8 w-8 text-emerald-700 ml-1" />
                              </motion.div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className="flex items-center gap-3 flex-wrap mb-4">
                            <Badge className={`border ${getTypeStyle(featuredPost.type)}`}>
                              {getTypeIcon(featuredPost.type)}
                              <span className="ml-1.5">{featuredPost.type}</span>
                            </Badge>
                            {featuredPost.department && (
                              <Badge variant="outline" className="text-gray-600 border-gray-200">
                                {featuredPost.department.name.replace("Department of ", "")}
                              </Badge>
                            )}
                          </div>

                          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors leading-tight">
                            {featuredPost.title}
                          </h2>

                          {featuredPost.body && (
                            <p className="text-gray-600 text-lg mb-6 line-clamp-3">{featuredPost.body}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            {featuredPost.author && (
                              <span className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {featuredPost.author}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(featuredPost.created_at), "MMM d, yyyy")}
                            </span>
                            {featuredPost.read_time && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {featuredPost.read_time} min read
                              </span>
                            )}
                          </div>

                          <Button className="w-fit bg-emerald-700 hover:bg-emerald-800 text-white group/btn">
                            Read Full Article
                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                )}

                {/* Content Grid/List */}
                {remainingPosts.length > 0 && (
                  <div className={viewMode === 'grid' ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
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
                          <Card
                            className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full bg-white"
                            onClick={() => handleOpenContent(item)}
                          >
                            <div className="relative aspect-[16/10] overflow-hidden">
                              <motion.div
                                animate={{ scale: hoveredCard === item.id ? 1.05 : 1 }}
                                transition={{ duration: 0.4 }}
                                className="w-full h-full"
                              >
                                {item.thumbnail_url ? (
                                  <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-yellow-50 flex items-center justify-center">
                                    <FileText className="h-12 w-12 text-emerald-200" />
                                  </div>
                                )}
                              </motion.div>

                              {item.type.toLowerCase() === "video" && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <motion.div
                                    animate={{ scale: hoveredCard === item.id ? 1.1 : 1 }}
                                    className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg"
                                  >
                                    <Play className="h-6 w-6 text-emerald-700 ml-0.5" />
                                  </motion.div>
                                </div>
                              )}

                              <div className="absolute top-3 left-3">
                                <Badge className={`border text-xs ${getTypeStyle(item.type)}`}>
                                  {item.type}
                                </Badge>
                              </div>
                            </div>

                            <CardContent className="p-5">
                              {item.department && (
                                <span className="text-xs text-emerald-600 font-medium mb-2 block">
                                  {item.department.name.replace("Department of ", "")}
                                </span>
                              )}
                              
                              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2 text-lg">
                                {item.title}
                              </h3>

                              {item.body && (
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{item.body}</p>
                              )}

                              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                  {item.author && <span>{item.author}</span>}
                                  <span>•</span>
                                  <time>{format(new Date(item.created_at), "MMM d, yyyy")}</time>
                                </div>
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-emerald-600" />
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card
                            className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
                            onClick={() => handleOpenContent(item)}
                          >
                            <CardContent className="p-4 sm:p-5">
                              <div className="flex gap-4 sm:gap-6">
                                <div className="flex-shrink-0 w-28 h-20 sm:w-44 sm:h-28 rounded-xl overflow-hidden">
                                  <motion.div
                                    animate={{ scale: hoveredCard === item.id ? 1.05 : 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full"
                                  >
                                    {item.thumbnail_url ? (
                                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-yellow-50 flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-emerald-200" />
                                      </div>
                                    )}
                                  </motion.div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    <Badge className={`border text-xs ${getTypeStyle(item.type)}`}>
                                      {item.type}
                                    </Badge>
                                    {item.department && (
                                      <span className="text-xs text-gray-500">
                                        {item.department.name.replace("Department of ", "")}
                                      </span>
                                    )}
                                  </div>

                                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
                                    {item.title}
                                  </h3>

                                  {item.body && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 hidden sm:block">{item.body}</p>
                                  )}

                                  <div className="flex items-center gap-3 text-xs text-gray-500">
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
                                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-700 transition-all">
                                    <ArrowRight className="h-5 w-5 text-emerald-600 group-hover:text-white transition-colors" />
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Publications;
