import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Leaf, Zap, Droplets, Wind } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const EnvironmentalTechnology = () => {
  const initiatives = [
    {
      title: "Green Technology Initiatives",
      description: "Promoting sustainable technology solutions for environmental challenges across Africa",
      status: "Active"
    },
    {
      title: "Climate Policy Frameworks",
      description: "Developing comprehensive policies for climate adaptation and mitigation strategies",
      status: "Research Phase"
    },
    {
      title: "Sustainable Innovation Partnerships",
      description: "Building collaborations between governments, private sector, and environmental organizations",
      status: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-0">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-green-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="h-10 w-10 text-emerald-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Environmental Technology & Climate Innovation
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Focusing on sustainable technologies, climate adaptation strategies, and innovative 
                solutions for environmental challenges across Africa to build a resilient future.
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
                  The Environmental Technology & Climate Innovation department is dedicated to addressing 
                  Africa's environmental challenges through cutting-edge technology and innovative solutions 
                  that promote sustainable development.
                </p>
                <p className="text-lg text-gray-600">
                  We collaborate with research institutions, governments, and environmental organizations 
                  to develop climate-resilient technologies and policies that protect Africa's natural 
                  resources while fostering economic growth.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Zap className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">Clean Energy</h3>
                    <p className="text-sm text-gray-600 mt-2">Renewable energy solutions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Droplets className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">Water Management</h3>
                    <p className="text-sm text-gray-600 mt-2">Sustainable water technologies</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Wind className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">Air Quality</h3>
                    <p className="text-sm text-gray-600 mt-2">Pollution monitoring and control</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Leaf className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">Ecosystem Protection</h3>
                    <p className="text-sm text-gray-600 mt-2">Biodiversity conservation</p>
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
              <p className="text-xl text-gray-600">Leading projects in environmental technology and climate innovation</p>
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

export default EnvironmentalTechnology;