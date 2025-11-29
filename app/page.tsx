"use client"

import HeroSlider from "./components/HeroSlider"
import WelcomeSection from "./components/WelcomeSection"
import EmpoweringSection from "./components/EmpoweringSection"
import GoalsSection from "./components/GoalsSection"
import HowWeWorkSection from "./components/HowWeWorkSection"
import WhySupportUsSection from "./components/WhySupportUsSection"
import TestimonialSection from "./components/TestimonialSection"

export default function Home() {
  return (
    <main>
      <HeroSlider />
      <WelcomeSection />
      <EmpoweringSection />
      <GoalsSection />
      <HowWeWorkSection />
      <WhySupportUsSection />
      <TestimonialSection />
    </main>
  )
}

