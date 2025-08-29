
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Globe, TrendingUp, Shield, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DigitalTrade = () => {
  const initiatives = [
    {
      title: "Cross-Border Payment Systems",
      description: "Developing frameworks for seamless digital transactions across African borders",
      status: "Active"
    },
    {
      title: "Digital Currency Frameworks",
      description: "Policy research on cryptocurrency regulation and central bank digital currencies",
      status: "Research Phase"
    },
    {
      title: "Trade Facilitation Platforms",
      description: "Digital infrastructure for enhanced intra-African trade",
      status: "Planning"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-0">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-yellow-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="h-10 w-10 text-emerald-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Digital Trade & FinTech
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Advancing Africa's position in global digital commerce, cryptocurrency regulation, 
                and financial technology innovation to foster economic integration and prosperity.
              </p>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  The Digital Trade & FinTech department focuses on creating policy frameworks that enable 
                  Africa to participate meaningfully in the global digital economy while protecting 
                  consumer interests and national sovereignty.
                </p>
                <p className="text-lg text-gray-600">
                  We work with governments, financial institutions, and technology companies to develop 
                  inclusive financial systems that leverage emerging technologies for continental integration.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">Market Analysis</h3>
                    <p className="text-sm text-gray-600 mt-2">Real-time digital economy insights</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">Regulatory Framework</h3>
                    <p className="text-sm text-gray-600 mt-2">Policy development and compliance</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Globe className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">Cross-Border Integration</h3>
                    <p className="text-sm text-gray-600 mt-2">Seamless continental commerce</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">Stakeholder Engagement</h3>
                    <p className="text-sm text-gray-600 mt-2">Multi-sector collaboration</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Current Initiatives */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Initiatives</h2>
              <p className="text-xl text-gray-600">Active projects shaping Africa's digital trade landscape</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {initiatives.map((initiative, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{initiative.title}</CardTitle>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                      {initiative.status}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{initiative.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DigitalTrade;
