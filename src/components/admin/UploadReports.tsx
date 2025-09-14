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

export const UploadReports = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(false);
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
      
      // Validate file if provided
      if (file) {
        // File size validation (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "File size must be less than 50MB",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }

        // File type validation
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Only PDF, Word, Excel, and image files are allowed",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }

      // Determine sensitivity level based on description
      let sensitivityLevel = 'public';
      if (description) {
        const desc = description.toLowerCase();
        if (desc.includes('confidential') || desc.includes('classified')) {
          sensitivityLevel = 'confidential';
        } else if (desc.includes('internal') || desc.includes('private')) {
          sensitivityLevel = 'internal';
        }
      }
      
      // Insert report record with enhanced security fields
      const { data: report, error: insertError } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          department_id: selectedDepartment,
          uploaded_by: user?.id,
          public: isPublic,
          sensitivity_level: sensitivityLevel,
          file_size: file?.size || null,
          file_type: file?.type || null,
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

      // Log admin action for audit trail
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action: 'report_upload',
          table_name: 'reports',
          record_id: report.id,
          new_values: { title, sensitivity_level: sensitivityLevel, public: isPublic }
        });

      toast({
        title: "Report uploaded successfully",
        description: "The report has been added to the system.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedDepartment("");
      setFile(null);
      setIsPublic(false);
      
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
    <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-emerald-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Reports</h2>
        <p className="text-gray-600">Add new reports to the platform</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-700 font-medium">Report Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter report title"
          required
          className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter report description"
          rows={3}
          className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
        />
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
        <Label htmlFor="file" className="text-gray-700 font-medium">Upload File (PDF, DOC, Images, etc.)</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 file:bg-emerald-50 file:text-emerald-700 file:border-emerald-200"
        />
        <p className="text-xs text-gray-500">
          Supported formats: PDF, Word documents, Excel files, images (JPG, PNG, GIF)
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="public"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="public" className="text-gray-700 font-medium">
          Make this report publicly accessible
        </Label>
      </div>

      <Button 
        type="submit" 
        disabled={uploading} 
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5"
      >
        {uploading ? "Uploading..." : "Upload Report"}
      </Button>
      </form>
    </div>
  );
};