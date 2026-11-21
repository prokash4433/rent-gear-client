import Link from "next/link";
import {
          FaSearch,
          FaRegCalendarAlt,
          FaCreditCard,
          FaCheckCircle,
          FaRocket,
          FaArrowRight,
} from "react-icons/fa";

const steps = [
          { icon: <FaSearch />, title: "1. Search", text: "Find your desired equipment" },
          { icon: <FaRegCalendarAlt />, title: "2. Book", text: "Choose dates & confirm booking" },
          { icon: <FaCreditCard />, title: "3. Pay", text: "Complete payment securely" },
          { icon: <FaCheckCircle />, title: "4. Enjoy", text: "Get your equipment and get started" },
];

const HowItWorksPage = () => {
          return (
                    <section className="bg-[#fffaf0] py-14">
                              <div className="max-w-7xl mx-auto px-6">
                                        {/* Heading */}
                                        <div className="text-center">
                                                  <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
                                                            How It <span className="text-yellow-500">Works</span>
                                                  </h2>
                                                  <p className="mt-2 text-gray-600">Get started in just a few simple steps</p>
                                        </div>

                                        {/* Steps + Image */}
                                        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
                                                  {/* Steps */}
                                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                            {steps.map((step) => (
                                                                      <div
                                                                                key={step.title}
                                                                                className="bg-white border border-yellow-200 rounded-2xl p-5 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
                                                                      >
                                                                                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-neutral-900 text-lg">
                                                                                          {step.icon}
                                                                                </div>
                                                                                <h3 className="mt-4 font-semibold text-neutral-900">{step.title}</h3>
                                                                                <p className="mt-1 text-xs text-gray-500">{step.text}</p>
                                                                      </div>
                                                            ))}
                                                  </div>

                                                  {/* Image card (gradient thakbe image load na hole-o) */}
                                                  <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-[#0b0b0b] to-[#4a3506]">
                                                            <img
                                                                      src="/how-it-works.jpg"
                                                                      alt="Rent Gear"
                                                                      className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                                            <h3 className="absolute bottom-5 left-5 right-5 text-xl font-bold text-white">
                                                                      Make Your Work Easier with <span className="text-yellow-400">Rent Gear</span>
                                                            </h3>
                                                  </div>
                                        </div>

                                        {/* CTA banner */}
                                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-5 rounded-2xl px-6 py-6 bg-gradient-to-r from-[#0b0b0b] via-[#1f1706] to-[#4a3506] shadow-xl">
                                                  <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-500 text-neutral-900 text-xl">
                                                                      <FaRocket />
                                                            </div>
                                                            <div>
                                                                      <h3 className="text-xl md:text-2xl font-bold text-white">
                                                                                Ready to Rent? Let&apos;s Get Started!
                                                                      </h3>
                                                                      <p className="text-sm text-gray-300">
                                                                                Find the perfect equipment for your next project.
                                                                      </p>
                                                            </div>
                                                  </div>

                                                  <Link
                                                            href="/browse-equipments"
                                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-300 to-yellow-500 text-neutral-900 font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
                                                  >
                                                            Browse Equipment <FaArrowRight className="text-sm" />
                                                  </Link>
                                        </div>
                              </div>
                    </section>
          );
};

export default HowItWorksPage;