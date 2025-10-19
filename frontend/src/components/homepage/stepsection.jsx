import React from "react";
import step1 from "../../assets/step1.svg";
import step2 from "../../assets/step2.svg";
import step3 from "../../assets/step3.svg";
import step4 from "../../assets/step4.svg";

const StepsSection = () => {
  const steps = [
    {
      id: 1,
      title: "Step 1 — Create Account",
      desc: "Sign up for free and set up your profile to start simplifying medical texts.",
      icon: step1,
    },
    {
      id: 2,
      title: "Step 2 — Upload Text",
      desc: "Paste or upload your document to let the AI analyze medical terms.",
      icon: step2,
    },
    {
      id: 3,
      title: "Step 3 — Simplify",
      desc: "The system will automatically simplify medical jargon into plain language.",
      icon: step3,
    },
    {
      id: 4,
      title: "Step 4 — Review & Save",
      desc: "Review the simplified text and download or share it instantly.",
      icon: step4,
    },
  ];

  return (
    <section id="browse-section" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Steps to Get Started
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Follow these simple steps to use the platform
          </p>
        </div>

        {/* GRID */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ id, title, desc, icon }) => (
            <div key={id} className="pt-6">
              <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 hover:shadow-lg transition transform hover:-translate-y-1 duration-200">
                <div className="-mt-6 flex flex-col items-center text-center">
                  {/* CIRCLE ICON */}
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-400 shadow-md mb-4">
                    <img
                      src={icon}
                      alt={`Step ${id} icon`}
                      className="h-10 w-10"
                    />
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-4 text-base text-gray-500">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
