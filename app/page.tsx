// A Server Component that composes Client Components. Every section below
// carries its own "use client", so nothing here needs to — and dropping it is
// what lets the route contribute real HTML rather than an empty shell.
//
// No metadata export: the root layout's defaults describe the homepage exactly,
// and re-stating them here would be two places to keep in sync.

import HeroSlider from "./components/HeroSlider"
import ImpactStatsSection from "./components/ImpactStatsSection"
// TODO: Re-enable when ready
// import StudentSpotlightSection from "./components/StudentSpotlightSection"
import WelcomeSection from "./components/WelcomeSection"
import EmpoweringSection from "./components/EmpoweringSection"
import GoalsSection from "./components/GoalsSection"
import HowWeWorkSection from "./components/HowWeWorkSection"
import ScholarsPreviewSection from "./components/ScholarsPreviewSection"
import WhySupportUsSection from "./components/WhySupportUsSection"
import GalleryPreviewSection from "./components/GalleryPreviewSection"
import MediaPreviewSection from "./components/MediaPreviewSection"
import TestimonialVideoSection from "./components/TestimonialVideoSection"
// TODO: Re-enable when ready
// import TestimonialSection from "./components/TestimonialSection"

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ImpactStatsSection />
      <ScholarsPreviewSection />
      {/* TODO: Re-enable StudentSpotlightSection when ready */}
      <WelcomeSection />
      <EmpoweringSection />
      <GoalsSection />
      <HowWeWorkSection />
      <GalleryPreviewSection />
      <MediaPreviewSection />
      <TestimonialVideoSection />
      <WhySupportUsSection />
      {/* TODO: Re-enable TestimonialSection (Voices of Impact) when ready */}
    </>
  )
}

