
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Cpu, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  const scrollToAbout = () => {
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPartnerships = () => {
    const partnershipsSection = document.querySelector('#partnerships');
    if (partnershipsSection) {
      partnershipsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-emerald-50 via-white to-yellow-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Strategizing{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-yellow-600">
                  Africa's Digital Future
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                AfroStrategia is a Pan-African think tank shaping the continent's digital transformation through strategic research, policy innovation, and collaborative diplomacy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
                onClick={scrollToAbout}
              >
                Explore Our Research
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                onClick={scrollToPartnerships}
              >
                Partner With Us
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
              <Link to="/digital-trade" className="group">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                  <Globe className="h-8 w-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-gray-600 group-hover:text-emerald-700">Digital Trade</p>
                </div>
              </Link>
              <Link to="/ai-governance" className="group">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                  <Cpu className="h-8 w-8 text-yellow-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-gray-600 group-hover:text-emerald-700">AI Governance</p>
                </div>
              </Link>
              <Link to="/cyber-diplomacy" className="group">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                  <Shield className="h-8 w-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-gray-600 group-hover:text-emerald-700">Cyber Diplomacy</p>
                </div>
              </Link>
              <Link to="/youth-strategy" className="group">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                  <Users className="h-8 w-8 text-yellow-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm text-gray-600 group-hover:text-emerald-700">Youth Strategy</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-2xl p-8">
              <img 
                src="/lovable-uploads/aea9891e-d4df-4543-b771-163f7061a75c.png" 
                alt="AfroStrategia Vision" 
                className="w-full h-auto max-w-md mx-auto"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">2024</p>
                  <p className="text-sm text-gray-600">Established</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
