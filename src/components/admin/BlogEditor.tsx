import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Eye, Loader2, X, ImagePlus } from "lucide-react";
import { format } from "date-fns";
import { RichTextEditor } from "./RichTextEditor";

interface Department {
  id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  id: string;
  title: string;
  body: string | null;
  author: string | null;
  published: boolean | null;
  created_at: string;
  thumbnail_url: string | null;
  gallery_images: string[] | null;
  slug: string | null;
  department_id: string | null;
  departments?: { name: string } | null;
}

export const BlogEditor = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [published, setPublished] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
    fetchBlogs();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('id, title, body, author, published, created_at, thumbnail_url, gallery_images, slug, department_id, departments(name)')
        .eq('type', 'blog')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setAuthor("");
    setSelectedDepartment("");
    setPublished(false);
    setThumbnailImage(null);
    setThumbnailPreview(null);
    setGalleryImages([]);
    setGalleryPreviews([]);
    setExistingGalleryImages([]);
    setEditingBlog(null);
  };

  const openNewBlogDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setBody(blog.body || "");
    setAuthor(blog.author || "");
    setSelectedDepartment(blog.department_id || "");
    setPublished(blog.published || false);
    setThumbnailPreview(blog.thumbnail_url);
    setExistingGalleryImages(blog.gallery_images || []);
    setGalleryImages([]);
    setGalleryPreviews([]);
    setIsDialogOpen(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryImages((prev) => [...prev, ...files]);
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index: number) => {
    setExistingGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (file: File, contentId: string, folder: string = 'thumbnails') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${contentId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('admin-uploads')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('admin-uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !selectedDepartment) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Sanitize body content
      const sanitizedBody = body?.trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');

      if (editingBlog) {
        // Update existing blog
        let thumbnailUrl = editingBlog.thumbnail_url;
        
        if (thumbnailImage) {
          thumbnailUrl = await handleFileUpload(thumbnailImage, editingBlog.id);
        }

        // Upload new gallery images
        const newGalleryUrls: string[] = [];
        for (const file of galleryImages) {
          const url = await handleFileUpload(file, editingBlog.id, 'gallery');
          newGalleryUrls.push(url);
        }

        const allGalleryImages = [...existingGalleryImages, ...newGalleryUrls];

        const slug = editingBlog.slug || generateSlug(title);

        const { error } = await supabase
          .from('content')
          .update({
            title,
            body: sanitizedBody,
            author: author || 'AfroStrategia',
            department_id: selectedDepartment,
            published,
            thumbnail_url: thumbnailUrl,
            gallery_images: allGalleryImages,
            slug,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBlog.id);

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user?.id,
          action: 'blog_update',
          table_name: 'content',
          record_id: editingBlog.id,
          new_values: { title, published }
        });

        toast({
          title: "Blog updated",
          description: "Your blog post has been updated successfully.",
        });
      } else {
        // Create new blog
        const slug = generateSlug(title);
        
        const { data: content, error: insertError } = await supabase
          .from('content')
          .insert({
            title,
            body: sanitizedBody,
            type: 'blog',
            media_type: 'blog',
            department_id: selectedDepartment,
            published,
            created_by: user?.id,
            author: author || 'AfroStrategia',
            slug,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Upload thumbnail if provided
        if (thumbnailImage && content) {
          const thumbnailUrl = await handleFileUpload(thumbnailImage, content.id);
          await supabase
            .from('content')
            .update({ thumbnail_url: thumbnailUrl })
            .eq('id', content.id);
        }

        // Upload gallery images
        if (galleryImages.length > 0 && content) {
          const galleryUrls: string[] = [];
          for (const file of galleryImages) {
            const url = await handleFileUpload(file, content.id, 'gallery');
            galleryUrls.push(url);
          }
          await supabase
            .from('content')
            .update({ gallery_images: galleryUrls })
            .eq('id', content.id);
        }

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user?.id,
          action: 'blog_create',
          table_name: 'content',
          record_id: content.id,
          new_values: { title, published }
        });

        toast({
          title: "Blog created",
          description: "Your blog post has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error: any) {
      console.error('Error saving blog:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'blog_delete',
        table_name: 'content',
        record_id: id,
      });

      toast({
        title: "Blog deleted",
        description: "The blog post has been removed.",
      });

      fetchBlogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('content')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setBlogs(blogs.map(blog => 
        blog.id === id ? { ...blog, published: !currentStatus } : blog
      ));

      toast({
        title: !currentStatus ? "Blog published" : "Blog unpublished",
        description: `The blog post is now ${!currentStatus ? 'visible' : 'hidden'} to the public.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
          <p className="text-gray-600">Create, edit, and manage your blog content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openNewBlogDialog}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog title"
                  required
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="border-emerald-200">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name (default: AfroStrategia)"
                    className="border-emerald-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <RichTextEditor
                  content={body}
                  onChange={setBody}
                  placeholder="Write your blog content here..."
                />
                <p className="text-xs text-gray-500">
                  Use the toolbar above to format your text with headings, lists, quotes, and more.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image (Main Cover)</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleThumbnailChange}
                  className="border-emerald-200"
                />
                {thumbnailPreview && (
                  <div className="mt-2 relative inline-block">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-40 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="space-y-2">
                <Label>Gallery Images (Additional Images)</Label>
                <div className="border-2 border-dashed border-emerald-200 rounded-lg p-4">
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <ImagePlus className="h-8 w-8 text-emerald-500 mb-2" />
                    <span className="text-sm text-gray-600">Click to add more images</span>
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleGalleryChange}
                      multiple
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Existing gallery images */}
                {existingGalleryImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
                    <div className="flex flex-wrap gap-3">
                      {existingGalleryImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={url} 
                            alt={`Gallery ${index + 1}`} 
                            className="w-24 h-16 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingGalleryImage(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New gallery image previews */}
                {galleryPreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">New Images to Upload:</p>
                    <div className="flex flex-wrap gap-3">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={preview} 
                            alt={`New gallery ${index + 1}`} 
                            className="w-24 h-16 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg">
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                  className="data-[state=checked]:bg-emerald-600"
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingBlog ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Blog Posts Table */}
      <Card className="border-emerald-100">
        <CardContent className="p-0">
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No blog posts yet. Create your first one!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      {blog.thumbnail_url ? (
                        <img 
                          src={blog.thumbnail_url} 
                          alt="" 
                          className="w-16 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">No img</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {blog.title}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {blog.author || 'AfroStrategia'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {blog.departments?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={blog.published || false}
                        onCheckedChange={() => togglePublished(blog.id, blog.published || false)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {format(new Date(blog.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(blog)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
