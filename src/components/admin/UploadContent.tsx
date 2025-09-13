import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: string;
  name: string;
  slug: string;
}

export const UploadContent = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [published, setPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const contentTypes = [
    { value: "insight", label: "Insight" },
    { value: "news", label: "News" },
    { value: "research", label: "Research" },
    { value: "policy", label: "Policy Brief" },
    { value: "update", label: "Update" },
  ];

  useEffect(() => {
    fetchDepartments();
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

  const handleFileUpload = async (file: File, contentId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${contentId}.${fileExt}`;
    const filePath = `content/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('admin-uploads')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('admin-uploads')
      .getPublicUrl(filePath);

    return { url: publicUrl, fileName: file.name };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type || !selectedDepartment) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Validate file if provided
      if (file) {
        // File size validation (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "File size must be less than 100MB",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }

        // File type validation for content uploads
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'video/webm',
          'audio/mpeg',
          'audio/wav'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Unsupported file type. Please use PDF, Word, images, or media files",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }

      // Sanitize body content to prevent XSS
      const sanitizedBody = body?.trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
      
      // Insert content record with enhanced security fields
      const { data: content, error: insertError } = await supabase
        .from('content')
        .insert({
          title,
          body: sanitizedBody,
          type,
          department_id: selectedDepartment,
          published,
          created_by: user?.id,
          file_size: file?.size || null,
          file_type: file?.type || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Upload file if provided
      let fileUrl = null;
      let fileName = null;
      if (file && content) {
        const { url, fileName: uploadedFileName } = await handleFileUpload(file, content.id);
        fileUrl = url;
        fileName = uploadedFileName;

        // Update content with file info
        const { error: updateError } = await supabase
          .from('content')
          .update({ file_url: fileUrl, file_name: fileName })
          .eq('id', content.id);

        if (updateError) throw updateError;
      }

      // Log admin action for audit trail
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action: 'content_upload',
          table_name: 'content',
          record_id: content.id,
          new_values: { title, type, published }
        });

      toast({
        title: "Content uploaded successfully",
        description: "The content has been added to the system.",
      });

      // Reset form
      setTitle("");
      setBody("");
      setType("");
      setSelectedDepartment("");
      setPublished(false);
      setFile(null);
      
    } catch (error: any) {
      console.error('Error uploading content:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-emerald-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Content</h2>
        <p className="text-gray-600">Add new content to the platform</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-700 font-medium">Content Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter content title"
          required
          className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type" className="text-gray-700 font-medium">Content Type *</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500">
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent className="bg-white border-emerald-200">
            {contentTypes.map((contentType) => (
              <SelectItem key={contentType.value} value={contentType.value} className="hover:bg-emerald-50">
                {contentType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department" className="text-gray-700 font-medium">Department *</Label>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500">
            <SelectValue placeholder="Select a department" />
          </SelectTrigger>
          <SelectContent className="bg-white border-emerald-200">
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id} className="hover:bg-emerald-50">
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body" className="text-gray-700 font-medium">Content Body</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter the main content"
          rows={6}
          className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file" className="text-gray-700 font-medium">Upload Supporting File (Images, PDFs, etc.)</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 file:bg-emerald-50 file:text-emerald-700 file:border-emerald-200"
        />
      </div>

      <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <Switch
          id="published"
          checked={published}
          onCheckedChange={setPublished}
          className="data-[state=checked]:bg-emerald-600"
        />
        <Label htmlFor="published" className="text-gray-700 font-medium">Publish immediately</Label>
      </div>

      <Button 
        type="submit" 
        disabled={uploading} 
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5"
      >
        {uploading ? "Uploading..." : "Upload Content"}
      </Button>
      </form>
    </div>
  );
};