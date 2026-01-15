import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, User, ArrowLeft, ChevronLeft, ChevronRight, Share2, Bookmark, Heart, Twitter, Linkedin, Link2, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
        className="fixed top-0 left-0 h-1 bg-primary z-50"
        style={{ width: `${readProgress}%` }}
      />

      {/* Breadcrumb */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/publications" className="hover:text-foreground transition-colors">
              Publications
            </Link>
            <span>/</span>
            {post.department && (
              <>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  {post.department.name.replace("Department of ", "")}
                </span>
                <span>/</span>
              </>
            )}
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>
      </section>

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-8 bg-primary rounded-full" />
            {post.department && (
              <Badge variant="secondary" className="text-xs uppercase tracking-wider font-medium">
                {post.department.name.replace("Department of ", "")}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.1] mb-8">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground pb-8 border-b border-border">
            {post.author && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">Author</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time className="text-sm">{format(new Date(post.created_at), "MMMM d, yyyy")}</time>
            </div>
            
            {post.read_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{post.read_time} min read</span>
              </div>
            )}
          </div>
        </motion.div>
      </header>

      {/* Featured Image */}
      {allImages.length > 0 && (
        <motion.section 
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div 
            className="relative rounded-2xl overflow-hidden bg-muted group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="aspect-[21/9] relative overflow-hidden">
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
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Image counter */}
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-sm font-medium">
                    {activeImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > activeImageIndex ? 1 : -1);
                    setActiveImageIndex(idx);
                  }}
                  className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeImageIndex 
                      ? "border-primary opacity-100" 
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.section>
      )}

      {/* Article Content + Sidebar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12">
          {/* Main Content */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div 
              className="prose prose-lg prose-gray dark:prose-invert max-w-none
                prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight
                prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:text-lg
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:font-serif prose-blockquote:text-xl
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary
              "
              dangerouslySetInnerHTML={{ 
                __html: post.body?.replace(/\n/g, "<br />") || "" 
              }}
            />

            {/* Tags / End of Article */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Digital Africa</Badge>
                <Badge variant="outline" className="text-xs">Technology</Badge>
                <Badge variant="outline" className="text-xs">Policy</Badge>
              </div>
            </div>

            {/* Author Card */}
            <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Written by</p>
                  <p className="text-xl font-serif font-bold text-foreground">{post.author || "AfroStrategia Team"}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Contributing to Africa's digital transformation through research and policy analysis.
                  </p>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-8">
            {/* Share & Actions */}
            <div className="p-6 rounded-2xl bg-muted/30 border border-border">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">Share Article</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex-1 p-3 rounded-xl bg-background hover:bg-muted transition-colors flex items-center justify-center"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="flex-1 p-3 rounded-xl bg-background hover:bg-muted transition-colors flex items-center justify-center"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="flex-1 p-3 rounded-xl bg-background hover:bg-muted transition-colors flex items-center justify-center"
                  aria-label="Copy link"
                >
                  <Link2 className="h-5 w-5" />
                </button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex-1 p-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isLiked 
                      ? 'bg-red-500/10 text-red-500' 
                      : 'bg-background hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex-1 p-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    isBookmarked 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-background hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">Save</span>
                </button>
              </div>
            </div>

            {/* More From Journal */}
            {relatedPosts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">More Articles</h3>
                <div className="space-y-4">
                  {relatedPosts.slice(0, 3).map((related, idx) => (
                    <motion.div
                      key={related.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      onClick={() => related.slug && navigate(`/blog/${related.slug}`)}
                      className="group cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <span className="text-3xl font-serif font-bold text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm leading-snug">
                            {related.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
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
              className="w-full gap-2"
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
        <section className="border-t border-border bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-serif font-bold text-foreground">Continue Reading</h2>
              </div>
              <Link 
                to="/publications" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosts.map((related, index) => (
                <motion.article
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => related.slug && navigate(`/blog/${related.slug}`)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-4">
                    {related.thumbnail_url ? (
                      <img
                        src={related.thumbnail_url}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                        <span className="text-4xl font-serif font-bold text-muted-foreground/20">
                          {related.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <time>{format(new Date(related.created_at), "MMM d, yyyy")}</time>
                    {related.read_time && (
                      <>
                        <span>·</span>
                        <span>{related.read_time} min read</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
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
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
