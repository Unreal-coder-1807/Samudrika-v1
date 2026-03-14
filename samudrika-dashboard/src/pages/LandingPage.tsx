import { useEffect } from 'react'
import { ArchSection } from '../components/landing/ArchSection'
import { CTASection } from '../components/landing/CTASection'
import { FeaturesSection } from '../components/landing/FeaturesSection'
import { HeroSection } from '../components/landing/HeroSection'
import { LandingFooter } from '../components/landing/LandingFooter'
import { LandingNav } from '../components/landing/LandingNav'
import { NewsSection } from '../components/landing/NewsSection'
import { PipelineSection } from '../components/landing/PipelineSection'
import { StatsBar } from '../components/landing/StatsBar'
import '../styles/landing.css'

const LandingPage = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing-page">
      <LandingNav />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <PipelineSection />
      <ArchSection />
      <NewsSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}

export default LandingPage
