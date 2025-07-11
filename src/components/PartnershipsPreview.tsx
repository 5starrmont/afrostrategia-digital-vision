import { Card, CardContent } from "@/components/ui/card";
import africanUnionLogo from "@/assets/logos/african-union.png";
import cukLogo from "@/assets/logos/cuk.png";
import wefLogo from "@/assets/logos/wef.png";
import unecaLogo from "@/assets/logos/uneca.png";
import ituLogo from "@/assets/logos/itu.png";
import gsmaLogo from "@/assets/logos/gsma.png";
import brookingsLogo from "@/assets/logos/brookings.png";
import mozillaLogo from "@/assets/logos/mozilla.png";
import microsoftLogo from "@/assets/logos/microsoft.png";
import digitalAfricaLogo from "@/assets/logos/digital-africa.png";

export const PartnershipsPreview = () => {
  const partners = [
    {
      name: "African Union",
      type: "Continental Body",
      description: "Strategic policy alignment with AU digital transformation agenda",
      logo: africanUnionLogo
    },
    {
      name: "The Cooperative University of Kenya",
      type: "Research Partner", 
      description: "Collaborative research on emerging technologies in Africa",
      logo: cukLogo
    },
    {
      name: "World Economic Forum",
      type: "Global Platform",
      description: "Contributing to global digital governance discussions",
      logo: wefLogo
    },
    {
      name: "UNECA",
      type: "UN Agency",
      description: "Supporting digital economy initiatives across Africa",
      logo: unecaLogo
    },
    {
      name: "ITU",
      type: "UN Specialized Agency", 
      description: "International telecommunications and digital policy collaboration",
      logo: ituLogo
    },
    {
      name: "GSMA",
      type: "Industry Association",
      description: "Mobile industry insights and policy development",
      logo: gsmaLogo
    },
    {
      name: "Brookings Institution",
      type: "Think Tank",
      description: "Research collaboration on digital governance in Africa",
      logo: brookingsLogo
    },
    {
      name: "Mozilla Foundation",
      type: "Technology Partner",
      description: "Internet health and digital rights advocacy",
      logo: mozillaLogo
    },
    {
      name: "Microsoft",
      type: "Technology Partner",
      description: "Digital transformation and AI governance initiatives",
      logo: microsoftLogo
    },
    {
      name: "Digital Africa",
      type: "Regional Initiative",
      description: "Supporting African digital ecosystem development",
      logo: digitalAfricaLogo
    }
  ];

  return (
    <section id="partnerships" className="py-24 bg-gradient-to-br from-emerald-50 via-yellow-50/30 to-emerald-50 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-200/20 via-transparent to-transparent"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-6">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent mb-6">
            Strategic Partnerships
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Building meaningful collaborations with world-class institutions to amplify Africa's voice 
            in shaping the global digital governance landscape
          </p>
        </div>

        {/* Enhanced auto-sliding carousel */}
        <div className="relative">
          {/* First row - slides left to right */}
          <div className="flex animate-scroll-left mb-8 hover:pause-animation">
            {[...partners, ...partners].map((partner, index) => (
              <div key={`left-${index}`} className="flex-shrink-0 w-80 mx-4">
                <Card className="h-full bg-white/80 backdrop-blur-sm border border-emerald-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-md flex items-center justify-center p-3 group-hover:shadow-lg transition-shadow duration-300">
                        <img 
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-full h-full bg-emerald-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {partner.name}
                    </h3>
                    <div className="mb-4">
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {partner.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {partner.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Second row - slides right to left */}
          <div className="flex animate-scroll-right hover:pause-animation">
            {[...partners.slice().reverse(), ...partners.slice().reverse()].map((partner, index) => (
              <div key={`right-${index}`} className="flex-shrink-0 w-80 mx-4">
                <Card className="h-full bg-white/80 backdrop-blur-sm border border-yellow-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-md flex items-center justify-center p-3 group-hover:shadow-lg transition-shadow duration-300">
                        <img 
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-full h-full bg-yellow-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-yellow-700 transition-colors line-clamp-2">
                      {partner.name}
                    </h3>
                    <div className="mb-4">
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {partner.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                      {partner.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Enhanced gradient overlays */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-emerald-50 via-emerald-50/80 to-transparent pointer-events-none z-10"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-emerald-50 via-emerald-50/80 to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Our Growing Network</h3>
            <p className="text-gray-600 mb-8">
              Partner with AfroStrategia to shape the future of digital governance in Africa
            </p>
            <button className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-4 rounded-full font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Become a Partner
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
