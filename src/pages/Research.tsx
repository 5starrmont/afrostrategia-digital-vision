
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Calendar, User, Download, Search } from "lucide-react";

const Research = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const researchPapers = [
    {
      title: "Digital Financial Inclusion: Africa's Leap Forward",
      description: "Comprehensive analysis of mobile money adoption rates and policy frameworks driving financial inclusion across African markets, with case studies from Kenya, Ghana, and Nigeria.",
      author: "Dr. Amina Kone",
      date: "March 15, 2024",
      category: "FinTech",
      readTime: "8 min read",
      featured: true,
      downloadUrl: "#"
    },
    {
      title: "AI Ethics Framework for African Development",
      description: "Proposing culturally-informed AI governance principles that balance innovation with traditional African values and community-centered approaches to technology.",
      author: "Prof. Kwame Asante",
      date: "March 10, 2024",
      category: "AI Governance",
      readTime: "12 min read",
      featured: true,
      downloadUrl: "#"
    },
    {
      title: "Youth Digital Rights in the Age of Surveillance",
      description: "Examining privacy concerns and digital rights protection for African youth in an increasingly connected world, with focus on data protection legislation.",
      author: "Dr. Fatima Okafor",
      date: "March 5, 2024",
      category: "Digital Rights",
      readTime: "6 min read",
      featured: false,
      downloadUrl: "#"
    },
    {
      title: "Cross-Border Digital Trade Regulations in ECOWAS",
      description: "Policy recommendations for harmonizing digital trade regulations across West African Economic and Monetary Union member states.",
      author: "Dr. Zara Hassan",
      date: "February 28, 2024",
      category: "Digital Trade",
      readTime: "10 min read",
      featured: false,
      downloadUrl: "#"
    },
    {
      title: "Cyber Diplomacy and Continental Data Governance",
      description: "Strategic framework for African Union digital sovereignty initiatives and international cyber diplomacy engagement strategies.",
      author: "Dr. Kofi Mensah",
      date: "February 20, 2024",
      category: "Cyber Diplomacy",
      readTime: "15 min read",
      featured: false,
      downloadUrl: "#"
    },
    {
      title: "Blockchain for Agricultural Finance in Rural Africa",
      description: "Innovative blockchain applications for smallholder farmer financing and supply chain transparency in agricultural markets.",
      author: "Dr. Chidi Okonkwo",
      date: "February 15, 2024",
      category: "FinTech",
      readTime: "9 min read",
      featured: false,
      downloadUrl: "#"
    },
    {
      title: "Artificial Intelligence in African Healthcare Systems",
      description: "Ethical considerations and policy frameworks for AI implementation in healthcare delivery across resource-constrained settings.",
      author: "Prof. Kwame Asante",
      date: "February 10, 2024",
      category: "AI Governance",
      readTime: "11 min read",
      featured: false,
      downloadUrl: "#"
    },
    {
      title: "Digital Identity Solutions for Continental Integration",
      description: "Comparative analysis of digital identity systems and their role in facilitating African Continental Free Trade Area implementation.",
      author: "Dr. Amina Kone",
      date: "February 5, 2024",
      category: "Digital Trade",
      readTime: "7 min read",
      featured: false,
      downloadUrl: "#"
    }
  ];

  const categories = ["all", "FinTech", "AI Governance", "Digital Rights", "Digital Trade", "Cyber Diplomacy"];

  const filteredPapers = researchPapers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || paper.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPapers = filteredPapers.slice(startIndex, startIndex + itemsPerPage);

  const getCategoryColor = (category: string) => {
    const colors = {
      "FinTech": "bg-green-100 text-green-700",
      "AI Governance": "bg-yellow-100 text-yellow-700",
      "Digital Rights": "bg-blue-100 text-blue-700",
      "Digital Trade": "bg-emerald-100 text-emerald-700",
      "Cyber Diplomacy": "bg-purple-100 text-purple-700"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-yellow-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Research & Policy Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Evidence-based research shaping Africa's digital transformation policy landscape
            </p>
          </div>
        </div>
      </section>

      {/* Featured Research */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Research</h2>
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {researchPapers.filter(paper => paper.featured).map((paper, index) => (
              <Card key={index} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getCategoryColor(paper.category)}>
                      {paper.category}
                    </Badge>
                    <span className="text-sm text-gray-500">{paper.readTime}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-emerald-700 transition-colors">
                    {paper.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {paper.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{paper.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{paper.date}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      <Download className="h-4 w-4 mr-1" />
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
            <h2 className="text-2xl font-bold text-gray-900">Research Library</h2>
            <div className="text-sm text-gray-600">
              {filteredPapers.length} research papers found
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search research papers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Research Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentPapers.map((paper, index) => (
              <Card key={index} className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getCategoryColor(paper.category)}>
                      {paper.category}
                    </Badge>
                    <span className="text-sm text-gray-500">{paper.readTime}</span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-emerald-700 transition-colors">
                    {paper.title}
                  </CardTitle>
                  <CardDescription>
                    {paper.description.length > 120 ? 
                      `${paper.description.substring(0, 120)}...` : 
                      paper.description
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{paper.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{paper.date}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-emerald-700 hover:bg-emerald-800" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Research;
