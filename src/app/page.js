'use client'

import Header from '@/components/Header'
import HeroSection from '@/components/Landing/HeroSection'
import FeaturesSection from '@/components/Landing/FeaturesSection'
import TestimonialsSection from '@/components/Landing/TestimonialsSection'
import PricingSection from '@/components/Landing/PricingSection'
import FAQSection from '@/components/Landing/FAQSection'
import CTASection from '@/components/Landing/CTASection'
import Footer from '@/components/Landing/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  )
}