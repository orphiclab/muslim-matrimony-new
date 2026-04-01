import React from "react";

const CARDS = [
  {
    title: "Multi-Child Profile Management",
    description:
      "Manage multiple profiles from a single parent account with ease and complete control",
  },
  {
    title: "Smart Contact Visibility",
    description:
      "Share age, height, and location while keeping personal details private until ready",
  },
  {
    title: "Multi-Child Profile Management",
    description:
      "Secure, private messaging within the platform for safe communication",
  },
  {
    title: "Multi-Child Profile Management",
    description:
      "Customize what information is visible to others on a field-by-field basis",
  },
] as const;

const CardPattern = ({ patternId }: { patternId: string }) => (
  <div
    className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    aria-hidden
  >
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.14]"
      viewBox="0 0 480 480"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <pattern
          id={patternId}
          width="120"
          height="120"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M60 10 L75 45 L110 45 L82 68 L93 103 L60 80 L27 103 L38 68 L10 45 L45 45 Z"
            fill="none"
            stroke="white"
            strokeWidth="0.6"
          />
          <path
            d="M60 35 L68 55 L88 55 L72 68 L78 88 L60 76 L42 88 L48 68 L32 55 L52 55 Z"
            fill="none"
            stroke="white"
            strokeWidth="0.45"
          />
        </pattern>
      </defs>
      <rect width="480" height="480" fill={`url(#${patternId})`} />
    </svg>
  </div>
);

function EverythingCard({
  title,
  description,
  patternId,
}: {
  title: string;
  description: string;
  patternId: string;
}) {
  return (
    <article className="relative overflow-hidden rounded-[24px] bg-[#397466] p-8 text-left shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
      <CardPattern patternId={patternId} />
      <div className="relative z-1 flex flex-col gap-3">
        <h3 className="font-poppins font-medium leading-snug text-[#DB9D30] subtitle">
          {title}
        </h3>
        <p className="font-andada-pro leading-relaxed text-white text-[17px] sm:text-[18px] md:text-[20px] lg:text-[22px] 2xl:text-[24px]">
          {description}
        </p>
      </div>
    </article>
  );
}


export default function EverythingFourCards() {
  return (
    <div className="relative w-full">
 
      <div
        className="pointer-events-none absolute -inset-x-8 -inset-y-4 overflow-hidden rounded-[32px] opacity-[0.35]"
        aria-hidden
      >
        <div className="absolute left-1/4 top-0 h-[min(120%,420px)] w-[min(120%,420px)] -translate-x-1/2 rounded-full border border-[#010806]/6" />
        <div className="absolute bottom-0 right-1/4 h-[min(100%,360px)] w-[min(100%,360px)] translate-x-1/3 rounded-full border border-[#010806]/5" />
      </div>

      <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 md:gap-7">
        {CARDS.map((card, index) => (
          <EverythingCard
            key={`${card.title}-${index}`}
            title={card.title}
            description={card.description}
            patternId={`everything-card-geo-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
