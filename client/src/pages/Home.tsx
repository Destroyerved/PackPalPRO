import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import TrustedBy from "@/components/home/TrustedBy";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Pricing from "@/components/home/Pricing";
import Testimonials from "@/components/home/Testimonials";
import CtaSection from "@/components/home/CtaSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">
      <Header />
      <Hero />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CtaSection />
      <Footer />
    </div>
  );
}
