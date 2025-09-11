import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  FileText, 
  ScrollText, 
  Eye, 
  Calendar, 
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  Database,
  RefreshCw,
  BarChart3,
  PieChart,
  Upload,
  Download
} from "lucide-react";
import { ContentPreview } from "./ContentPreview";

interface AdminStats {
  total_users: number;
  total_content: number;
  total_reports: number;
  published_content: number;
  public_reports: number;
  recent_uploads: number;
}

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  user_id: string;
}

interface ContentStats {
  date: string;
  uploads: number;
  views: number;
}

interface TypeDistribution {
  name: string;
  value: number;
  color: string;
}

const AdminDashboard = memo(() => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [contentStats, setContentStats] = useState<ContentStats[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    
    try {
      // Parallel data fetching for better performance
      const [statsResult, auditResult, contentTrendsResult, contentTypesResult] = await Promise.all([
        supabase.rpc('get_admin_stats'),
        supabase
          .from('audit_logs')
          .select('id, action, table_name, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('content')
          .select('created_at, type')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('content')
          .select('type')
          .eq('published', true)
      ]);

      if (statsResult.error) throw statsResult.error;
      if (auditResult.error) throw auditResult.error;
      if (contentTrendsResult.error) throw contentTrendsResult.error;
      if (contentTypesResult.error) throw contentTypesResult.error;

      setStats(statsResult.data?.[0] || null);
      setRecentActivity(auditResult.data || []);

      // Process content trends data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
      });

      const dailyStats = new Map(last7Days.map(date => [date, { uploads: 0, views: 0 }]));
      
      contentTrendsResult.data?.forEach(item => {
        const date = item.created_at.split('T')[0];
        if (dailyStats.has(date)) {
          const current = dailyStats.get(date)!;
          dailyStats.set(date, { ...current, uploads: current.uploads + 1 });
        }
      });

      const chartData = Array.from(dailyStats.entries()).map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uploads: stats.uploads,
        views: stats.views
      }));

      setContentStats(chartData);

      // Process content type distribution
      const typeMap = new Map<string, number>();
      contentTypesResult.data?.forEach(item => {
        typeMap.set(item.type, (typeMap.get(item.type) || 0) + 1);
      });

      const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];
      const distribution = Array.from(typeMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      setTypeDistribution(distribution);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getActionBadgeColor = useCallback((action: string) => {
    switch (action) {
      case 'content_upload':
      case 'report_upload':
        return 'bg-primary/10 text-primary';
      case 'content_status_change':
        return 'bg-secondary/10 text-secondary-foreground';
      case 'content_deletion':
      case 'report_deletion':
        return 'bg-destructive/10 text-destructive';
      case 'admin_role_assigned':
        return 'bg-accent/10 text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }, []);

  const formatAction = useCallback((action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  const maxUploads = useMemo(() => 
    Math.max(...contentStats.map(d => d.uploads), 1), 
    [contentStats]
  );

  const maxTypeValue = useMemo(() => 
    Math.max(...typeDistribution.map(d => d.value), 1), 
    [typeDistribution]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Real-time insights into your platform's performance</p>
        </div>
        <Button 
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          variant="outline"
          className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Alert */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800">Security Monitor</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700 text-sm">
            All admin actions are logged and monitored. System security protocols are active and all data access is audited.
          </p>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Total Users</CardTitle>
            <div className="bg-emerald-600 p-2 rounded-full">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{stats?.total_users || 0}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Active accounts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Content Items</CardTitle>
            <div className="bg-blue-600 p-2 rounded-full">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats?.total_content || 0}</div>
            <p className="text-xs text-blue-600 mt-1">
              {stats?.published_content || 0} published ({Math.round(((stats?.published_content || 0) / (stats?.total_content || 1)) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Reports</CardTitle>
            <div className="bg-purple-600 p-2 rounded-full">
              <ScrollText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats?.total_reports || 0}</div>
            <p className="text-xs text-purple-600 mt-1">
              {stats?.public_reports || 0} public ({Math.round(((stats?.public_reports || 0) / (stats?.total_reports || 1)) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Recent Activity</CardTitle>
            <div className="bg-orange-600 p-2 rounded-full">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats?.recent_uploads || 0}</div>
            <p className="text-xs text-orange-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trends Chart */}
        <Card className="bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <CardTitle>Content Upload Trends (Last 7 Days)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentStats.length > 0 ? (
                contentStats.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-gray-700">{day.date}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">{day.uploads}</div>
                        <div className="text-xs text-gray-500">uploads</div>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.uploads / maxUploads) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No upload trends data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Type Distribution */}
        <Card className="bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              <CardTitle>Content Type Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeDistribution.length > 0 ? (
                typeDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-gray-700 capitalize">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-gray-900">{item.value}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            backgroundColor: item.color,
                            width: `${(item.value / maxTypeValue) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No content distribution data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Content Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-gray-600" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={getActionBadgeColor(log.action)}>
                        {formatAction(log.action)}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Admin User
                        </p>
                        <p className="text-xs text-gray-500">
                          Action on {log.table_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ContentPreview />
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-emerald-600" />
            <CardTitle>Quick Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center space-y-2 border-emerald-200 hover:bg-emerald-50"
              onClick={() => window.location.href = '#manage-content'}
            >
              <Upload className="h-6 w-6 text-emerald-600" />
              <span className="text-sm">Upload Content</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center space-y-2 border-blue-200 hover:bg-blue-50"
              onClick={() => window.location.href = '#upload-reports'}
            >
              <ScrollText className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Add Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center space-y-2 border-purple-200 hover:bg-purple-50"
              onClick={() => window.location.href = '#manage-content'}
            >
              <Eye className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Review Content</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center space-y-2 border-orange-200 hover:bg-orange-50"
              onClick={() => fetchDashboardData(true)}
            >
              <Download className="h-6 w-6 text-orange-600" />
              <span className="text-sm">Export Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AdminDashboard.displayName = 'AdminDashboard';

export { AdminDashboard };