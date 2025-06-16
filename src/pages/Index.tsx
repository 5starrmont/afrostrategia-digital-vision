
import { Hero } from "@/components/Hero";
import { FocusAreas } from "@/components/FocusAreas";
import { LatestInsights } from "@/components/LatestInsights";
import { PartnershipsPreview } from "@/components/PartnershipsPreview";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <FocusAreas />
      <LatestInsights />
      <PartnershipsPreview />
      <Footer />
    </div>
  );
};

export default Index;
