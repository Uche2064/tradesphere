import ScrollToTopButton from "@/components/shared/ScrollToTopButton";
import Cta from "@/features/landing/components/Cta";
import Features from "@/features/landing/components/Features";
import Footer from "@/features/landing/components/Footer";
import HeroSection from "@/features/landing/components/Hero";
import Navbar from "@/features/landing/components/Navbar";
import ProductShowcase from "@/features/landing/components/ProductShowcase";
import Reasons from "@/features/landing/components/Reason";
import Security from "@/features/landing/components/Security";
import UseCases from "@/features/landing/components/UseCases";
import ContactForm from "@/features/landing/forms/ContactForm";
import ContactMeForm from "@/features/landing/forms/ContactForm";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Why TradeSphere */}
      <Reasons />

      {/* Features */}
      <Features />
      {/* Product Showcase */}
      <ProductShowcase />

      {/* Use Cases */}
      <UseCases />

      {/* Security */}
      <Security />

      {/* Final CTA */}
      <Cta />

      {/* Contact Me */} 
      <ContactForm />

      {/* Footer */}
      <Footer />

      {/* un boutton up pour permettre aux utilisateurs de remonter la page */}
      <ScrollToTopButton />
    </div>
  );
}
