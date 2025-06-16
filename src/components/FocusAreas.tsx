
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Cpu, Shield, Users, ArrowRight } from "lucide-react";

export const FocusAreas = () => {
  const departments = [
    {
      icon: Globe,
      title: "Digital Trade & FinTech",
      description: "Advancing Africa's position in global digital commerce, cryptocurrency regulation, and financial technology innovation.",
      highlights: ["Cross-border payment systems", "Digital currency frameworks", "Trade facilitation platforms"],
      color: "emerald"
    },
    {
      icon: Cpu,
      title: "AI Governance & Ethics",
      description: "Developing ethical AI frameworks that reflect African values while fostering technological advancement.",
      highlights: ["AI policy development", "Algorithmic accountability", "Indigenous knowledge protection"],
      color: "yellow"
    },
    {
      icon: Shield,
      title: "Afro-Sovereignty & Cyber Diplomacy",
      description: "Strengthening Africa's digital sovereignty through strategic cyber diplomacy and security frameworks.",
      highlights: ["Data sovereignty policies", "Cyber security cooperation", "Digital rights advocacy"],
      color: "emerald"
    },
    {
      icon: Users,
      title: "Youth Strategy & Digital Rights",
      description: "Empowering Africa's youth through digital literacy, rights protection, and strategic engagement.",
      highlights: ["Digital skills development", "Youth policy advocacy", "Online safety frameworks"],
      color: "yellow"
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
            Four interconnected pillars driving Africa's digital transformation through research, policy, and strategic partnerships.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {departments.map((dept) => {
            const IconComponent = dept.icon;
            const colorClasses = dept.color === 'emerald' 
              ? 'text-emerald-600 bg-emerald-100' 
              : 'text-yellow-600 bg-yellow-100';
            
            return (
              <Card key={dept.title} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${colorClasses} flex items-center justify-center mb-4`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {dept.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {dept.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {dept.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <ArrowRight className="h-4 w-4 text-emerald-600 mr-2 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm text-emerald-700 font-medium group-hover:text-emerald-800 transition-colors">
                    Learn more →
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
