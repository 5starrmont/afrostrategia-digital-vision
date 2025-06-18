
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Twitter, Mail } from "lucide-react";

export const Team = () => {
  const teamMembers = [
    {
      name: "Dr. Amina Kone",
      role: "Executive Director",
      department: "Leadership",
      bio: "Former AU Digital Transformation Advisor with 15+ years in fintech policy development across West Africa.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face",
      social: { linkedin: "#", twitter: "#", email: "amina@afrostrategia.org" }
    },
    {
      name: "Prof. Kwame Asante",
      role: "Director of AI Governance",
      department: "AI Ethics",
      bio: "Leading AI ethics researcher and former MIT Technology Policy Fellow specializing in algorithmic accountability.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      social: { linkedin: "#", twitter: "#", email: "kwame@afrostrategia.org" }
    },
    {
      name: "Dr. Fatima Okafor",
      role: "Director of Youth Strategy",
      department: "Digital Rights",
      bio: "Digital rights advocate and former UN Youth Envoy focused on online safety and digital literacy programs.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=300&h=300&fit=crop&crop=face",
      social: { linkedin: "#", twitter: "#", email: "fatima@afrostrategia.org" }
    },
    {
      name: "Dr. Kofi Mensah",
      role: "Director of Cyber Diplomacy",
      department: "Digital Sovereignty",
      bio: "Former African Union Commission cybersecurity advisor with expertise in international digital governance frameworks.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      social: { linkedin: "#", twitter: "#", email: "kofi@afrostrategia.org" }
    },
    {
      name: "Dr. Zara Hassan",
      role: "Director of Digital Trade",
      department: "FinTech",
      bio: "International trade economist specializing in digital commerce regulations and cross-border payment systems.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      social: { linkedin: "#", twitter: "#", email: "zara@afrostrategia.org" }
    },
    {
      name: "Dr. Chidi Okonkwo",
      role: "Research Director",
      department: "Policy Analysis",
      bio: "Seasoned policy researcher with expertise in continental governance frameworks and digital transformation strategies.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
      social: { linkedin: "#", twitter: "#", email: "chidi@afrostrategia.org" }
    }
  ];

  const getDepartmentColor = (department: string) => {
    const colors = {
      "Leadership": "bg-purple-100 text-purple-700",
      "AI Ethics": "bg-yellow-100 text-yellow-700",
      "Digital Rights": "bg-blue-100 text-blue-700",
      "Digital Sovereignty": "bg-emerald-100 text-emerald-700",
      "FinTech": "bg-green-100 text-green-700",
      "Policy Analysis": "bg-gray-100 text-gray-700"
    };
    return colors[department as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  return (
    <section id="team" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Strategic Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Distinguished experts, researchers, and policy advocates driving Africa's digital transformation agenda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <Badge className={`${getDepartmentColor(member.department)} mb-2`}>
                    {member.department}
                  </Badge>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-emerald-700 font-medium mb-3">{member.role}</p>
                </div>
                <p className="text-sm text-gray-600 mb-4 text-center">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  <a 
                    href={member.social.linkedin} 
                    className="p-2 rounded-full bg-gray-100 hover:bg-emerald-100 transition-colors"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <Linkedin className="h-4 w-4 text-gray-600 hover:text-emerald-700" />
                  </a>
                  <a 
                    href={member.social.twitter} 
                    className="p-2 rounded-full bg-gray-100 hover:bg-emerald-100 transition-colors"
                    aria-label={`${member.name} Twitter`}
                  >
                    <Twitter className="h-4 w-4 text-gray-600 hover:text-emerald-700" />
                  </a>
                  <a 
                    href={`mailto:${member.social.email}`} 
                    className="p-2 rounded-full bg-gray-100 hover:bg-emerald-100 transition-colors"
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail className="h-4 w-4 text-gray-600 hover:text-emerald-700" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
