import React from "react";
import { ShieldCheck, Globe, Lock, BadgeCheck } from "lucide-react";

const CARDS = [
  {
    icon: BadgeCheck ,
    title: "Verified Profiles",
    description: "Every profile is carefully reviewed to ensure authenticity.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with Muslim profiles from around the world.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description: "Full control over your personal information and visibility.",
  },
  {
    icon: Lock,
    title: "Secure Connect",
    description: "Safe and respectful interaction within the platform.",
  },
] as const;

function WhyCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[25px]">
      {/* Card background SVG */}
      <img
        src="/images/about/why.svg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-8 text-center">
        {/* Icon box */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon className="h-7 w-7 lg:h-8 lg:w-8 text-[#DB9D30]" />
        </div>

        <h3 className="font-poppins subtitle font-medium text-white ">
          {title}
        </h3>

        <p className="font-andada-pro paragraph text-white ">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function AboutFourCards() {
  return (
    <div className="containerpadding container mx-auto">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 sm:gap-6">
        {CARDS.map((card) => (
          <WhyCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    </div>
  );
}
