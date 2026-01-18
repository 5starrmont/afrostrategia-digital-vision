import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Upload, Users, Briefcase, Home } from "lucide-react";
import { UploadReports } from "@/components/admin/UploadReports";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { ManageContent } from "@/components/admin/ManageContent";
import ManagePartners from "@/components/admin/ManagePartners";
import ManageOpportunities from "@/components/admin/ManageOpportunities";

const Moderator = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAccess = async (userId: string) => {
      console.log('Moderator page - Checking role for user:', userId);
      
      // Check if user has moderator role
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      console.log('Moderator page - Role data:', roleData, 'Error:', error);

      if (error) {
        console.error('Error checking user role:', error);
        setIsModerator(false);
        setLoading(false);
        return;
      }
      
      if (roleData) {
        // If user is admin, redirect to admin dashboard
        if (roleData.role === 'admin') {
          console.log('User is admin, redirecting to /admin');
          navigate('/admin');
          return;
        }
        console.log('User role is:', roleData.role);
        setIsModerator(roleData.role === 'moderator');
      } else {
        setIsModerator(false);
      }
      setLoading(false);
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      await checkUserAccess(session.user.id);
    };

    checkAuth();

    // Listen for auth changes - synchronous callback to avoid deadlock
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
        // Defer async operations with setTimeout
        setTimeout(() => {
          checkUserAccess(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">
              You don't have moderator access. Please contact an administrator.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/")} variant="outline">
                Return Home
              </Button>
              <Button onClick={handleSignOut} variant="destructive">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/aea9891e-d4df-4543-b771-163f7061a75c.png" 
                alt="AfroStrategia" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Moderator Dashboard</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                View Site
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="blog" className="space-y-6">
          <TabsList className="flex w-full bg-white/60 backdrop-blur-sm border border-emerald-100 p-1 rounded-lg">
            <TabsTrigger 
              value="blog" 
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              Blog Editor
            </TabsTrigger>
            <TabsTrigger 
              value="upload-reports"
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Upload className="h-4 w-4" />
              Upload Reports
            </TabsTrigger>
            <TabsTrigger 
              value="manage-content"
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              Manage Content
            </TabsTrigger>
            <TabsTrigger 
              value="opportunities"
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Briefcase className="h-4 w-4" />
              Careers
            </TabsTrigger>
            <TabsTrigger 
              value="manage-partners"
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              Partners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blog">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-white">Blog Editor</CardTitle>
                <p className="text-emerald-100">Create, edit, and publish blog posts</p>
              </CardHeader>
              <CardContent className="p-6">
                <BlogEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload-reports">
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

          <TabsContent value="manage-content">
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

          <TabsContent value="opportunities">
            <Card className="bg-white/80 backdrop-blur-sm border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-white">Manage Careers</CardTitle>
                <p className="text-emerald-100">Create and manage job, internship, and attachment opportunities</p>
              </CardHeader>
              <CardContent className="p-6">
                <ManageOpportunities />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-partners">
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
        </Tabs>
      </main>
    </div>
  );
};

export default Moderator;
