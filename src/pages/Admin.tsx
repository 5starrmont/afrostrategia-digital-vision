import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { UploadReports } from "@/components/admin/UploadReports";
import { UploadContent } from "@/components/admin/UploadContent";
import { ManageContent } from "@/components/admin/ManageContent";
import { LoginForm } from "@/components/admin/LoginForm";

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        navigate('/');
      }
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
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
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border border-emerald-100">
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
          </TabsList>

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
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;