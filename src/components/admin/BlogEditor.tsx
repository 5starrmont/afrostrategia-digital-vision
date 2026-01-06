import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

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
        .select('id, title, body, author, published, created_at, thumbnail_url, department_id, departments(name)')
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

  const handleFileUpload = async (file: File, contentId: string, folder: string = 'thumbnails') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${contentId}-${Date.now()}.${fileExt}`;
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

        const { error } = await supabase
          .from('content')
          .update({
            title,
            body: sanitizedBody,
            author: author || 'AfroStrategia',
            department_id: selectedDepartment,
            published,
            thumbnail_url: thumbnailUrl,
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
        const { data: content, error: insertError } = await supabase
          .from('content')
          .insert({
            title,
            body: sanitizedBody,
            type: 'blog',
            department_id: selectedDepartment,
            published,
            created_by: user?.id,
            author: author || 'AfroStrategia',
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
                <Label htmlFor="body">Content *</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your blog content here..."
                  rows={12}
                  className="border-emerald-200 focus:border-emerald-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Tip: Use line breaks for paragraphs. HTML is supported for formatting.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleThumbnailChange}
                  className="border-emerald-200"
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-40 h-24 object-cover rounded-lg border"
                    />
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
