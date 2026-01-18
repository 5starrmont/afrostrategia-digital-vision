import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Edit, 
  Eye, 
  Plus,
  Users,
  Briefcase
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLog {
  id: string;
  action: string;
  table_name: string | null;
  created_at: string | null;
  new_values: any;
}

const getActionIcon = (action: string) => {
  if (action.includes('create') || action.includes('upload')) return <Plus className="h-4 w-4 text-emerald-500" />;
  if (action.includes('delete')) return <Trash2 className="h-4 w-4 text-red-500" />;
  if (action.includes('update')) return <Edit className="h-4 w-4 text-blue-500" />;
  if (action.includes('view')) return <Eye className="h-4 w-4 text-gray-500" />;
  return <FileText className="h-4 w-4 text-gray-400" />;
};

const getActionLabel = (action: string, tableName: string | null, newValues: any) => {
  const title = newValues?.title || newValues?.name || '';
  
  switch (action) {
    case 'blog_create':
      return `Created blog post "${title}"`;
    case 'blog_update':
      return `Updated blog post "${title}"`;
    case 'blog_delete':
      return `Deleted a blog post`;
    case 'content_upload':
      return `Uploaded content "${title}"`;
    case 'report_upload':
      return `Uploaded report "${title}"`;
    case 'opportunity_create':
      return `Created opportunity "${title}"`;
    case 'opportunity_update':
      return `Updated opportunity "${title}"`;
    case 'partner_create':
      return `Added partner "${title}"`;
    case 'partner_update':
      return `Updated partner "${title}"`;
    case 'role_update':
      return `Updated user role`;
    default:
      return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const getTableIcon = (tableName: string | null) => {
  switch (tableName) {
    case 'content':
      return <FileText className="h-4 w-4" />;
    case 'reports':
      return <Upload className="h-4 w-4" />;
    case 'opportunities':
      return <Briefcase className="h-4 w-4" />;
    case 'partners':
      return <Users className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const RecentActivityFeed = () => {
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('id, action, table_name, created_at, new_values')
          .order('created_at', { ascending: false })
          .limit(15);

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              {getActionIcon(activity.action)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 font-medium truncate">
                {getActionLabel(activity.action, activity.table_name, activity.new_values)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex-shrink-0 text-gray-400">
              {getTableIcon(activity.table_name)}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
