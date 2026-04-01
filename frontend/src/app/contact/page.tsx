import ContactHero from '@/components/contact/hero'
import ContactInfoSection from '@/components/contact/email'
import ContactFormSection from '@/components/contact/form'
import React from 'react'
import ReadySection from '@/components/home/ready/ready'

function ContactPage() {
  return (
    <div>
        <ContactHero />
        <ContactInfoSection />
        <div data-aos="fade-up" data-aos-delay="100" data-aos-duration="2000">
        <ContactFormSection />
        </div>
        <ReadySection />        
    </div>
  )
}

export default ContactPage