import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in to the admin panel.",
      });
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-yellow-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/lovable-uploads/aea9891e-d4df-4543-b771-163f7061a75c.png" 
              alt="AfroStrategia Foundation Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AfroStrategia Foundation</h1>
              <p className="text-emerald-600 text-sm">Pan-African Think Tank</p>
            </div>
          </div>
        </div>

        <Card className="w-full bg-white/80 backdrop-blur-sm border-emerald-100 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl text-gray-900">
              Admin Login
            </CardTitle>
            <p className="text-gray-600">
              Access the admin dashboard
            </p>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@afrostrategia.org"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white" 
              disabled={loading}
            >
              {loading ? "Processing..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};