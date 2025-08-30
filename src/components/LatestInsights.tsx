
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface InsightContent {
  id: string;
  title: string;
  body: string | null;
  type: string;
  author: string | null;
  created_at: string;
  read_time: number | null;
  slug: string | null;
  published: boolean;
  file_url: string | null;
  file_name: string | null;
}

export const LatestInsights = () => {
  const [insights, setInsights] = useState<InsightContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('published', true)
        .in('type', ['policy', 'research', 'analysis', 'insight'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'policy': return 'text-emerald-700 bg-emerald-100';
      case 'research': return 'text-blue-700 bg-blue-100';
      case 'analysis': return 'text-purple-700 bg-purple-100';
      case 'insight': return 'text-orange-700 bg-orange-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const handleContentClick = (insight: InsightContent) => {
    if (insight.file_url) {
      window.open(insight.file_url, '_blank');
    }
  };

  return (
    <section id="research" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Latest Policy Insights
            </h2>
            <p className="text-xl text-gray-600">
              Research-driven analysis shaping Africa's digital policy landscape
            </p>
          </div>
          <Link to="/research">
            <Button variant="outline" className="hidden sm:flex border-emerald-700 text-emerald-700 hover:bg-emerald-50">
              View All Research
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {insights.map((insight, index) => (
              <Card 
                key={insight.id} 
                className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''
                }`}
                onClick={() => handleContentClick(insight)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className={getTypeColor(insight.type)}>
                      {insight.type}
                    </Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {insight.read_time && (
                        <span>{insight.read_time} min read</span>
                      )}
                      {insight.file_url && (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <CardTitle className={`group-hover:text-emerald-700 transition-colors ${
                    index === 0 ? 'text-2xl' : 'text-lg'
                  }`}>
                    {insight.title}
                  </CardTitle>
                  <CardDescription className={index === 0 ? 'text-base' : 'text-sm'}>
                    {insight.body ? 
                      (insight.body.length > 150 ? 
                        `${insight.body.substring(0, 150)}...` : 
                        insight.body
                      ) : 
                      `${insight.type} content - Click to view`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{insight.author || 'AfroStrategia'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(insight.created_at)}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h3>
            <p className="text-gray-600">
              Latest policy insights will appear here once content is published.
            </p>
          </div>
        )}

        <div className="text-center mt-12 sm:hidden">
          <Link to="/research">
            <Button variant="outline" className="border-emerald-700 text-emerald-700 hover:bg-emerald-50">
              View All Research
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
