import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, AlertTriangle, Plus, FileText, Upload, Briefcase } from "lucide-react";
import { UploadReports } from "@/components/admin/UploadReports";
import { ManageContent } from "@/components/admin/ManageContent";
import { SecuritySettings } from "@/components/admin/SecuritySettings";
import { LoginForm } from "@/components/admin/LoginForm";
import ManagePartners from "@/components/admin/ManagePartners";
import ManageOpportunities from "@/components/admin/ManageOpportunities";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { RecentActivityFeed } from "@/components/admin/RecentActivityFeed";
import { cn } from "@/lib/utils";

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

    // Listen for auth changes - MUST be synchronous callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setRoleLoading(true);
        // Defer the async role check to avoid deadlock
        setTimeout(() => {
          checkUserRole(session.user.id);
        }, 0);
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

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                <p className="text-gray-600">Here's what's happening with your content.</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setActiveTab("blog")}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Blog Post
                </Button>
              </div>
            </div>

            {/* Analytics Overview */}
            <AnalyticsOverview />

            {/* Quick Actions + Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card className="lg:col-span-1 border-gray-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <button
                    onClick={() => setActiveTab("blog")}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Create Blog Post</p>
                      <p className="text-sm text-gray-500">Write and publish a new article</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Upload Report</p>
                      <p className="text-sm text-gray-500">Add research documents</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("opportunities")}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Briefcase className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Post Opportunity</p>
                      <p className="text-sm text-gray-500">Add jobs or internships</p>
                    </div>
                  </button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2 border-gray-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivityFeed />
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "blog":
        return <BlogEditor />;
      case "reports":
        return <UploadReports />;
      case "manage":
        return <ManageContent />;
      case "opportunities":
        return <ManageOpportunities />;
      case "partners":
        return <ManagePartners />;
      case "security":
        return <SecuritySettings />;
      default:
        return <BlogEditor />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard";
      case "blog": return "Blog Editor";
      case "reports": return "Upload Reports";
      case "manage": return "Manage Content";
      case "opportunities": return "Manage Careers";
      case "partners": return "Manage Partners";
      case "security": return "Security Settings";
      default: return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onSignOut={handleSignOut}
        userEmail={user.email}
      />

      {/* Main Content */}
      <main className="ml-16 lg:ml-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500">AfroStrategia Foundation Admin</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-600"
            >
              View Website
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
