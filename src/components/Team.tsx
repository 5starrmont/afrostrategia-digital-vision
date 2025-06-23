
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Twitter, Mail } from "lucide-react";

export const Team = () => {
  const teamMembers = [
    {
      name: "Ian Obwoge",
      role: "Founding Strategic Envoy & Executive Director",
      department: "Leadership",
      bio: "Chair of Strategic Inquiry and Global Affairs, leading Digital Trade & FinTech Access research and co-leading Finance & Operations.",
      social: { linkedin: "#", twitter: "#", email: "ian@afrostrategia.org" }
    },
    {
      name: "Brian Koech",
      role: "Department Lead",
      department: "Afro-Sovereignty & Cyber Diplomacy",
      bio: "Leading initiatives in digital sovereignty and cyber diplomacy frameworks for continental security and autonomy.",
      social: { linkedin: "#", twitter: "#", email: "brian@afrostrategia.org" }
    },
    {
      name: "Eric Nyaosi",
      role: "Department Lead",
      department: "AI Governance, Ethics & Innovation",
      bio: "Driving AI governance frameworks, ethical standards, and innovation policies for responsible AI development in Africa.",
      social: { linkedin: "#", twitter: "#", email: "eric@afrostrategia.org" }
    },
    {
      name: "Collins Momanyi",
      role: "Department Lead",
      department: "Youth Strategy & Digital Rights",
      bio: "Championing youth empowerment and digital rights advocacy to ensure inclusive digital transformation across Africa.",
      social: { linkedin: "#", twitter: "#", email: "collins@afrostrategia.org" }
    }
  ];

  const getDepartmentColor = (department: string) => {
    const colors = {
      "Leadership": "bg-purple-100 text-purple-700",
      "Afro-Sovereignty & Cyber Diplomacy": "bg-emerald-100 text-emerald-700",
      "AI Governance, Ethics & Innovation": "bg-yellow-100 text-yellow-700",
      "Youth Strategy & Digital Rights": "bg-blue-100 text-blue-700"
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Badge className={`${getDepartmentColor(member.department)} mb-3`}>
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
