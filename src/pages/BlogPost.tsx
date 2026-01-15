import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, User, ArrowLeft, ChevronLeft, ChevronRight, Share2, Bookmark, Heart, Twitter, Linkedin, Link2, ArrowUpRight, Quote, Eye, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

interface BlogPostData {
  id: string;
  title: string;
  body: string | null;
  author: string | null;
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
  gallery_images: string[] | null;
  read_time: number | null;
  slug: string | null;
  department: {
    name: string;
    slug: string;
  } | null;
}

interface RelatedPost {
  id: string;
  title: string;
  thumbnail_url: string | null;
  created_at: string;
  slug: string | null;
  author: string | null;
  read_time: number | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [readProgress, setReadProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);

  // Reading progress bar + floating bar visibility
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadProgress(Math.min(progress, 100));
      setShowFloatingBar(scrollTop > 600);
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  // Auto-slideshow effect
  const allImages = post ? [post.thumbnail_url, ...(post.gallery_images || [])].filter(Boolean) as string[] : [];
  
  useEffect(() => {
    if (allImages.length <= 1 || isPaused) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [allImages.length, isPaused]);

  const nextImage = useCallback(() => {
    setDirection(1);
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevImage = useCallback(() => {
    setDirection(-1);
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // SEO
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | AfroStrategia Foundation`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && post.body) {
        meta.setAttribute("content", post.body.substring(0, 160));
      }
    }
  }, [post]);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("content")
        .select(`
          id,
          title,
          body,
          author,
          created_at,
          updated_at,
          thumbnail_url,
          gallery_images,
          read_time,
          slug,
          department:departments(name, slug)
        `)
        .eq("slug", slug)
        .eq("published", true)
        .eq("type", "blog")
        .single();

      if (error) throw error;
      setPost(data);

      // Fetch related posts
      if (data) {
        const { data: related } = await supabase
          .from("content")
          .select("id, title, thumbnail_url, created_at, slug, author, read_time")
          .eq("type", "blog")
          .eq("published", true)
          .neq("id", data.id)
          .order("created_at", { ascending: false })
          .limit(4);

        setRelatedPosts(related || []);
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "";
    
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        break;
    }
  };

  // Calculate reading time remaining
  const getTimeRemaining = () => {
    if (!post?.read_time) return null;
    const remaining = Math.ceil(post.read_time * (1 - readProgress / 100));
    return remaining > 0 ? remaining : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-12 bg-muted rounded w-3/4" />
            <div className="flex gap-4">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
            <div className="h-[400px] bg-muted rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/5" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/publications")} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Publications
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Reading progress bar */}
      <motion.div 
        className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-primary via-brand to-primary z-50"
        style={{ width: `${readProgress}%` }}
      />

      {/* Floating Action Bar */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="flex items-center gap-1 px-2 py-2 bg-foreground/95 backdrop-blur-xl rounded-full shadow-2xl border border-white/10">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full transition-all ${
                  isLiked ? 'bg-red-500 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-3 rounded-full transition-all ${
                  isBookmarked ? 'bg-primary text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <div className="h-6 w-px bg-white/20 mx-1" />
              <button
                onClick={() => handleShare("twitter")}
                className="p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare("linkedin")}
                className="p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <Linkedin className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare("copy")}
                className="p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <Link2 className="h-5 w-5" />
              </button>
              {post.read_time && getTimeRemaining() !== null && getTimeRemaining()! > 0 && (
                <>
                  <div className="h-6 w-px bg-white/20 mx-1" />
                  <span className="px-3 text-sm font-medium text-white/70">
                    {getTimeRemaining()} min left
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Parallax */}
      {allImages.length > 0 ? (
        <section className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            style={{ opacity: heroOpacity, scale: heroScale }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={activeImageIndex}
                src={allImages[activeImageIndex]}
                alt={`${post.title} - Image ${activeImageIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              />
            </AnimatePresence>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
          </motion.div>

          {/* Navigation Controls */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity border border-white/20 hover:bg-white/20 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity border border-white/20 hover:bg-white/20 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > activeImageIndex ? 1 : -1);
                      setActiveImageIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeImageIndex 
                        ? "w-8 bg-white" 
                        : "w-1.5 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Hero Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
                  <Link to="/publications" className="hover:text-white transition-colors">
                    Publications
                  </Link>
                  <span className="text-white/40">/</span>
                  {post.department && (
                    <>
                      <span className="hover:text-white transition-colors cursor-pointer">
                        {post.department.name.replace("Department of ", "")}
                      </span>
                      <span className="text-white/40">/</span>
                    </>
                  )}
                  <span className="text-white truncate max-w-[200px]">{post.title}</span>
                </nav>

                {/* Category Badge */}
                {post.department && (
                  <Badge className="bg-primary/90 text-primary-foreground border-0 text-xs uppercase tracking-wider font-semibold mb-4 px-3 py-1">
                    {post.department.name.replace("Department of ", "")}
                  </Badge>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] mb-6 drop-shadow-lg">
                  {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-white/80">
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{post.author}</span>
                    </div>
                  )}
                  <span className="text-white/40">·</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <time>{format(new Date(post.created_at), "MMMM d, yyyy")}</time>
                  </div>
                  {post.read_time && (
                    <>
                      <span className="text-white/40">·</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{post.read_time} min read</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ) : (
        /* Fallback Header without Image */
        <section className="bg-foreground pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-white/60 mb-8">
                <Link to="/publications" className="hover:text-white transition-colors">
                  Publications
                </Link>
                <span>/</span>
                {post.department && (
                  <>
                    <span>{post.department.name.replace("Department of ", "")}</span>
                    <span>/</span>
                  </>
                )}
                <span className="text-white truncate max-w-[200px]">{post.title}</span>
              </nav>

              {post.department && (
                <Badge className="bg-primary text-primary-foreground border-0 text-xs uppercase tracking-wider font-semibold mb-4">
                  {post.department.name.replace("Department of ", "")}
                </Badge>
              )}

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-[1.1] mb-8">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-white/70">
                {post.author && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-white">{post.author}</span>
                  </div>
                )}
                <span className="text-white/30">·</span>
                <time>{format(new Date(post.created_at), "MMMM d, yyyy")}</time>
                {post.read_time && (
                  <>
                    <span className="text-white/30">·</span>
                    <span>{post.read_time} min read</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Article Content + Sidebar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-[1fr_300px] gap-16">
          {/* Main Content */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Pull Quote / Lead */}
            {post.body && (
              <div className="mb-12 pl-6 border-l-4 border-primary">
                <p className="text-xl md:text-2xl font-serif text-foreground/80 leading-relaxed italic">
                  {post.body.replace(/<[^>]*>/g, "").slice(0, 180)}...
                </p>
              </div>
            )}

            <div 
              className="prose prose-lg prose-gray dark:prose-invert max-w-none
                prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:leading-[1.8] prose-p:text-muted-foreground prose-p:text-[17px] prose-p:mb-6
                prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:decoration-primary/50
                prose-img:rounded-2xl prose-img:shadow-lg
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/40 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:font-serif prose-blockquote:text-xl prose-blockquote:text-foreground/80 prose-blockquote:my-10
                prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-normal
                prose-strong:text-foreground prose-strong:font-semibold
                prose-li:text-muted-foreground prose-li:text-[17px] prose-li:leading-[1.8]
                first-letter:text-7xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:leading-[0.8] first-letter:text-primary
              "
              dangerouslySetInnerHTML={{ 
                __html: post.body?.replace(/\n/g, "<br />") || "" 
              }}
            />

            {/* Tags / End of Article */}
            <Separator className="my-12" />
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs font-medium">Digital Africa</Badge>
                <Badge variant="secondary" className="text-xs font-medium">Technology</Badge>
                <Badge variant="secondary" className="text-xs font-medium">Policy</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Share:</span>
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="p-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="p-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <Link2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Author Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border"
            >
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1 font-medium uppercase tracking-wider">Written by</p>
                  <p className="text-2xl font-serif font-bold text-foreground mb-2">{post.author || "AfroStrategia Team"}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Contributing to Africa's digital transformation through research, policy analysis, and strategic insights.
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <button className="text-sm font-medium text-primary hover:underline">View Profile</button>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Follow</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-8">
            {/* Article Stats */}
            <div className="p-6 rounded-2xl bg-muted/30 border border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">{post.read_time || 5}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Min Read</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">2.4k</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">18</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Shares</div>
                </div>
              </div>
            </div>

            {/* Share & Actions */}
            <div className="p-6 rounded-2xl bg-muted/30 border border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Share This Article</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-3 rounded-xl bg-background hover:bg-[#1DA1F2] hover:text-white transition-all flex items-center justify-center group border border-border hover:border-[#1DA1F2]"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="p-3 rounded-xl bg-background hover:bg-[#0A66C2] hover:text-white transition-all flex items-center justify-center group border border-border hover:border-[#0A66C2]"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="p-3 rounded-xl bg-background hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center border border-border hover:border-primary"
                  aria-label="Copy link"
                >
                  <Link2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 border ${
                    isLiked 
                      ? 'bg-red-500/10 text-red-500 border-red-500/30' 
                      : 'bg-background hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-3 rounded-xl transition-all flex items-center justify-center gap-2 border ${
                    isBookmarked 
                      ? 'bg-primary/10 text-primary border-primary/30' 
                      : 'bg-background hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">Save</span>
                </button>
              </div>
            </div>

            {/* More From Journal */}
            {relatedPosts.length > 0 && (
              <div className="p-6 rounded-2xl bg-muted/30 border border-border">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">More to Read</h3>
                <div className="space-y-5">
                  {relatedPosts.slice(0, 3).map((related, idx) => (
                    <motion.div
                      key={related.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      onClick={() => related.slug && navigate(`/blog/${related.slug}`)}
                      className="group cursor-pointer"
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                          {related.thumbnail_url ? (
                            <img 
                              src={related.thumbnail_url} 
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-muted">
                              <span className="text-xl font-serif font-bold text-muted-foreground/40">
                                {related.title.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm leading-snug mb-1">
                            {related.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(related.created_at), "MMM d")}
                            {related.read_time && ` · ${related.read_time} min`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Publications */}
            <Button
              variant="outline"
              className="w-full gap-2 h-12 rounded-xl"
              onClick={() => navigate("/publications")}
            >
              <ArrowLeft className="h-4 w-4" />
              All Publications
            </Button>
          </aside>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-center justify-between mb-12">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 mb-3"
                >
                  <div className="h-1 w-10 bg-primary rounded-full" />
                  <span className="text-sm font-medium uppercase tracking-widest text-primary">Continue Reading</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl font-serif font-bold text-foreground"
                >
                  More From The Journal
                </motion.h2>
              </div>
              <Link 
                to="/publications" 
                className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
              >
                View All Articles
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedPosts.map((related, index) => (
                <motion.article
                  key={related.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => related.slug && navigate(`/blog/${related.slug}`)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted mb-5 shadow-sm group-hover:shadow-lg transition-shadow">
                    {related.thumbnail_url ? (
                      <img
                        src={related.thumbnail_url}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                        <span className="text-5xl font-serif font-bold text-muted-foreground/20">
                          {related.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <time>{format(new Date(related.created_at), "MMM d, yyyy")}</time>
                    {related.read_time && (
                      <>
                        <span>·</span>
                        <span>{related.read_time} min read</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors text-lg leading-snug">
                    {related.title}
                  </h3>
                  {related.author && (
                    <p className="text-sm text-muted-foreground mt-2">
                      By {related.author}
                    </p>
                  )}
                </motion.article>
              ))}
            </div>

            <div className="mt-10 text-center md:hidden">
              <Link 
                to="/publications" 
                className="inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                View All Articles
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
