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
      
      // Insert content record
      const { data: content, error: insertError } = await supabase
        .from('content')
        .insert({
          title,
          body,
          type,
          department_id: selectedDepartment,
          published,
          created_by: user?.id,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Content Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter content title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Content Type *</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            {contentTypes.map((contentType) => (
              <SelectItem key={contentType.value} value={contentType.value}>
                {contentType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department *</Label>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="Select a department" />
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
        <Label htmlFor="body">Content Body</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter the main content"
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Upload Supporting File (Images, PDFs, etc.)</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={published}
          onCheckedChange={setPublished}
        />
        <Label htmlFor="published">Publish immediately</Label>
      </div>

      <Button type="submit" disabled={uploading} className="w-full">
        {uploading ? "Uploading..." : "Upload Content"}
      </Button>
    </form>
  );
};