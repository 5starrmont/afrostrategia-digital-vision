import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Eye, Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface Content {
  id: string;
  title: string;
  body: string | null;
  type: string;
  published: boolean;
  created_at: string;
  file_url: string | null;
  author: string | null;
  departments: {
    name: string;
  } | null;
}

export const ContentPreview = () => {
  const [recentContent, setRecentContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentContent();

    // Real-time updates
    const channel = supabase
      .channel('content-preview-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'content' },
        () => {
          fetchRecentContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          id,
          title,
          body,
          type,
          published,
          created_at,
          file_url,
          author,
          departments (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentContent(data || []);
    } catch (error) {
      console.error('Error fetching recent content:', error);
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

      toast({
        title: published ? "Content published" : "Content unpublished",
        description: `Content is now ${published ? 'visible' : 'hidden'} on the website.`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'report':
        return 'bg-emerald-100 text-emerald-800';
      case 'policy':
        return 'bg-yellow-100 text-yellow-800';
      case 'research':
        return 'bg-blue-100 text-blue-800';
      case 'blog':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50 border-emerald-200">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-gray-900">
            <Eye className="h-5 w-5 text-emerald-600" />
            <span>Recent Content</span>
          </CardTitle>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Live Preview
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {recentContent.length === 0 ? (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No content available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentContent.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  item.published 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                    {item.departments && (
                      <Badge variant="outline" className="text-xs">
                        {item.departments.name.replace('Department of ', '')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={item.published}
                      onCheckedChange={(checked) => togglePublished(item.id, checked)}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <span className="text-xs text-gray-600">
                      {item.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h4>
                
                {item.body && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.body}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    {item.author && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{item.author}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => window.open(item.file_url!, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};