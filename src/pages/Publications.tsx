import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, FileText, Play, Search, TrendingUp } from "lucide-react";
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
  source?: "content" | "reports";
}

const Publications = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

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

  const FiltersUI = ({ layout }: { layout: "bar" | "sidebar" }) => {
    const isBar = layout === "bar";

    return (
      <div className={isBar ? "flex flex-col sm:flex-row gap-4 items-center" : "space-y-4"}>
        <div className={isBar ? "relative flex-1 max-w-md w-full" : "relative"}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search publications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className={isBar ? "flex gap-3 w-full sm:w-auto" : "grid grid-cols-1 gap-3"}>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className={isBar ? "w-full sm:w-40" : "w-full"}>
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
            <SelectTrigger className={isBar ? "w-full sm:w-56" : "w-full"}>
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-muted rounded w-72" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent">
      <header className="border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <BackButton className="mb-6" />

          <div className="max-w-3xl">
            <div className="h-1 w-20 rounded-full bg-gradient-to-r from-primary to-brand mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Latest Content & Publications</h1>
            <p className="text-muted-foreground text-lg">
              Research, reports, and insights shaping Africas digital transformation.
            </p>
          </div>
        </div>
      </header>

      {/* Mobile filter bar */}
      <div className="lg:hidden sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <FiltersUI layout="bar" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filteredContent.length === 0 ? (
          <section className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No publications found</h2>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr_280px]">
            {/* Left sidebar (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Filter</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FiltersUI layout="sidebar" />
                    <Separator />
                    <div className="text-sm text-muted-foreground">
                      Showing <span className="font-medium text-foreground">{filteredContent.length}</span> results
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Content types
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contentTypes.map((type) => {
                      const active = selectedType !== "all" && selectedType.toLowerCase() === type.toLowerCase();
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedType(active ? "all" : type.toLowerCase())}
                          className={
                            "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors " +
                            (active
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent text-foreground")
                          }
                        >
                          <span className="font-medium">{type}</span>
                          <span className={active ? "text-primary-foreground/80" : "text-muted-foreground"}>
                            {typeCounts[type] ?? 0}
                          </span>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Center content */}
            <section className="space-y-10">
              {/* Featured */}
              {featuredPost && (
                <article>
                  <Card className="overflow-hidden">
                    <div className="grid md:grid-cols-5 gap-0">
                      <div className="md:col-span-2">
                        <div className="relative aspect-[4/3] bg-muted">
                          {featuredPost.thumbnail_url ? (
                            <img
                              loading="lazy"
                              src={featuredPost.thumbnail_url}
                              alt={featuredPost.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <FileText className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}

                          {featuredPost.type.toLowerCase() === "video" && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 bg-background/90 rounded-full flex items-center justify-center shadow-lg">
                                <Play className="h-6 w-6 text-foreground ml-1" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-3 p-6">
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <Badge className="bg-primary text-primary-foreground">{featuredPost.type}</Badge>
                          {featuredPost.department && (
                            <Badge variant="outline">{featuredPost.department.name.replace("Department of ", "")}</Badge>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenContent(featuredPost)}
                          className="text-left"
                        >
                          <h2 className="text-2xl md:text-3xl font-bold text-foreground hover:text-primary transition-colors leading-tight">
                            {featuredPost.title}
                          </h2>
                        </button>

                        {featuredPost.body && (
                          <p className="text-muted-foreground mt-3 line-clamp-3">{featuredPost.body}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-5">
                          {featuredPost.author && (
                            <span className="font-medium text-foreground">{featuredPost.author}</span>
                          )}
                          <time>{format(new Date(featuredPost.created_at), "MMM d, yyyy")}</time>
                          {featuredPost.read_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {featuredPost.read_time} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </article>
              )}

              {/* List */}
              {remainingPosts.length > 0 && (
                <div className="space-y-4">
                  {remainingPosts.map((item) => (
                    <article key={item.id}>
                      <Card className="transition-colors hover:bg-accent">
                        <button
                          type="button"
                          onClick={() => handleOpenContent(item)}
                          className="w-full text-left"
                        >
                          <CardContent className="p-5">
                            <div className="flex gap-5">
                              <div className="flex-shrink-0 w-28 h-20 md:w-40 md:h-28 bg-muted rounded-lg overflow-hidden">
                                {item.thumbnail_url ? (
                                  <img
                                    loading="lazy"
                                    src={item.thumbnail_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FileText className="h-7 w-7 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <Badge variant="secondary">{item.type}</Badge>
                                  {item.department && (
                                    <span className="text-xs text-muted-foreground">
                                      {item.department.name.replace("Department of ", "")}
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-lg md:text-xl font-semibold text-foreground leading-snug line-clamp-2">
                                  {item.title}
                                </h3>

                                {item.body && (
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 hidden md:block">
                                    {item.body}
                                  </p>
                                )}

                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                                  {item.author && <span>{item.author}</span>}
                                  <time>{format(new Date(item.created_at), "MMM d, yyyy")}</time>
                                  {item.read_time && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {item.read_time} min
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </button>
                      </Card>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Right sidebar (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">All items</span>
                      <span className="font-semibold text-foreground">{content.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Filtered</span>
                      <span className="font-semibold text-foreground">{filteredContent.length}</span>
                    </div>
                    <Separator />
                    <p className="text-muted-foreground">
                      Tip: Use filters to browse by department, then scan titles in the list view.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Departments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {departments.slice(0, 8).map((dept) => {
                      const active = selectedDepartment !== "all" && selectedDepartment === dept.slug;
                      return (
                        <button
                          key={dept.slug}
                          type="button"
                          onClick={() => setSelectedDepartment(active ? "all" : dept.slug)}
                          className={
                            "w-full text-left rounded-md px-3 py-2 text-sm transition-colors " +
                            (active ? "bg-accent text-foreground" : "hover:bg-accent text-muted-foreground")
                          }
                        >
                          {dept.name.replace("Department of ", "")}
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default Publications;

