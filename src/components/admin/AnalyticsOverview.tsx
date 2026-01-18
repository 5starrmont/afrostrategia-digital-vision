import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Users, 
  Upload, 
  Eye,
  TrendingUp,
  Briefcase,
  BarChart3
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  total_reports: number;
  public_reports: number;
  total_content: number;
  published_content: number;
  recent_uploads: number;
  total_users: number;
}

interface ContentByType {
  type: string;
  count: number;
}

export const AnalyticsOverview = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [contentByType, setContentByType] = useState<ContentByType[]>([]);
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);
  const [partnersCount, setPartnersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch admin stats using the RPC function
        const { data: statsData, error: statsError } = await supabase.rpc('get_admin_stats');
        if (statsError) throw statsError;
        if (statsData && statsData.length > 0) {
          setStats(statsData[0]);
        }

        // Fetch content breakdown by type
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('type');
        
        if (!contentError && contentData) {
          const typeCounts = contentData.reduce((acc: Record<string, number>, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
          }, {});
          
          setContentByType(
            Object.entries(typeCounts).map(([type, count]) => ({ type, count: count as number }))
          );
        }

        // Fetch opportunities count
        const { count: oppCount } = await supabase
          .from('opportunities')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);
        setOpportunitiesCount(oppCount || 0);

        // Fetch partners count
        const { count: partnerCount } = await supabase
          .from('partners')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
        setPartnersCount(partnerCount || 0);

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Content",
      value: stats?.total_content || 0,
      subtitle: `${stats?.published_content || 0} published`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Reports",
      value: stats?.total_reports || 0,
      subtitle: `${stats?.public_reports || 0} public`,
      icon: Upload,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Blog Posts",
      value: contentByType.find(c => c.type === 'blog')?.count || 0,
      subtitle: "Total blogs",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Opportunities",
      value: opportunitiesCount,
      subtitle: "Jobs & internships",
      icon: Briefcase,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Partners",
      value: partnersCount,
      subtitle: "Active partners",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Recent Uploads",
      value: stats?.recent_uploads || 0,
      subtitle: "Last 7 days",
      icon: TrendingUp,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Breakdown */}
      {contentByType.length > 0 && (
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900">Content by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentByType.map((item) => {
                const maxCount = Math.max(...contentByType.map(c => c.count));
                const percentage = (item.count / maxCount) * 100;
                
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 capitalize">
                        {item.type.replace(/-/g, ' ')}
                      </span>
                      <span className="font-medium text-gray-900">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
