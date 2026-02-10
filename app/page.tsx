"use client"

import HeroSlider from "./components/HeroSlider"
import ImpactStatsSection from "./components/ImpactStatsSection"
// TODO: Re-enable when ready
// import StudentSpotlightSection from "./components/StudentSpotlightSection"
import WelcomeSection from "./components/WelcomeSection"
import EmpoweringSection from "./components/EmpoweringSection"
import GoalsSection from "./components/GoalsSection"
import HowWeWorkSection from "./components/HowWeWorkSection"
import WhySupportUsSection from "./components/WhySupportUsSection"
import GalleryPreviewSection from "./components/GalleryPreviewSection"
import MediaPreviewSection from "./components/MediaPreviewSection"
// TODO: Re-enable when ready
// import TestimonialSection from "./components/TestimonialSection"

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ImpactStatsSection />
      {/* TODO: Re-enable StudentSpotlightSection when ready */}
      <WelcomeSection />
      <EmpoweringSection />
      <GoalsSection />
      <HowWeWorkSection />
      <GalleryPreviewSection />
      <MediaPreviewSection />
      <WhySupportUsSection />
      {/* TODO: Re-enable TestimonialSection (Voices of Impact) when ready */}
    </>
  )
}

