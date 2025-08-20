import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download, ExternalLink } from "lucide-react";

interface Content {
  id: string;
  title: string;
  type: string;
  published: boolean;
  created_at: string;
  file_url?: string;
  file_name?: string;
  departments: {
    name: string;
  };
}

interface Report {
  id: string;
  title: string;
  description?: string;
  public: boolean;
  created_at: string;
  file_url?: string;
  file_name?: string;
  departments: {
    name: string;
  };
}

export const ManageContent = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
    fetchReports();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          departments (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          departments (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('content')
        .update({ published })
        .eq('id', id);

      if (error) throw error;

      setContent(content.map(item => 
        item.id === id ? { ...item, published } : item
      ));

      toast({
        title: "Content updated",
        description: `Content ${published ? 'published' : 'unpublished'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePublicStatus = async (id: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ public: !isPublic })
        .eq('id', id);

      if (error) throw error;

      setReports(reports.map(item => 
        item.id === id ? { ...item, public: !isPublic } : item
      ));

      toast({
        title: "Report updated",
        description: `Report is now ${!isPublic ? 'public' : 'private'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteContent = async (id: string, type: 'content' | 'report') => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tableName = type === 'content' ? 'content' : 'reports';
      
      // Get the item before deletion for audit logging
      const { data: item } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log deletion for audit trail
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: `${type}_deletion`,
          table_name: tableName,
          record_id: id,
          old_values: item
        });

      if (type === 'content') {
        setContent(content.filter(item => item.id !== id));
      } else {
        setReports(reports.filter(item => item.id !== id));
      }

      toast({
        title: "Deleted successfully",
        description: `${type === 'content' ? 'Content' : 'Report'} has been deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <Tabs defaultValue="content" className="space-y-4">
      <TabsList className="bg-emerald-50 border border-emerald-200">
        <TabsTrigger 
          value="content"
          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
        >
          Content ({content.length})
        </TabsTrigger>
        <TabsTrigger 
          value="reports"
          className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
        >
          Reports ({reports.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content">
        <div className="rounded-lg border border-emerald-200 bg-white/50 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-600 hover:bg-emerald-700">
                <TableHead className="text-white font-medium">Title</TableHead>
                <TableHead className="text-white font-medium">Type</TableHead>
                <TableHead className="text-white font-medium">Department</TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">Created</TableHead>
                <TableHead className="text-white font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id} className="hover:bg-emerald-50">
                  <TableCell className="font-medium text-gray-900">{item.title}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className="bg-emerald-100 text-emerald-700 border-emerald-200"
                    >
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700">{item.departments.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.published}
                        onCheckedChange={(checked) => togglePublished(item.id, checked)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                      <span className="text-sm text-gray-700">
                        {item.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {item.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContent(item.id, 'content')}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="reports">
        <div className="rounded-lg border border-emerald-200 bg-white/50 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-600 hover:bg-emerald-700">
                <TableHead className="text-white font-medium">Title</TableHead>
                <TableHead className="text-white font-medium">Department</TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">File</TableHead>
                <TableHead className="text-white font-medium">Created</TableHead>
                <TableHead className="text-white font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((item) => (
                <TableRow key={item.id} className="hover:bg-emerald-50">
                  <TableCell className="font-medium text-gray-900">{item.title}</TableCell>
                  <TableCell className="text-gray-700">{item.departments.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.public}
                        onCheckedChange={() => togglePublicStatus(item.id, item.public)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                      <span className="text-sm text-gray-700">
                        {item.public ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.file_name ? (
                      <Badge 
                        variant="outline" 
                        className="border-emerald-200 text-emerald-700"
                      >
                        {item.file_name}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">No file</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {item.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContent(item.id, 'report')}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
};