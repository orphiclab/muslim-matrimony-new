import React from 'react'
import AboutHeader from '@/components/about/header'
import BuiltSection from '@/components/about/built'
import MissionSection from '@/components/about/mission'
import WhyChooseSection from '@/components/about/why'
import ReadySection from '@/components/home/ready/ready'

function page() {
  return (
    <main>
      <AboutHeader />
      <div data-aos="fade-up" data-aos-delay="100" data-aos-duration="2000">
      <BuiltSection />
      <MissionSection />
      </div>
      <div data-aos="fade-up" data-aos-delay="100" data-aos-duration="2000">
      <WhyChooseSection />
      </div>
      <ReadySection />
    </main>
  )
}

export default page