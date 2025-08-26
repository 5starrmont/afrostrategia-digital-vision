
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Cpu, Shield, Users, ArrowRight, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export const FocusAreas = () => {
  const departments = [
    {
      icon: Globe,
      title: "Department of Digital Trade and FinTech Access",
      description: "Advancing Africa's position in global digital commerce, cryptocurrency regulation, and financial technology innovation.",
      highlights: ["Cross-border payment systems", "Digital currency frameworks", "Trade facilitation platforms"],
      color: "emerald",
      link: "/digital-trade"
    },
    {
      icon: Cpu,
      title: "Department of AI Ethics, Governance & Innovation",
      description: "Developing ethical AI frameworks that reflect African values while fostering technological advancement.",
      highlights: ["AI policy development", "Algorithmic accountability", "Indigenous knowledge protection"],
      color: "yellow",
      link: "/ai-governance"
    },
    {
      icon: Shield,
      title: "Department of Afro-Sovereignty and Cyber Diplomacy",
      description: "Strengthening Africa's digital sovereignty through strategic cyber diplomacy and security frameworks.",
      highlights: ["Data sovereignty policies", "Cyber security cooperation", "Digital rights advocacy"],
      color: "emerald",
      link: "/cyber-diplomacy"
    },
    {
      icon: Users,
      title: "Department of Youth Strategy and Digital Rights",
      description: "Empowering Africa's youth through digital literacy, rights protection, and strategic engagement.",
      highlights: ["Digital skills development", "Youth policy advocacy", "Online safety frameworks"],
      color: "yellow",
      link: "/youth-strategy"
    },
    {
      icon: Leaf,
      title: "Department of Environmental Technology and Climate Innovation",
      description: "Focusing on sustainable technologies, climate adaptation strategies, and innovative solutions for environmental challenges across Africa.",
      highlights: ["Green technology initiatives", "Climate policy frameworks", "Sustainable innovation partnerships"],
      color: "emerald",
      link: "/environmental-technology"
    }
  ];

  return (
    <section id="departments" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-900 bg-clip-text text-transparent mb-4">
            Our Strategic Departments
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Five interconnected pillars driving Africa's digital transformation through research, policy, and strategic partnerships.
          </p>
        </div>

        {/* First row - 2 departments */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {departments.slice(0, 2).map((dept) => {
            const IconComponent = dept.icon;
            const colorClasses = dept.color === 'emerald' 
              ? 'text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' 
              : 'text-amber-600 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200';
            
            return (
              <Link key={dept.title} to={dept.link}>
                <Card className="group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 cursor-pointer h-full border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 rounded-xl ${colorClasses} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                      {dept.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 leading-relaxed">
                      {dept.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {dept.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start text-sm text-slate-600">
                          <ArrowRight className="h-4 w-4 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-sm text-emerald-700 font-semibold group-hover:text-emerald-800 transition-colors flex items-center">
                      Learn more
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Second row - 3 departments */}
        <div className="grid md:grid-cols-3 gap-8">
          {departments.slice(2, 5).map((dept) => {
            const IconComponent = dept.icon;
            const colorClasses = dept.color === 'emerald' 
              ? 'text-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' 
              : 'text-amber-600 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200';
            
            return (
              <Link key={dept.title} to={dept.link}>
                <Card className="group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 cursor-pointer h-full border-0 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 rounded-xl ${colorClasses} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-lg text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                      {dept.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 leading-relaxed text-sm">
                      {dept.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {dept.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start text-xs text-slate-600">
                          <ArrowRight className="h-3 w-3 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-sm text-emerald-700 font-semibold group-hover:text-emerald-800 transition-colors flex items-center">
                      Learn more
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
