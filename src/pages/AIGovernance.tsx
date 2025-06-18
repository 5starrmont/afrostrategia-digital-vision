
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Cpu, Brain, Scale, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AIGovernance = () => {
  const principles = [
    {
      title: "Ubuntu-Centered AI",
      description: "Developing AI systems that reflect African communal values and collective responsibility"
    },
    {
      title: "Algorithmic Transparency",
      description: "Ensuring AI decision-making processes are explainable and accountable"
    },
    {
      title: "Indigenous Knowledge Protection",
      description: "Safeguarding traditional knowledge from unauthorized AI training and exploitation"
    },
    {
      title: "Inclusive Development",
      description: "Promoting diverse participation in AI research and development across the continent"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-yellow-50 to-emerald-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Cpu className="h-10 w-10 text-yellow-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                AI Governance & Ethics
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Developing ethical AI frameworks that reflect African values while fostering 
                technological advancement and protecting human dignity across the continent.
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
                <p className="text-lg text-gray-600 mb-6">
                  We envision an AI future where African values of Ubuntu, collective responsibility, 
                  and human dignity are at the center of technological development. Our research 
                  focuses on creating governance frameworks that ensure AI serves humanity.
                </p>
                <p className="text-lg text-gray-600">
                  Through policy research, stakeholder engagement, and international collaboration, 
                  we're building bridges between traditional wisdom and cutting-edge technology.
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-100 to-emerald-100 rounded-2xl p-8">
                <Brain className="h-16 w-16 text-yellow-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ubuntu AI Principles</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Human-centered design and decision-making
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Collective benefit over individual gain
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Transparency and accountability
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    Cultural sensitivity and respect
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Core Principles */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ethical AI Principles</h2>
              <p className="text-xl text-gray-600">Foundational values guiding our AI governance framework</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {principles.map((principle, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Scale className="h-5 w-5 text-yellow-600" />
                      </div>
                      <CardTitle className="text-lg">{principle.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{principle.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Research Areas */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Research Focus Areas</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="p-8">
                  <BookOpen className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Policy Development</h3>
                  <p className="text-gray-600">Creating comprehensive AI governance policies for African nations</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-8">
                  <Scale className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Algorithmic Accountability</h3>
                  <p className="text-gray-600">Ensuring transparency and fairness in automated decision systems</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-8">
                  <Brain className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Cultural AI Ethics</h3>
                  <p className="text-gray-600">Integrating African philosophical traditions into AI development</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AIGovernance;
