import React from 'react'
import PackagesHeader from '@/components/packages/header'
import PricingCards from '@/components/packages/priceCard'
import FaqSection from '@/components/packages/faq'
import PlanSection from '@/components/packages/plan'


function packages() {
  return (
    <div>
        <PackagesHeader />
        <PricingCards />
        <div data-aos="fade-up" data-aos-delay="100" data-aos-duration="2000">
        <FaqSection />
        </div>
        <PlanSection />     
    </div>
  )
}

export default packages