import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  UserPlus, 
  Key, 
  AlertTriangle, 
  Users, 
  Eye,
  Database
} from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export const SecuritySettings = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "moderator" | "user">("user");
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      toast({
        title: "Error loading user roles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRolesLoading(false);
    }
  };

  const assignUserRole = async () => {
    if (!newUserEmail || !newUserRole) {
      toast({
        title: "Missing information",
        description: "Please provide both email and role.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call the database function to assign role by email
      const { data, error } = await supabase.rpc('assign_role_by_email', {
        user_email: newUserEmail,
        user_role: newUserRole
      });

      if (error) throw error;

      // Parse the JSONB response
      const result = data as { success: boolean; error?: string; action?: string };

      if (!result.success) {
        toast({
          title: "Role assignment failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const action = result.action === 'updated' ? 'updated' : 'assigned';
      toast({
        title: `Role ${action}`,
        description: `User role ${action === 'updated' ? 'updated to' : 'assigned as'} ${newUserRole}.`,
      });

      setNewUserEmail("");
      setNewUserRole("user");
      fetchUserRoles();
      
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Role assignment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeUserRole = async (roleId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove admin/moderator access for ${userEmail}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Role removed",
        description: "User role has been removed.",
      });

      fetchUserRoles();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Error removing role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h2>
        <p className="text-gray-600">Manage user roles and access permissions</p>
      </div>

      {/* Security Warning */}
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Security Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 text-sm">
            Use extreme caution when assigning admin or moderator roles. Only trusted personnel should have elevated access.
            All role changes are logged for security auditing.
          </p>
        </CardContent>
      </Card>

      {/* Add New User Role */}
      <Card className="bg-white/50 backdrop-blur-sm border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-200">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-gray-900">Assign User Role</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail" className="text-gray-700 font-medium">User Email</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userRole" className="text-gray-700 font-medium">Role</Label>
              <Select value={newUserRole} onValueChange={(value: "admin" | "moderator" | "user") => setNewUserRole(value)}>
                <SelectTrigger className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-emerald-200">
                  <SelectItem value="user" className="hover:bg-emerald-50">User</SelectItem>
                  <SelectItem value="moderator" className="hover:bg-emerald-50">Moderator</SelectItem>
                  <SelectItem value="admin" className="hover:bg-emerald-50">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={assignUserRole}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? "Assigning..." : "Assign Role"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current User Roles */}
      <Card className="bg-white/50 backdrop-blur-sm border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-200">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-gray-900">User Roles & Permissions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {rolesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
            </div>
          ) : userRoles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No user roles assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {userRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        User ID: {userRole.user_id.slice(0, 8)}...
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(userRole.role)}`}>
                          {userRole.role.charAt(0).toUpperCase() + userRole.role.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Since {new Date(userRole.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {(userRole.role === 'admin' || userRole.role === 'moderator') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeUserRole(userRole.id, `User ${userRole.user_id.slice(0, 8)}`)}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      Remove Access
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card className="bg-white/50 backdrop-blur-sm border-emerald-200">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-200">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-gray-900">Security Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Administrator Access</h4>
              <p className="text-sm text-blue-700">
                Full system access including user management, content moderation, and security settings.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">Moderator Access</h4>
              <p className="text-sm text-yellow-700">
                Content management access including publishing, editing, and content moderation.
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="h-4 w-4 text-gray-600" />
              <h4 className="font-medium text-gray-900">Audit Trail</h4>
            </div>
            <p className="text-sm text-gray-600">
              All administrative actions are automatically logged and can be reviewed in the admin dashboard.
              This includes role assignments, content changes, and security modifications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};