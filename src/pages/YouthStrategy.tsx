
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Users, Smartphone, BookOpen, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const YouthStrategy = () => {
  const programs = [
    {
      title: "Digital Literacy Initiatives",
      description: "Comprehensive programs to enhance digital skills across African youth",
      participants: "50,000+",
      status: "Active"
    },
    {
      title: "Youth Policy Labs",
      description: "Engaging young leaders in digital policy development and advocacy",
      participants: "2,500+",
      status: "Expanding"
    },
    {
      title: "Online Safety Frameworks",
      description: "Creating safe digital spaces and cybersecurity awareness programs",
      participants: "100,000+",
      status: "Continental"
    }
  ];

  const stats = [
    { number: "70%", label: "of Africa's population is under 30" },
    { number: "500M+", label: "youth will enter workforce by 2030" },
    { number: "85%", label: "youth access internet via mobile" },
    { number: "12", label: "countries with active youth programs" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-yellow-50 to-orange-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-yellow-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Youth Strategy & Digital Rights
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Empowering Africa's youth through digital literacy, rights protection, and strategic 
                engagement in shaping the continent's digital future.
              </p>
            </div>
          </div>
        </section>

        {/* Youth Demographics */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Africa's Youth Advantage</h2>
              <p className="text-xl text-gray-600">Harnessing the continent's demographic dividend</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-8">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{stat.number}</div>
                    <p className="text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Approach</h3>
                <p className="text-lg text-gray-600 mb-6">
                  We recognize that Africa's youth are not just beneficiaries of digital transformation 
                  but active participants and leaders. Our strategy focuses on building capacity, 
                  protecting rights, and creating platforms for meaningful engagement.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-gray-700">Skills development and digital literacy</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-gray-700">Youth leadership and policy engagement</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-gray-700">Digital rights and online safety</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-gray-700">Innovation and entrepreneurship support</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Youth Digital Charter</h3>
                <div className="space-y-4 text-gray-700">
                  <p className="font-medium">Every African youth has the right to:</p>
                  <ul className="space-y-2 text-sm">
                    <li>• Access quality digital education and resources</li>
                    <li>• Privacy and protection in digital spaces</li>
                    <li>• Participate in digital policy decisions</li>
                    <li>• Economic opportunities in the digital economy</li>
                    <li>• Cultural expression and digital creativity</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Youth Programs</h2>
              <p className="text-xl text-gray-600">Empowering the next generation of digital leaders</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {programs.map((program, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg pr-4">{program.title}</CardTitle>
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full whitespace-nowrap">
                        {program.status}
                      </span>
                    </div>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Participants Reached</p>
                      <p className="text-2xl font-bold text-yellow-600">{program.participants}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Be part of Africa's digital transformation. Connect with youth leaders, 
                access resources, and contribute to policy development.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-yellow-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Youth Network
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-yellow-600 transition-colors">
                  Policy Lab
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default YouthStrategy;
