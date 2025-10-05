import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Building, User, FileText } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  type: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
  active: boolean;
}

export const PartnershipsPreview = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    message: ""
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Here you could integrate with an email service or save to database
      // For now, we'll show a success message
      toast({
        title: "Partnership Inquiry Sent",
        description: "Thank you for your interest! We'll get back to you soon.",
      });
      
      setFormData({ name: "", organization: "", email: "", message: "" });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-yellow-50/30 to-emerald-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent mb-6">
              Strategic Partnerships
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Loading our strategic partnerships...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="partnerships" className="py-24 bg-gradient-to-br from-emerald-50 via-yellow-50/30 to-emerald-50 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-6">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent mb-6">
            Strategic Partnerships
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Building meaningful collaborations with world-class institutions to amplify Africa's voice 
            in shaping the global digital governance landscape
          </p>
        </div>

        {/* Continuous vertical cycling carousel */}
        <div className="relative h-96 overflow-hidden">
          {/* Single continuous column that cycles up */}
          <div className="flex flex-col animate-cycle-up">
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div key={`cycle-${index}`} className="flex-shrink-0 mb-8">
                <div className="flex justify-center space-x-8">
                  {/* Create a row of 3-4 cards */}
                   {[0, 1, 2, 3].map((offset) => {
                    const partnerIndex = (index + offset) % partners.length;
                    const currentPartner = partners[partnerIndex];
                    return (
                      <Card key={`${index}-${offset}`} className="w-80 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            {currentPartner.logo_url ? (
                              <img 
                                src={currentPartner.logo_url}
                                alt={`${currentPartner.name} logo`}
                                className="w-24 h-16 mx-auto object-contain"
                              />
                            ) : (
                              <div className="w-24 h-16 mx-auto bg-emerald-100 rounded flex items-center justify-center text-emerald-600 font-bold">
                                {currentPartner.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                            {currentPartner.name}
                          </h3>
                          <div className="mb-3">
                            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                              {currentPartner.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {currentPartner.description || 'Strategic partnership for mutual growth and development.'}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Our Growing Network</h3>
            <p className="text-gray-600 mb-8">
              Partner with AfroStrategia to shape the future of digital governance in Africa
            </p>
            <button 
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-full font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Become a Partner
            </button>
          </div>
        </div>
      </div>

      {/* Partnership Inquiry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-900">Partner with Us</DialogTitle>
            <DialogDescription className="text-gray-600">
              Fill out the form below and we'll get back to you within 48 hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                <User className="h-4 w-4 inline mr-2" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization" className="text-sm font-medium">
                <Building className="h-4 w-4 inline mr-2" />
                Organization
              </Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Your Organization"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@organization.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                <FileText className="h-4 w-4 inline mr-2" />
                Message
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your organization and partnership interest..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? "Sending..." : "Submit Inquiry"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};
