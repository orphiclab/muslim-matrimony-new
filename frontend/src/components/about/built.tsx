import React from "react";
import Image from "next/image";

const BuiltSection = () => {
  return (
    <section className="w-full bg-white margin-y">
      <div className="containerpadding container mx-auto flex flex-col items-center text-center gap-5">
        <Image
          src="/images/your-journey/top.png"
          alt=""
          width={70}
          height={70}
          className="object-contain"
        />

        <h2 className="title font-poppins font-medium text-[#010806] leading-tight max-w-7xl">
          Built on Faith, Trust &amp;{" "}
          <span className="font-aref-ruqaa-ink font-bold text-[#DB9D30]">
            Purpose
          </span>
        </h2>

        <p className="subtitle text-center font-poppins text-[#4B5563] leading-relaxed ">
          Muslim Metromony New is a trusted matrimonial platform created to support
          families in finding meaningful and halal life partners. Built on the
          values of faith, privacy, and respect, our system offers a secure and
          guided experience where compatibility, family involvement, and sincere
          intentions come together—helping you move towards a blessed and
          lasting union.
        </p>
      </div>
    </section>
  );
};

export default BuiltSection;
