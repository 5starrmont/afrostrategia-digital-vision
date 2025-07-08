
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { FocusAreas } from "@/components/FocusAreas";
import { LatestInsights } from "@/components/LatestInsights";
import { LatestContent } from "@/components/LatestContent";
import { Team } from "@/components/Team";
import { PartnershipsPreview } from "@/components/PartnershipsPreview";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <About />
      <FocusAreas />
      <LatestInsights />
      <LatestContent />
      <Team />
      <PartnershipsPreview />
      <Footer />
    </div>
  );
};

export default Index;
