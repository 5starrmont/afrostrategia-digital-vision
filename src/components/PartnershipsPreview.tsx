import { Card, CardContent } from "@/components/ui/card";

export const PartnershipsPreview = () => {
  const partners = [
    {
      name: "African Union",
      type: "Continental Body",
      description: "Strategic policy alignment with AU digital transformation agenda",
      logo: "https://au.int/sites/default/files/newsevents/workingdocuments/33178-wd-au_emblem.png"
    },
    {
      name: "The Cooperative University of Kenya",
      type: "Research Partner",
      description: "Collaborative research on emerging technologies in Africa",
      logo: "https://www.cuk.ac.ke/wp-content/uploads/2020/05/CUK-LOGO.png"
    },
    {
      name: "World Economic Forum",
      type: "Global Platform",
      description: "Contributing to global digital governance discussions",
      logo: "https://www.weforum.org/assets/logo/wef-logo.svg"
    },
    {
      name: "UNECA",
      type: "UN Agency",
      description: "Supporting digital economy initiatives across Africa",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg"
    },
    {
      name: "ITU",
      type: "UN Specialized Agency",
      description: "International telecommunications and digital policy collaboration",
      logo: "https://www.itu.int/en/about/PublishingImages/ITU-logo.png"
    },
    {
      name: "GSMA",
      type: "Industry Association",
      description: "Mobile industry insights and policy development",
      logo: "https://www.gsma.com/wp-content/uploads/2021/05/GSMA_Logo.png"
    },
    {
      name: "Brookings Institution",
      type: "Think Tank",
      description: "Research collaboration on digital governance in Africa",
      logo: "https://www.brookings.edu/wp-content/uploads/2019/04/brookings-logo.png"
    },
    {
      name: "Mozilla Foundation",
      type: "Technology Partner",
      description: "Internet health and digital rights advocacy",
      logo: "https://www.mozilla.org/media/img/logos/mozilla/logo-wordmark-dark.svg"
    },
    {
      name: "Microsoft",
      type: "Technology Partner",
      description: "Digital transformation and AI governance initiatives",
      logo: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b"
    },
    {
      name: "Digital Africa",
      type: "Regional Initiative",
      description: "Supporting African digital ecosystem development",
      logo: "https://www.digital-africa.co/images/logo.png"
    }
  ];

  return (
    <section id="partnerships" className="py-20 bg-emerald-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Strategic Partnerships
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Collaborating with leading institutions to amplify Africa's voice in global digital governance
          </p>
        </div>

        {/* Auto-sliding carousel */}
        <div className="relative">
          {/* First row - slides left to right */}
          <div className="flex animate-scroll-left mb-8">
            {/* Duplicate partners for seamless infinite scroll */}
            {[...partners, ...partners].map((partner, index) => (
              <div key={index} className="flex-shrink-0 w-80 mx-3">
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 bg-white hover:scale-105">
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
              </div>
            ))}
          </div>

          {/* Second row - slides right to left */}
          <div className="flex animate-scroll-right">
            {/* Reverse order and duplicate for different movement */}
            {[...partners.slice().reverse(), ...partners.slice().reverse()].map((partner, index) => (
              <div key={index} className="flex-shrink-0 w-80 mx-3">
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 bg-white hover:scale-105">
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
              </div>
            ))}
          </div>

          {/* Gradient overlays to fade edges */}
          <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-emerald-50 to-transparent pointer-events-none z-10"></div>
          <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none z-10"></div>
        </div>
      </div>
    </section>
  );
};
