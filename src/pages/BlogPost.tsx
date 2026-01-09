import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, User, ArrowLeft, ChevronLeft, ChevronRight, Share2, Bookmark, Heart, Sparkles, Eye, MessageCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 150) + 50);
  const [viewCount] = useState(Math.floor(Math.random() * 2000) + 500);

  // Reading progress bar
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadProgress(Math.min(progress, 100));
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
    }, 4000);

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

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | AfroStrategia Foundation`;
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

      const { data: related } = await supabase
        .from("content")
        .select("id, title, thumbnail_url, created_at, slug")
        .eq("type", "blog")
        .eq("published", true)
        .neq("id", data.id)
        .limit(3);

      setRelatedPosts(related || []);
    } catch (error) {
      console.error("Error fetching blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    if (!isLiked) {
      toast.success("Added to favorites! ❤️");
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from reading list" : "Saved to reading list! 📚");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post?.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied! 🔗");
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-brand/5">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-primary/10 rounded-2xl w-3/4" />
            <div className="h-[50vh] bg-gradient-to-br from-primary/10 to-brand/10 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-6 bg-primary/10 rounded-xl w-full" />
              <div className="h-6 bg-primary/10 rounded-xl w-5/6" />
              <div className="h-6 bg-primary/10 rounded-xl w-4/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-brand/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            📰
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8 text-lg">This story may have been moved or archived.</p>
          <Button 
            onClick={() => navigate("/publications")}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-6 rounded-full text-lg font-semibold shadow-xl shadow-primary/25"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Browse All Articles
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Vibrant Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 h-1.5 z-50 bg-gradient-to-r from-primary via-brand to-primary"
        style={{ width: `${readProgress}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
      />

      {/* Hero Section with Immersive Design */}
      <motion.header 
        className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Dynamic gradient mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-brand/20" />
          
          {/* Floating orbs */}
          <motion.div 
            className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gradient-to-br from-primary/30 to-brand/20 blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-40 left-10 w-80 h-80 rounded-full bg-gradient-to-tr from-brand/30 to-primary/20 blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-primary/20 to-brand/30 blur-3xl"
            animate={{ 
              scale: [1, 1.4, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

          {/* Sparkle particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-brand rounded-full"
              style={{
                left: `${10 + (i * 8)}%`,
                top: `${20 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Back Button */}
        <motion.div
          className="absolute top-8 left-8 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            onClick={() => navigate("/publications")}
            variant="outline"
            className="bg-background/80 backdrop-blur-md border-primary/30 hover:bg-primary/10 hover:border-primary rounded-full px-6 shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32">
          {/* Category Badges */}
          <motion.div 
            className="flex flex-wrap items-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-5 py-2 text-sm font-semibold shadow-lg shadow-primary/25 border-0">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Featured
            </Badge>
            {post.department && (
              <Badge className="bg-gradient-to-r from-brand to-brand/80 text-brand-foreground px-5 py-2 text-sm font-semibold shadow-lg shadow-brand/25 border-0">
                {post.department.name.replace("Department of ", "")}
              </Badge>
            )}
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 px-4 py-2">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
              Trending
            </Badge>
          </motion.div>

          {/* Title with Gradient */}
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              {post.title}
            </span>
          </motion.h1>

          {/* Meta Info with Visual Polish */}
          <motion.div 
            className="flex flex-wrap items-center gap-4 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {post.author && (
              <motion.div 
                className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-brand/10 border border-primary/20"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-brand flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">Author</p>
                </div>
              </motion.div>
            )}
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{format(new Date(post.created_at), "MMM d, yyyy")}</span>
            </div>
            
            {post.read_time && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm">
                <Clock className="h-4 w-4 text-brand" />
                <span className="text-sm font-medium">{post.read_time} min read</span>
              </div>
            )}

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{viewCount.toLocaleString()} views</span>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Immersive Image Gallery */}
      {allImages.length > 0 && (
        <motion.section 
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div 
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-primary/10 group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Main Image with Ken Burns Effect */}
            <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-primary/5 to-brand/5">
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
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.5 },
                  }}
                />
              </AnimatePresence>
              
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-brand/10 mix-blend-overlay" />
              
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <motion.button
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-primary/20 hover:border-primary/50 hover:bg-primary/10"
                    whileHover={{ scale: 1.1, x: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="h-7 w-7 text-foreground" />
                  </motion.button>
                  <motion.button
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-primary/20 hover:border-primary/50 hover:bg-primary/10"
                    whileHover={{ scale: 1.1, x: 3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="h-7 w-7 text-foreground" />
                  </motion.button>

                  {/* Auto-play Status */}
                  <motion.div 
                    className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg ${
                      isPaused 
                        ? 'bg-muted/90 text-muted-foreground' 
                        : 'bg-gradient-to-r from-primary to-brand text-primary-foreground'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-muted-foreground' : 'bg-primary-foreground animate-pulse'}`} />
                      {isPaused ? 'Paused' : 'Playing'}
                    </div>
                  </motion.div>

                  {/* Image Counter */}
                  <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-background/90 backdrop-blur-md text-sm font-semibold shadow-lg border border-primary/20">
                    <span className="text-primary">{activeImageIndex + 1}</span>
                    <span className="text-muted-foreground"> / {allImages.length}</span>
                  </div>
                </>
              )}
            </div>

            {/* Progress Indicators */}
            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-background/80 backdrop-blur-md border border-primary/10">
                {allImages.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > activeImageIndex ? 1 : -1);
                      setActiveImageIndex(idx);
                    }}
                    className="relative w-12 h-2 rounded-full overflow-hidden bg-muted"
                    whileHover={{ scale: 1.1 }}
                  >
                    {idx === activeImageIndex ? (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary to-brand"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isPaused ? 1 : 1 }}
                        transition={{ duration: isPaused ? 0 : 4, ease: "linear" }}
                        style={{ transformOrigin: "left" }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted-foreground/30" />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <motion.div 
              className="flex gap-4 mt-6 overflow-x-auto pb-2 px-1 scrollbar-hide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {allImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > activeImageIndex ? 1 : -1);
                    setActiveImageIndex(idx);
                  }}
                  className={`flex-shrink-0 w-28 h-20 rounded-2xl overflow-hidden transition-all duration-300 ${
                    idx === activeImageIndex 
                      ? "ring-4 ring-primary shadow-xl shadow-primary/20 scale-105" 
                      : "opacity-50 hover:opacity-80 ring-2 ring-transparent hover:ring-primary/30"
                  }`}
                  whileHover={{ scale: idx === activeImageIndex ? 1.05 : 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.section>
      )}

      {/* Main Content Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Floating Action Sidebar (Left) */}
          <motion.aside 
            className="hidden lg:flex lg:col-span-1 flex-col items-center gap-4 sticky top-24 h-fit"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              onClick={handleLike}
              className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
                isLiked 
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-red-500/30' 
                  : 'bg-muted hover:bg-primary/10 border border-primary/10 hover:border-primary/30'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'text-white fill-white' : 'text-foreground'}`} />
            </motion.button>
            <span className="text-sm font-bold text-foreground">{likeCount}</span>
            
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-2" />
            
            <motion.button
              onClick={handleBookmark}
              className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
                isBookmarked 
                  ? 'bg-gradient-to-br from-brand to-yellow-500 shadow-brand/30' 
                  : 'bg-muted hover:bg-brand/10 border border-brand/10 hover:border-brand/30'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark className={`h-6 w-6 ${isBookmarked ? 'text-brand-foreground fill-brand-foreground' : 'text-foreground'}`} />
            </motion.button>
            
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-2" />
            
            <motion.button
              onClick={handleShare}
              className="p-4 rounded-2xl bg-muted hover:bg-primary/10 border border-primary/10 hover:border-primary/30 transition-all shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 className="h-6 w-6 text-foreground" />
            </motion.button>

            <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-2" />

            <motion.button
              className="p-4 rounded-2xl bg-muted hover:bg-primary/10 border border-primary/10 hover:border-primary/30 transition-all shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle className="h-6 w-6 text-foreground" />
            </motion.button>
          </motion.aside>

          {/* Article Content (Center) */}
          <motion.article 
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {/* Decorative accent line */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-16 bg-gradient-to-r from-primary to-brand rounded-full" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Article</span>
            </div>

            {/* Article Body with Rich Styling */}
            <div 
              className="prose prose-lg prose-gray dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:bg-gradient-to-r prose-h2:from-primary prose-h2:to-foreground prose-h2:bg-clip-text prose-h2:text-transparent
                prose-h3:text-2xl prose-h3:text-primary
                prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:text-lg
                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-a:decoration-primary/50
                prose-strong:text-foreground prose-strong:font-bold
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gradient-to-r prose-blockquote:from-primary/10 prose-blockquote:to-transparent prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-foreground prose-blockquote:shadow-lg
                prose-ul:list-none prose-ul:pl-0
                prose-li:relative prose-li:pl-8 prose-li:before:content-['→'] prose-li:before:absolute prose-li:before:left-0 prose-li:before:text-primary prose-li:before:font-bold
                prose-code:bg-primary/10 prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded-lg prose-code:font-semibold
                prose-img:rounded-2xl prose-img:shadow-2xl
                first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:leading-none first-letter:bg-gradient-to-br first-letter:from-primary first-letter:to-brand first-letter:bg-clip-text first-letter:text-transparent
              "
              dangerouslySetInnerHTML={{ 
                __html: post.body?.replace(/\n/g, "<br />") || "" 
              }}
            />

            {/* Mobile Action Buttons */}
            <div className="lg:hidden flex justify-center gap-4 mt-12 py-6 border-t border-primary/10">
              <motion.button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-lg ${
                  isLiked 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                    : 'bg-muted text-foreground'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </motion.button>
              
              <motion.button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-lg ${
                  isBookmarked 
                    ? 'bg-gradient-to-r from-brand to-yellow-500 text-brand-foreground' 
                    : 'bg-muted text-foreground'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </motion.button>
              
              <motion.button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-foreground font-semibold hover:bg-primary/10 transition-all shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Author Card */}
            <motion.div 
              className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-brand/10 border border-primary/20 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <motion.div 
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-brand flex items-center justify-center shadow-xl shadow-primary/25"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <User className="h-10 w-10 text-primary-foreground" />
                </motion.div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold text-primary mb-1">Written by</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{post.author || "AfroStrategia"}</p>
                  <p className="text-muted-foreground">
                    Published on {format(new Date(post.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.article>

          {/* Sidebar (Right) */}
          <motion.aside 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="sticky top-24 space-y-8">
              {/* Newsletter CTA */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/20 via-muted to-brand/20 border border-primary/20 shadow-xl">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-4"
                >
                  ✨
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-2">Stay in the loop</h3>
                <p className="text-muted-foreground text-sm mb-6">Get the latest insights delivered to your inbox weekly.</p>
                <Button className="w-full bg-gradient-to-r from-primary to-brand hover:from-primary/90 hover:to-brand/90 text-primary-foreground font-semibold rounded-full shadow-lg shadow-primary/25">
                  Subscribe Now
                </Button>
              </div>

              {/* Share Card */}
              <div className="p-6 rounded-3xl bg-muted/50 border border-primary/10">
                <h3 className="text-lg font-bold text-foreground mb-4">Share this article</h3>
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleShare}
                    className="flex-1 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Copy Link
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="bg-gradient-to-b from-background via-primary/5 to-background py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-12"
            >
              <div className="h-1 w-16 bg-gradient-to-r from-primary to-brand rounded-full" />
              <h2 className="text-3xl font-bold text-foreground">More to Explore</h2>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((related, index) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card 
                    className="overflow-hidden cursor-pointer group border-0 bg-background shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl"
                    onClick={() => related.slug && navigate(`/blog/${related.slug}`)}
                  >
                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-brand/10 overflow-hidden">
                      {related.thumbnail_url ? (
                        <motion.img
                          src={related.thumbnail_url}
                          alt={related.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">📰</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <time>{format(new Date(related.created_at), "MMM d, yyyy")}</time>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
