import React from "react";
import heroimage from "../../assets/heroimg.svg";

const HeroSection = () => {
  const handleScroll = () => {
    const nextSection = document.getElementById("browse-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative max-w-7xl mx-auto flex flex-col items-center px-6 lg:flex-row lg:items-center lg:min-h-screen pt-10">
      {/* LEFT CONTENT */}
      <div className="w-full lg:w-1/2 text-center lg:text-left mt-10 lg:mt-0 z-10">
        <h1 className="font-lexend text-3xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Simplify Complex
        </h1>
        <h1 className="font-lexend text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Medical Texts
        </h1>

        <p className="font-sans mt-5 text-gray-600 text-base sm:text-lg md:text-xl max-w-lg mx-auto lg:mx-0">
          Transform complicated medical jargon into clear, patient-friendly
          language with just one click.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3">
          <a
            href="/login"
            className="flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
          >
            Get started
          </a>
          <button
            onClick={handleScroll}
            className="flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
          >
            Browse ↓
          </button>
        </div>
      </div>

      {/* RIGHT IMAGE — top part visible on mobile */}
      <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-10 lg:mt-0 order-2 lg:order-2 overflow-hidden h-64 sm:h-96 lg:h-auto">
        <img
          src={heroimage}
          alt="Hero Illustration"
          className="w-full h-full object-cover object-top lg:object-contain lg:max-w-lg"
        />
      </div>
    </section>
  );
};

export default HeroSection;
