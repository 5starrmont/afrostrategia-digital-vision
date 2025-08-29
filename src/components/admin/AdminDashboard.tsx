import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  FileText, 
  ScrollText, 
  Eye, 
  Calendar, 
  AlertTriangle,
  Shield,
  Activity
} from "lucide-react";

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

export const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch admin stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_admin_stats');
      
      if (statsError) throw statsError;
      setStats(statsData[0] || null);

      // Fetch recent audit logs
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          table_name,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (auditError) throw auditError;
      setRecentActivity(auditData || []);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'content_upload':
      case 'report_upload':
        return 'bg-green-100 text-green-800';
      case 'content_status_change':
        return 'bg-blue-100 text-blue-800';
      case 'content_deletion':
      case 'report_deletion':
        return 'bg-red-100 text-red-800';
      case 'admin_role_assigned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Alert */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-800">Security Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 text-sm">
            All admin actions are logged and monitored. Ensure you follow proper security protocols when managing content and user data.
          </p>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Total Users</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{stats?.total_users || 0}</div>
            <p className="text-xs text-emerald-600 mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Content Items</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats?.total_content || 0}</div>
            <p className="text-xs text-blue-600 mt-1">
              {stats?.published_content || 0} published
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Reports</CardTitle>
            <ScrollText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats?.total_reports || 0}</div>
            <p className="text-xs text-purple-600 mt-1">
              {stats?.public_reports || 0} public
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
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
              {recentActivity.map((log) => (
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

      {/* Weekly Upload Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <CardTitle>Weekly Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Recent Uploads</span>
            </div>
            <span className="text-lg font-semibold text-emerald-600">
              {stats?.recent_uploads || 0}
            </span>
            <span className="text-sm text-gray-500">items in last 7 days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};