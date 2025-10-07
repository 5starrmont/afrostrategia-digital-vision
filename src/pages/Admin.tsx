import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { UploadReports } from "@/components/admin/UploadReports";
import { UploadContent } from "@/components/admin/UploadContent";
import { ManageContent } from "@/components/admin/ManageContent";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SecuritySettings } from "@/components/admin/SecuritySettings";
import { LoginForm } from "@/components/admin/LoginForm";
import ManagePartners from "@/components/admin/ManagePartners";

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAdminRole, setHasAdminRole] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user has admin role (not moderator)
  const checkUserRole = async (userId: string) => {
    try {
      console.log('Checking role for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      console.log('Role check result:', { data, error });
      
      if (error) {
        console.error('Error checking user role:', error);
        setHasAdminRole(false);
      } else if (data && data.length > 0) {
        const userRole = data[0].role;
        console.log('User role is:', userRole);
        
        // If user is a moderator, redirect to moderator dashboard
        if (userRole === 'moderator') {
          console.log('Redirecting moderator to /moderator');
          navigate('/moderator');
          return;
        }
        
        // Only allow admin role
        console.log('Setting hasAdminRole to:', userRole === 'admin');
        setHasAdminRole(userRole === 'admin');
      } else {
        console.log('No role data found');
        setHasAdminRole(false);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setHasAdminRole(false);
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUserRole(session.user.id);
      } else {
        setRoleLoading(false);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setRoleLoading(true);
        await checkUserRole(session.user.id);
      } else {
        setHasAdminRole(false);
        setRoleLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of the admin panel.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAdminRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
              <p className="text-gray-600">
                You don't have permission to access the admin dashboard.
              </p>
              <p className="text-sm text-gray-500">
                Only users with admin or moderator roles can access this area.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="w-full">
                Return to Home
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/aea9891e-d4df-4543-b771-163f7061a75c.png" 
                alt="AfroStrategia Foundation Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-emerald-600">AfroStrategia Foundation Content Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 bg-white/50 px-3 py-1 rounded-full">
                Welcome, {user.email}
              </span>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-sm border border-emerald-100">
            <TabsTrigger 
              value="dashboard"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Upload Reports
            </TabsTrigger>
            <TabsTrigger 
              value="content"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Upload Content
            </TabsTrigger>
            <TabsTrigger 
              value="manage"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Manage Content
            </TabsTrigger>
            <TabsTrigger 
              value="partners"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Partners
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-white">Admin Dashboard</CardTitle>
                <p className="text-emerald-100">System overview and recent activity</p>
              </CardHeader>
              <CardContent className="p-6">
                <AdminDashboard onNavigateToTab={setActiveTab} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-white">Upload Reports</CardTitle>
                <p className="text-emerald-100">Add new research reports and documents</p>
              </CardHeader>
              <CardContent className="p-6">
                <UploadReports />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-white">Upload Content</CardTitle>
                <p className="text-emerald-100">Create and publish new content</p>
              </CardHeader>
              <CardContent className="p-6">
                <UploadContent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-white">Manage Content</CardTitle>
                <p className="text-emerald-100">View and manage existing content</p>
              </CardHeader>
              <CardContent className="p-6">
                <ManageContent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-white">Manage Partners</CardTitle>
                <p className="text-emerald-100">Manage strategic partnerships and logos</p>
              </CardHeader>
              <CardContent className="p-6">
                <ManagePartners />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
                <CardTitle className="text-white">Security Management</CardTitle>
                <p className="text-red-100">User roles and security settings</p>
              </CardHeader>
              <CardContent className="p-6">
                <SecuritySettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;