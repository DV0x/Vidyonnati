"use client"

import HeroSlider from "./components/HeroSlider"
import ImpactStatsSection from "./components/ImpactStatsSection"
import StudentSpotlightSection from "./components/StudentSpotlightSection"
import WelcomeSection from "./components/WelcomeSection"
import EmpoweringSection from "./components/EmpoweringSection"
import GoalsSection from "./components/GoalsSection"
import HowWeWorkSection from "./components/HowWeWorkSection"
import WhySupportUsSection from "./components/WhySupportUsSection"
import TestimonialSection from "./components/TestimonialSection"

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ImpactStatsSection />
      <StudentSpotlightSection />
      <WelcomeSection />
      <EmpoweringSection />
      <GoalsSection />
      <HowWeWorkSection />
      <WhySupportUsSection />
      <TestimonialSection />
    </>
  )
}

