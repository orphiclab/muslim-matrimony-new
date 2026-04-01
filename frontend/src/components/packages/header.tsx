 "use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

const AboutHeader = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!headingRef.current) return;

    const split = SplitText.create(headingRef.current, {
      type: "words",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.words, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            once: true,
          },
        });
      },
    });

    return () => split.revert();
  }, { scope: headingRef });

  return (
    <section className="relative w-full bg-[#085140] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/about/abtheader.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        {/* dark teal overlay so text stays readable */}
        {/* <div className="absolute inset-0 bg-[#0D3B2E]/90" /> */}
      </div>

      {/* Content */}
      <div className="relative z-10 containerpadding container mx-auto flex min-h-[500px] sm:min-h-[600px] md:min-h-[500px] lg:min-h-[600px] flex-col items-center justify-center gap-5  text-center margin-y">
        {/* Eyebrow */}
        <p className="font-andada-pro title-sub-top font-light text-white ">
        Follow a trusted path built on faith, privacy, and family values.
        </p>

        {/* Heading */}
        <h1 ref={headingRef} className="title font-poppins font-medium text-white leading-tight max-w-4xl">
        Choose a plan that fits
          <br />
          Your{" "}
          <span className="font-aref-ruqaa-ink font-bold text-[#DB9D30]">
            Journey
          </span>
        </h1>

        {/* Description */}
        <p className="paragraph font-poppins text-white  max-w-4xl">
        Explore our carefully designed packages that offer the right balance of privacy, support, and visibility to help you find your ideal life partner with confidence.
        </p>
      </div>
    </section>
  );
};

export default AboutHeader;
