import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, User, ArrowLeft, Share2, Bookmark, Heart, Twitter, Linkedin, Link2, ArrowUpRight, Quote, Eye, MessageCircle, ZoomIn } from "lucide-react";
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

// Dynamic image layout component for embedding images within content
const InlineGalleryImage = ({ 
  src, 
  alt, 
  layout, 
  index,
  onZoom 
}: { 
  src: string; 
  alt: string; 
  layout: 'full' | 'left' | 'right' | 'center';
  index: number;
  onZoom: (src: string) => void;
}) => {
  const layoutClasses = {
    full: 'w-full my-10',
    left: 'float-left mr-8 mb-6 w-full sm:w-1/2 lg:w-2/5',
    right: 'float-right ml-8 mb-6 w-full sm:w-1/2 lg:w-2/5',
    center: 'mx-auto my-10 w-full max-w-2xl'
  };

  return (
    <motion.figure
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`${layoutClasses[layout]} group relative`}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          onClick={() => onZoom(src)}
          className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110"
          aria-label="Zoom image"
        >
          <ZoomIn className="h-5 w-5 text-white" />
        </button>
      </div>
      <figcaption className="text-sm text-muted-foreground mt-3 italic text-center">
        Image {index + 1}
      </figcaption>
    </motion.figure>
  );
};

// Image lightbox component
const ImageLightbox = ({ src, onClose }: { src: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.img
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      src={src}
      alt="Zoomed image"
      className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
    <button
      onClick={onClose}
      className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      aria-label="Close lightbox"
    >
      <span className="text-white text-2xl leading-none">&times;</span>
    </button>
  </motion.div>
);

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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

  // Get layout pattern for gallery images
  const getImageLayout = (index: number): 'full' | 'left' | 'right' | 'center' => {
    const patterns: ('full' | 'left' | 'right' | 'center')[] = ['full', 'left', 'right', 'center', 'right', 'left'];
    return patterns[index % patterns.length];
  };

  // Split content into paragraphs and intersperse with images
  const renderContentWithImages = () => {
    if (!post?.body) return null;
    
    const galleryImages = post.gallery_images || [];
    const paragraphs = post.body.split(/\n\n+/).filter(p => p.trim());
    
    if (galleryImages.length === 0) {
      return (
        <div 
          className="prose prose-lg prose-gray dark:prose-invert max-w-none
            prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-[1.8] prose-p:text-muted-foreground prose-p:text-[17px] prose-p:mb-6
            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:decoration-primary/50
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/40 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:font-serif prose-blockquote:text-xl prose-blockquote:text-foreground/80 prose-blockquote:my-10
            prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded-md prose-code:text-sm prose-code:font-normal
            prose-strong:text-foreground prose-strong:font-semibold
            prose-li:text-muted-foreground prose-li:text-[17px] prose-li:leading-[1.8]
            first-letter:text-7xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:leading-[0.8] first-letter:text-primary
          "
          dangerouslySetInnerHTML={{ 
            __html: post.body.replace(/\n/g, "<br />") 
          }}
        />
      );
    }

    // Calculate where to insert images within the content
    const imageInsertPoints = galleryImages.map((_, i) => {
      const spacing = Math.floor(paragraphs.length / (galleryImages.length + 1));
      return Math.min((i + 1) * spacing, paragraphs.length - 1);
    });

    let imageIndex = 0;
    const elements: React.ReactNode[] = [];

    paragraphs.forEach((paragraph, pIndex) => {
      // Check if we should insert an image before this paragraph
      if (imageInsertPoints.includes(pIndex) && imageIndex < galleryImages.length) {
        const layout = getImageLayout(imageIndex);
        const isFloating = layout === 'left' || layout === 'right';
        
        if (!isFloating) {
          // Clear floats before non-floating images
          elements.push(<div key={`clear-${pIndex}`} className="clear-both" />);
        }
        
        elements.push(
          <InlineGalleryImage
            key={`img-${imageIndex}`}
            src={galleryImages[imageIndex]}
            alt={`${post.title} - Image ${imageIndex + 1}`}
            layout={layout}
            index={imageIndex}
            onZoom={setZoomedImage}
          />
        );
        imageIndex++;
      }

      // Add the paragraph
      const isFirstParagraph = pIndex === 0;
      elements.push(
        <motion.div
          key={`p-${pIndex}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className={`
            prose prose-lg prose-gray dark:prose-invert max-w-none
            prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-p:leading-[1.8] prose-p:text-muted-foreground prose-p:text-[17px] prose-p:mb-6
            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-semibold
            ${isFirstParagraph ? 'first-letter:text-7xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-4 first-letter:mt-1 first-letter:leading-[0.8] first-letter:text-primary' : ''}
          `}
          dangerouslySetInnerHTML={{ 
            __html: paragraph.replace(/\n/g, "<br />") 
          }}
        />
      );
    });

    // Add remaining images at the end if any
    while (imageIndex < galleryImages.length) {
      elements.push(<div key={`clear-end-${imageIndex}`} className="clear-both" />);
      elements.push(
        <InlineGalleryImage
          key={`img-end-${imageIndex}`}
          src={galleryImages[imageIndex]}
          alt={`${post.title} - Image ${imageIndex + 1}`}
          layout={getImageLayout(imageIndex)}
          index={imageIndex}
          onZoom={setZoomedImage}
        />
      );
      imageIndex++;
    }

    // Clear floats at the end
    elements.push(<div key="clear-final" className="clear-both" />);

    return <>{elements}</>;
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
      
      {/* Image Lightbox */}
      <AnimatePresence>
        {zoomedImage && (
          <ImageLightbox src={zoomedImage} onClose={() => setZoomedImage(null)} />
        )}
      </AnimatePresence>
      
      {/* Reading progress bar */}
      <motion.div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-brand to-primary z-50"
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

      {/* Editorial Hero Section - Typography Focused */}
      <section className="relative bg-background pt-8 pb-16 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-brand/5 via-transparent to-transparent rounded-full blur-3xl" />
          {/* Decorative lines */}
          <div className="absolute top-32 left-8 w-px h-40 bg-gradient-to-b from-primary/20 to-transparent hidden lg:block" />
          <div className="absolute top-32 right-8 w-px h-40 bg-gradient-to-b from-brand/20 to-transparent hidden lg:block" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb - Subtle */}
            <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 mb-6 uppercase tracking-wide">
              <Link to="/publications" className="hover:text-muted-foreground transition-colors">
                Publications
              </Link>
              {post.department && (
                <>
                  <span>/</span>
                  <span className="hover:text-muted-foreground transition-colors cursor-pointer">
                    {post.department.name.replace("Department of ", "")}
                  </span>
                </>
              )}
            </nav>

            {/* Category Badge with decorative line */}
            <div className="flex items-center gap-4 mb-6">
              {post.department && (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs uppercase tracking-[0.2em] font-semibold px-4 py-1.5 rounded-full">
                  {post.department.name.replace("Department of ", "")}
                </Badge>
              )}
              <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>

            {/* Title - Large Editorial Typography */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-[1.1] tracking-tight mb-10">
              {post.title}
            </h1>

            {/* Meta Row with enhanced styling */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-0 sm:justify-between pt-8 border-t border-border">
              {/* Author & Date */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                {post.author && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-brand/20 flex items-center justify-center ring-2 ring-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground block">{post.author}</span>
                      <span className="text-sm text-muted-foreground">Author</span>
                    </div>
                  </div>
                )}
                <div className="hidden sm:block w-px h-10 bg-border mx-2" />
                <div className="flex flex-col">
                  <time className="font-medium text-foreground">{format(new Date(post.created_at), "MMMM d, yyyy")}</time>
                  <span className="text-sm text-muted-foreground">Published</span>
                </div>
                {post.read_time && (
                  <>
                    <div className="hidden sm:block w-px h-10 bg-border mx-2" />
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{post.read_time} min</span>
                      <span className="text-sm text-muted-foreground">Read time</span>
                    </div>
                  </>
                )}
              </div>

              {/* Share Actions */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">Share</span>
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-2.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="p-2.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="p-2.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
                  aria-label="Copy link"
                >
                  <Link2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Featured Thumbnail - Positioned below header, with elegant framing */}
          {post.thumbnail_url && (
            <motion.figure
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-12 relative group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {/* Decorative frame effect */}
                <div className="absolute inset-0 border-2 border-primary/10 rounded-2xl pointer-events-none z-10" />
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-brand/5 rounded-3xl blur-xl opacity-60" />
                
                <img
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="relative w-full h-auto max-h-[500px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Zoom button */}
                <button
                  onClick={() => setZoomedImage(post.thumbnail_url)}
                  className="absolute bottom-4 right-4 p-3 rounded-full bg-background/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110 shadow-lg"
                  aria-label="Zoom image"
                >
                  <ZoomIn className="h-5 w-5 text-foreground" />
                </button>
              </div>
              
              {/* Caption line */}
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-0.5 bg-primary/40" />
                <span className="text-sm text-muted-foreground italic">Featured image</span>
              </div>
            </motion.figure>
          )}
        </div>
      </section>

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

            {/* Content with embedded gallery images */}
            {renderContentWithImages()}

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
              className="mt-10 pt-6 border-t border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>By</span>
                  <span className="font-medium text-foreground">{post.author || "AfroStrategia Team"}</span>
                </div>
              </div>
            </motion.div>
          </motion.article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-8">

            {/* Gallery Preview - if many images */}
            {post.gallery_images && post.gallery_images.length > 2 && (
              <div className="p-6 rounded-2xl bg-muted/30 border border-border">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Gallery ({post.gallery_images.length} images)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {post.gallery_images.slice(0, 6).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setZoomedImage(img)}
                      className="aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 ring-primary transition-all"
                    >
                      <img 
                        src={img} 
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
