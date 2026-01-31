import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { PainPoints } from "@/components/landing/PainPoints";
import { Promise } from "@/components/landing/Promise";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SocialProof } from "@/components/landing/SocialProof";
import { LowRisk } from "@/components/landing/LowRisk";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-16">
        <Hero />
        <PainPoints />
        <Promise />
        <HowItWorks />
        <SocialProof />
        <LowRisk />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
