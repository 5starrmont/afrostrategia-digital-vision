import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, User, ArrowLeft, ChevronLeft, ChevronRight, Share2, Bookmark, Heart } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

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

  // Reading progress bar with smooth animation
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
      if (data?.department?.slug) {
        const { data: related } = await supabase
          .from("content")
          .select("id, title, thumbnail_url, created_at, slug")
          .eq("type", "blog")
          .eq("published", true)
          .neq("id", data.id)
          .limit(3);

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
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-foreground mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/publications")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Publications
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress bar */}
      <motion.div 
        className="fixed top-0 left-0 h-1.5 bg-gradient-to-r from-primary via-primary to-brand z-50"
        style={{ width: `${readProgress}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.1 }}
      />

      {/* Hero Section with Parallax Effect */}
      <motion.header 
        className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-brand/5 blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <BackButton className="mb-8" />

          <motion.div 
            className="flex flex-wrap items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {post.department && (
              <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium">
                {post.department.name.replace("Department of ", "")}
              </Badge>
            )}
            <Badge variant="outline" className="px-4 py-1.5">Blog</Badge>
          </motion.div>

          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {post.title}
          </motion.h1>

          <motion.div 
            className="flex flex-wrap items-center gap-6 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {post.author && (
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">{post.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time>{format(new Date(post.created_at), "MMMM d, yyyy")}</time>
            </div>
            {post.read_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.read_time} min read</span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.header>

      {/* Interactive Image Gallery with Auto-Slideshow */}
      {allImages.length > 0 && (
        <motion.section 
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl bg-muted group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="aspect-[16/9] relative overflow-hidden">
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
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.4 },
                  }}
                />
              </AnimatePresence>
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {allImages.length > 1 && (
                <>
                  <motion.button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>
                  <motion.button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>

                  {/* Auto-play indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.div 
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${isPaused ? 'bg-background/90' : 'bg-primary/90 text-primary-foreground'}`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-muted-foreground' : 'bg-primary-foreground animate-pulse'}`} />
                      {isPaused ? 'Paused' : 'Auto-playing'}
                    </motion.div>
                  </div>
                </>
              )}

              {/* Image counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium">
                  {activeImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Animated progress dots */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-background/80 backdrop-blur">
                {allImages.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > activeImageIndex ? 1 : -1);
                      setActiveImageIndex(idx);
                    }}
                    className="relative w-3 h-3 rounded-full overflow-hidden"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <span className={`absolute inset-0 rounded-full transition-colors ${
                      idx === activeImageIndex ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`} />
                    {idx === activeImageIndex && !isPaused && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-primary-foreground/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 5, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail strip with hover effects */}
          {allImages.length > 1 && (
            <motion.div 
              className="flex gap-3 mt-4 overflow-x-auto pb-2 px-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {allImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > activeImageIndex ? 1 : -1);
                    setActiveImageIndex(idx);
                  }}
                  className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === activeImageIndex 
                      ? "border-primary ring-4 ring-primary/20 scale-105" 
                      : "border-transparent opacity-60 hover:opacity-100 hover:border-muted-foreground/30"
                  }`}
                  whileHover={{ scale: idx === activeImageIndex ? 1.05 : 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </motion.div>
          )}
        </motion.section>
      )}

      {/* Floating Action Bar */}
      <motion.div 
        className="sticky top-4 z-40 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-end gap-2">
          <motion.button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-3 rounded-full transition-all ${
              isLiked 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-3 rounded-full transition-all ${
              isBookmarked 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
            className="p-3 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Article Content with animations */}
      <motion.article 
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div 
          className="prose prose-lg prose-gray dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-p:leading-relaxed prose-p:text-muted-foreground
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-lg
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          "
          dangerouslySetInnerHTML={{ 
            __html: post.body?.replace(/\n/g, "<br />") || "" 
          }}
        />

        <Separator className="my-12" />

        {/* Enhanced Author section */}
        <motion.div 
          className="flex items-center gap-6 p-8 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg"
            whileHover={{ rotate: 10 }}
          >
            <User className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Written by</p>
            <p className="text-xl font-bold text-foreground">{post.author || "AfroStrategia"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Published on {format(new Date(post.created_at), "MMMM d, yyyy")}
            </p>
          </div>
        </motion.div>
      </motion.article>

      {/* Related Posts with staggered animations */}
      {relatedPosts.length > 0 && (
        <section className="bg-gradient-to-b from-muted/30 to-background py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              className="text-3xl font-bold text-foreground mb-10"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              Related Articles
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related, index) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 bg-background"
                    onClick={() => related.slug && navigate(`/blog/${related.slug}`)}
                  >
                    <div className="aspect-[16/10] bg-muted overflow-hidden">
                      {related.thumbnail_url ? (
                        <motion.img
                          src={related.thumbnail_url}
                          alt={related.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-brand/10">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                      <time className="text-sm text-muted-foreground">
                        {format(new Date(related.created_at), "MMM d, yyyy")}
                      </time>
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
