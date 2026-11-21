import Link from "next/link";
import {
          FaTags,
          FaUserCheck,
          FaCalendarCheck,
          FaLock,
          FaArrowRight,
} from "react-icons/fa";

const features = [
          {
                    icon: <FaTags />,
                    title: "Affordable Prices",
                    text: "Rent top equipment at a fair price.",
          },
          {
                    icon: <FaUserCheck />,
                    title: "Verified Owners",
                    text: "Every owner is checked for trust.",
          },
          {
                    icon: <FaCalendarCheck />,
                    title: "Flexible Rental Period",
                    text: "Rent for a day, a week or longer.",
          },
          {
                    icon: <FaLock />,
                    title: "Secure Payments",
                    text: "Your payment is safe and protected.",
          },
];

const WayChoosePage = () => {
          return (
                    <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 py-16">
                              {/* Soft golden glow circles (decoration) */}
                              <div className="absolute -top-20 -left-20 w-72 h-72 bg-yellow-300/30 rounded-full blur-3xl" />
                              <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-amber-400/30 rounded-full blur-3xl" />

                              <div className="relative max-w-7xl mx-auto px-6 grid gap-12 lg:grid-cols-[1fr_1.6fr] items-center">
                                        {/* Left side: text */}
                                        <div>
                                                  <span className="inline-block bg-neutral-900 text-yellow-400 text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full">
                                                            Why Rent Gear
                                                  </span>

                                                  <h2 className="mt-4 text-3xl md:text-5xl font-bold text-neutral-900 leading-tight">
                                                            Why Choose{" "}
                                                            <span className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                                                                      Us?
                                                            </span>
                                                  </h2>

                                                  <p className="mt-4 text-gray-600 leading-relaxed">
                                                            We provide reliable, affordable and hassle-free rental services for
                                                            everyone.
                                                  </p>

                                                  <Link
                                                            href="/browse-equipments"
                                                            className="inline-flex items-center gap-2 mt-7 bg-gradient-to-r from-[#0b0b0b] to-[#3b2a05] text-yellow-400 font-medium px-7 py-3 rounded-xl shadow-lg hover:shadow-xl transition"
                                                  >
                                                            Learn More <FaArrowRight className="text-sm" />
                                                  </Link>
                                        </div>

                                        {/* Right side: feature cards */}
                                        <div className="grid sm:grid-cols-2 gap-5">
                                                  {features.map((item) => (
                                                            <div
                                                                      key={item.title}
                                                                      className="group bg-white/80 backdrop-blur border border-yellow-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-yellow-400 hover:-translate-y-1 transition"
                                                            >
                                                                      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-500 text-neutral-900 text-2xl shadow-md">
                                                                                {item.icon}
                                                                      </div>
                                                                      <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                                                                                {item.title}
                                                                      </h3>
                                                                      <p className="mt-1 text-sm text-gray-600">{item.text}</p>
                                                            </div>
                                                  ))}
                                        </div>
                              </div>
                    </section>
          );
};

export default WayChoosePage;