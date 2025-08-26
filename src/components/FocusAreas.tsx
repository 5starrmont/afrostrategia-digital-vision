
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
    <section id="departments" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Strategic Departments
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Five interconnected pillars driving Africa's digital transformation through research, policy, and strategic partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {departments.map((dept) => {
            const IconComponent = dept.icon;
            const colorClasses = dept.color === 'emerald' 
              ? 'text-emerald-600 bg-emerald-100' 
              : 'text-yellow-600 bg-yellow-100';
            
            return (
              <Link key={dept.title} to={dept.link} className="group">
                <Card className="h-full min-h-[480px] hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white hover:bg-gray-50 border-gray-200 hover:border-emerald-300 hover:scale-[1.02]">
                  <CardHeader className="pb-6">
                    <div className={`w-16 h-16 rounded-xl ${colorClasses} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-tight min-h-[4rem] flex items-start">
                      {dept.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed min-h-[5rem] flex items-start text-base">
                      {dept.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between flex-1 pt-0">
                    <ul className="space-y-3 mb-6 flex-1">
                      {dept.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <ArrowRight className="h-4 w-4 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-base text-emerald-700 font-semibold group-hover:text-emerald-800 transition-colors flex items-center mt-auto pt-4 border-t border-gray-100">
                      Learn more
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
