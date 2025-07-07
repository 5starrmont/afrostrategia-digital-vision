import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: string;
  name: string;
  slug: string;
}

export const UploadReports = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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

  const handleFileUpload = async (file: File, reportId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${reportId}.${fileExt}`;
    const filePath = `reports/${fileName}`;

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
    if (!title || !selectedDepartment) {
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
      
      // Insert report record
      const { data: report, error: insertError } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          department_id: selectedDepartment,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Upload file if provided
      let fileUrl = null;
      let fileName = null;
      if (file && report) {
        const { url, fileName: uploadedFileName } = await handleFileUpload(file, report.id);
        fileUrl = url;
        fileName = uploadedFileName;

        // Update report with file info
        const { error: updateError } = await supabase
          .from('reports')
          .update({ file_url: fileUrl, file_name: fileName })
          .eq('id', report.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Report uploaded successfully",
        description: "The report has been added to the system.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedDepartment("");
      setFile(null);
      
    } catch (error: any) {
      console.error('Error uploading report:', error);
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
        <Label htmlFor="title">Report Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter report title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter report description"
          rows={3}
        />
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
        <Label htmlFor="file">Upload File (PDF, DOC, DOCX)</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <Button type="submit" disabled={uploading} className="w-full">
        {uploading ? "Uploading..." : "Upload Report"}
      </Button>
    </form>
  );
};