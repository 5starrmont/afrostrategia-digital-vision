
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from "lucide-react";

export const LatestInsights = () => {
  const insights = [
    {
      title: "Digital Financial Inclusion: Africa's Leap Forward",
      description: "Analysis of mobile money adoption rates and policy frameworks driving financial inclusion across African markets.",
      author: "Dr. Amina Kone",
      date: "March 15, 2024",
      category: "FinTech",
      readTime: "8 min read",
      featured: true
    },
    {
      title: "AI Ethics Framework for African Development",
      description: "Proposing culturally-informed AI governance principles that balance innovation with traditional African values.",
      author: "Prof. Kwame Asante",
      date: "March 10, 2024",
      category: "AI Governance",
      readTime: "12 min read",
      featured: false
    },
    {
      title: "Youth Digital Rights in the Age of Surveillance",
      description: "Examining privacy concerns and digital rights protection for African youth in an increasingly connected world.",
      author: "Dr. Fatima Okafor",
      date: "March 5, 2024",
      category: "Digital Rights",
      readTime: "6 min read",
      featured: false
    }
  ];

  return (
    <section id="research" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Latest Policy Insights
            </h2>
            <p className="text-xl text-gray-600">
              Research-driven analysis shaping Africa's digital policy landscape
            </p>
          </div>
          <Button variant="outline" className="hidden sm:flex border-emerald-700 text-emerald-700 hover:bg-emerald-50">
            View All Research
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {insights.map((insight, index) => (
            <Card key={index} className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${insight.featured ? 'lg:col-span-2 lg:row-span-1' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-emerald-700 bg-emerald-100">
                    {insight.category}
                  </Badge>
                  <span className="text-sm text-gray-500">{insight.readTime}</span>
                </div>
                <CardTitle className={`group-hover:text-emerald-700 transition-colors ${insight.featured ? 'text-2xl' : 'text-lg'}`}>
                  {insight.title}
                </CardTitle>
                <CardDescription className={insight.featured ? 'text-base' : 'text-sm'}>
                  {insight.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{insight.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{insight.date}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 sm:hidden">
          <Button variant="outline" className="border-emerald-700 text-emerald-700 hover:bg-emerald-50">
            View All Research
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
