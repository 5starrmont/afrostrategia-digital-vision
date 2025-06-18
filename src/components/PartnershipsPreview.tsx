
import { Card, CardContent } from "@/components/ui/card";

export const PartnershipsPreview = () => {
  const partners = [
    {
      name: "African Union",
      type: "Continental Body",
      description: "Strategic policy alignment with AU digital transformation agenda",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Emblem_of_the_African_Union.svg"
    },
    {
      name: "The Cooperative University of Kenya",
      type: "Research Partner",
      description: "Collaborative research on emerging technologies in Africa",
      logo: "https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=200&h=200&fit=crop&crop=center"
    },
    {
      name: "World Economic Forum",
      type: "Global Platform",
      description: "Contributing to global digital governance discussions",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/World_Economic_Forum_logo.svg"
    },
    {
      name: "UNECA",
      type: "UN Agency",
      description: "Supporting digital economy initiatives across Africa",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg"
    }
  ];

  return (
    <section id="partnerships" className="py-20 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Strategic Partnerships
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Collaborating with leading institutions to amplify Africa's voice in global digital governance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 bg-white">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to initials if logo fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-yellow-100 rounded-full hidden items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-700">
                      {partner.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{partner.name}</h3>
                <p className="text-sm text-emerald-700 font-medium mb-3">{partner.type}</p>
                <p className="text-sm text-gray-600">{partner.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
