import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { UploadReports } from "@/components/admin/UploadReports";
import { UploadContent } from "@/components/admin/UploadContent";
import { ManageContent } from "@/components/admin/ManageContent";
import ManagePartners from "@/components/admin/ManagePartners";

const Moderator = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);

    // Check if user has moderator role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'moderator')
      .maybeSingle();

    if (roleData) {
      setIsModerator(true);
    } else {
      // If not moderator, check if admin and redirect
      const { data: adminData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (adminData) {
        navigate("/admin");
        return;
      }
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upload-reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="upload-reports">Upload Reports</TabsTrigger>
            <TabsTrigger value="upload-content">Upload Content</TabsTrigger>
            <TabsTrigger value="manage-content">Manage Content</TabsTrigger>
            <TabsTrigger value="manage-partners">Manage Partners</TabsTrigger>
          </TabsList>

          <TabsContent value="upload-reports">
            <Card>
              <CardContent className="p-6">
                <UploadReports />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload-content">
            <Card>
              <CardContent className="p-6">
                <UploadContent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-content">
            <Card>
              <CardContent className="p-6">
                <ManageContent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-partners">
            <Card>
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
