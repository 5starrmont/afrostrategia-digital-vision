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

  const deleteContent = async (id: string, type: 'content' | 'report') => {
    try {
      const { error } = await supabase
        .from(type === 'content' ? 'content' : 'reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
      <TabsList>
        <TabsTrigger value="content">Content ({content.length})</TabsTrigger>
        <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="content">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.type}</Badge>
                  </TableCell>
                  <TableCell>{item.departments.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.published}
                        onCheckedChange={(checked) => togglePublished(item.id, checked)}
                      />
                      <span className="text-sm">
                        {item.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {item.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.departments.name}</TableCell>
                  <TableCell>
                    {item.file_name ? (
                      <Badge variant="outline">{item.file_name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">No file</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {item.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
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