import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Calendar, User, Download, Search, Filter, ArrowRight } from "lucide-react";

const Research = () => {
  const featuredResearch = [
    {
      title: "African Digital Sovereignty Framework 2024",
      description: "Comprehensive policy framework for establishing digital sovereignty across African nations, addressing data governance, cybersecurity, and technological independence.",
      type: "Policy Brief",
      category: "Cyber Diplomacy",
      author: "Dr. Amara Diallo",
      date: "March 2024",
      downloadUrl: "#",
      featured: true,
      tags: ["Digital Sovereignty", "Policy Framework", "Africa"]
    },
    {
      title: "FinTech Regulatory Harmonization Across ECOWAS",
      description: "Analysis of regulatory frameworks and recommendations for harmonizing FinTech policies across West African Economic Community states.",
      type: "Research Paper",
      category: "Digital Trade",
      author: "Prof. Kwame Asante",
      date: "February 2024",
      downloadUrl: "#",
      featured: true,
      tags: ["FinTech", "ECOWAS", "Regulation"]
    }
  ];

  const allResearch = [
    {
      title: "AI Ethics Guidelines for African Development",
      description: "Culturally-informed AI governance principles balancing innovation with traditional African values and social structures.",
      type: "Policy Brief",
      category: "AI Governance",
      author: "Dr. Fatima Okafor",
      date: "March 2024",
      downloadUrl: "#",
      tags: ["AI Ethics", "Governance", "Culture"]
    },
    {
      title: "Youth Digital Rights Protection Framework",
      description: "Comprehensive framework for protecting digital rights of African youth in an increasingly connected digital environment.",
      type: "Research Paper",
      category: "Youth Strategy",
      author: "Dr. Kofi Mensah",
      date: "February 2024",
      downloadUrl: "#",
      tags: ["Digital Rights", "Youth", "Protection"]
    },
    {
      title: "Cryptocurrency Adoption in Sub-Saharan Africa",
      description: "Market analysis and policy recommendations for cryptocurrency adoption and regulation across Sub-Saharan African countries.",
      type: "Market Analysis",
      category: "Digital Trade",
      author: "Prof. Aisha Kamara",
      date: "January 2024",
      downloadUrl: "#",
      tags: ["Cryptocurrency", "Market Analysis", "Regulation"]
    },
    {
      title: "Cybersecurity Capacity Building Strategy",
      description: "Strategic roadmap for enhancing cybersecurity capabilities across African institutions and government agencies.",
      type: "Strategy Document",
      category: "Cyber Diplomacy",
      author: "Dr. Samuel Nkomo",
      date: "January 2024",
      downloadUrl: "#",
      tags: ["Cybersecurity", "Capacity Building", "Strategy"]
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Digital Trade":
        return "bg-emerald-100 text-emerald-700";
      case "AI Governance":
        return "bg-yellow-100 text-yellow-700";
      case "Cyber Diplomacy":
        return "bg-blue-100 text-blue-700";
      case "Youth Strategy":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-50 to-yellow-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Policy Research & Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Evidence-based research shaping Africa's digital transformation through comprehensive policy analysis, strategic frameworks, and actionable recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800">
                Browse All Research
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-emerald-700 text-emerald-700 hover:bg-emerald-50">
                Subscribe to Updates
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Research */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Research</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {featuredResearch.map((item, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    <Badge variant="outline">{item.type}</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Research Library */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Research Library</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search research..." className="pl-10 w-64" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Research</TabsTrigger>
              <TabsTrigger value="digital-trade">Digital Trade</TabsTrigger>
              <TabsTrigger value="ai-governance">AI Governance</TabsTrigger>
              <TabsTrigger value="cyber-diplomacy">Cyber Diplomacy</TabsTrigger>
              <TabsTrigger value="youth-strategy">Youth Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {allResearch.map((item, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </CardTitle>
                      <CardDescription>
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{item.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{item.date}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </TabsContent>

            {/* Other tab contents would show filtered research by category */}
            <TabsContent value="digital-trade" className="mt-6">
              <div className="text-center py-8">
                <p className="text-gray-500">Digital Trade research items would be displayed here.</p>
              </div>
            </TabsContent>

            <TabsContent value="ai-governance" className="mt-6">
              <div className="text-center py-8">
                <p className="text-gray-500">AI Governance research items would be displayed here.</p>
              </div>
            </TabsContent>

            <TabsContent value="cyber-diplomacy" className="mt-6">
              <div className="text-center py-8">
                <p className="text-gray-500">Cyber Diplomacy research items would be displayed here.</p>
              </div>
            </TabsContent>

            <TabsContent value="youth-strategy" className="mt-6">
              <div className="text-center py-8">
                <p className="text-gray-500">Youth Strategy research items would be displayed here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Research;
