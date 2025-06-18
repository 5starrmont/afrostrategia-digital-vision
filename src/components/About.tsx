
import { Card, CardContent } from "@/components/ui/card";
import { Target, Globe2, Users2, Lightbulb } from "lucide-react";

export const About = () => {
  const values = [
    {
      icon: Target,
      title: "Strategic Vision",
      description: "Long-term thinking that positions Africa at the forefront of global digital governance."
    },
    {
      icon: Globe2,
      title: "Pan-African Unity",
      description: "Fostering collaboration across the continent to amplify Africa's collective voice."
    },
    {
      icon: Users2,
      title: "Inclusive Innovation",
      description: "Ensuring digital transformation benefits all Africans, especially youth and marginalized communities."
    },
    {
      icon: Lightbulb,
      title: "Policy Excellence",
      description: "Research-driven insights that inform sound policy decisions at national and continental levels."
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              About AfroStrategia
            </h2>
            <div className="space-y-4 text-lg text-gray-600">
              <p>
                AfroStrategia is a premier Pan-African think tank established in 2024 to strategically position Africa in the global digital landscape. We bridge the gap between African wisdom and international digital governance frameworks.
              </p>
              <p>
                Our multidisciplinary approach combines policy research, strategic analysis, and diplomatic engagement to ensure Africa's digital sovereignty while fostering innovation and economic growth.
              </p>
              <p>
                Through our four specialized departments, we address the most pressing challenges and opportunities in Africa's digital transformation journey.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-emerald-700">54</div>
                  <div className="text-sm text-gray-600">African Countries</div>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-yellow-600">4</div>
                  <div className="text-sm text-gray-600">Core Departments</div>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-emerald-700">100+</div>
                  <div className="text-sm text-gray-600">Policy Insights</div>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-yellow-600">25+</div>
                  <div className="text-sm text-gray-600">Partnerships</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-emerald-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
