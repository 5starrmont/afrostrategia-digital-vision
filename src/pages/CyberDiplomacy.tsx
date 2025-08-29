
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Shield, Globe, Lock, Network } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CyberDiplomacy = () => {
  const initiatives = [
    {
      title: "Data Sovereignty Frameworks",
      description: "Developing legal and technical frameworks for African data governance",
      icon: Lock
    },
    {
      title: "Cyber Security Cooperation",
      description: "Building continental cybersecurity partnerships and information sharing",
      icon: Shield
    },
    {
      title: "Digital Rights Advocacy",
      description: "Promoting digital human rights and privacy protections across Africa",
      icon: Network
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-0">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-blue-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-emerald-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Afro-Sovereignty & Cyber Diplomacy
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Strengthening Africa's digital sovereignty through strategic cyber diplomacy, 
                security frameworks, and coordinated continental responses to digital challenges.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Strategic Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our department focuses on ensuring Africa maintains control over its digital 
                  destiny while actively participating in global cyber governance discussions. 
                  We develop frameworks that protect national interests while fostering international cooperation.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Through diplomatic engagement, policy research, and capacity building, we work 
                  to establish Africa as a key player in shaping global digital governance norms.
                </p>
                <div className="bg-emerald-50 p-6 rounded-lg">
                  <h3 className="font-bold text-emerald-900 mb-3">Core Objectives</h3>
                  <ul className="space-y-2 text-emerald-800">
                    <li>• Develop continental cyber security strategies</li>
                    <li>• Advocate for African interests in global forums</li>
                    <li>• Build diplomatic capacity for digital issues</li>
                    <li>• Protect critical digital infrastructure</li>
                  </ul>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-lg">
                  <Globe className="h-16 w-16 text-emerald-600 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Digital Sovereignty</h3>
                  <p className="text-gray-600">
                    Africa's right to govern its digital space, protect citizen data, 
                    and maintain technological independence while engaging globally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Initiatives */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Strategic Initiatives</h2>
              <p className="text-xl text-gray-600">Building Africa's cyber diplomatic capabilities</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {initiatives.map((initiative, index) => {
                const IconComponent = initiative.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow text-center">
                    <CardHeader>
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-emerald-600" />
                      </div>
                      <CardTitle className="text-lg">{initiative.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{initiative.description}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Partnerships */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Diplomatic Partnerships</h2>
              <p className="text-xl text-gray-600">Building bridges for cyber cooperation</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center p-6">
                <h3 className="font-semibold text-gray-900 mb-2">African Union</h3>
                <p className="text-sm text-gray-600">Continental cyber security coordination</p>
              </Card>
              
              <Card className="text-center p-6">
                <h3 className="font-semibold text-gray-900 mb-2">UN Groups</h3>
                <p className="text-sm text-gray-600">Global cyber governance participation</p>
              </Card>
              
              <Card className="text-center p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Regional Bodies</h3>
                <p className="text-sm text-gray-600">Sub-regional cyber diplomacy initiatives</p>
              </Card>
              
              <Card className="text-center p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Tech Partners</h3>
                <p className="text-sm text-gray-600">Private sector cyber security cooperation</p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CyberDiplomacy;
