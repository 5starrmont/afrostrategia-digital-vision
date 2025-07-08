import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface Content {
  id: string;
  title: string;
  body: string | null;
  type: string;
  published: boolean;
  created_at: string;
  file_url: string | null;
  file_name: string | null;
  department: {
    name: string;
    slug: string;
  } | null;
}

export const LatestContent = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          department:departments(name, slug)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Latest Content & Publications
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our most recent research papers, policy briefs, and strategic publications 
            shaping Africa's digital future.
          </p>
        </div>

        {content.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Content Available</h3>
            <p className="text-gray-500">Check back soon for our latest publications and research.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.map((item) => (
              <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${getTypeColor(item.type)} font-medium`}>
                      {item.type}
                    </Badge>
                    {item.department && (
                      <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200">
                        {item.department.name.replace('Department of ', '')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(item.created_at), 'MMM dd, yyyy')}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {item.body && (
                    <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                      {item.body}
                    </CardDescription>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {item.file_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                        onClick={() => window.open(item.file_url!, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Read More
                      </Button>
                    )}
                    
                    <span className="text-xs text-gray-500 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      AfroStrategia
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button 
            variant="outline"
            size="lg"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 px-8 py-3 font-medium"
          >
            View All Publications
          </Button>
        </div>
      </div>
    </section>
  );
};