'use client'
import Link from "next/link";
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaInstagram, FaWrench } from "react-icons/fa";
import { GiGears } from "react-icons/gi";

const quickLinks = ["Home", "All Equipment", "About Us", "Contact Us", "How It Works"];
const categories = ["Agriculture", "Cleaning", "Electronics", "Event Equipment", "Photography"];

const socialLinks = [
          { icon: <FaFacebookF />, link: "https://facebook.com" },
          { icon: <FaYoutube />, link: "https://youtube.com" },
          { icon: <FaLinkedinIn />, link: "https://linkedin.com" },
          { icon: <FaInstagram />, link: "https://instagram.com" },
];

const Footer = () => {
          const handleSubscribe = (e) => {
                    e.preventDefault();
                    alert("Thanks for subscribing!");
                    e.target.reset();
          };

          return (
                    <footer className="text-white">
                              {/* Top curve */}
                              <svg
                                        className="block w-full h-12 sm:h-20 text-[#0b0b0b]"
                                        viewBox="0 0 1440 120"
                                        preserveAspectRatio="none"
                              >
                                        <path
                                                  fill="currentColor"
                                                  d="M0,120 L0,60 C240,0 480,0 720,40 C960,80 1200,80 1440,20 L1440,120 Z"
                                        />
                              </svg>

                              {/* Main footer (flat bottom, gradient top to bottom) */}
                              <div className="-mt-1 bg-gradient-to-b from-[#0b0b0b] via-[#1f1706] to-[#4a3506]">
                                        <div className="max-w-7xl mx-auto px-6 pt-6 pb-8">
                                                  {/* Top section */}
                                                  <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                                                            {/* Brand */}
                                                            <div>
                                                                      {/* Logo: click korle Home-e jabe */}
                                                                      <Link href="/" className="inline-flex items-center gap-2">
                                                                                <div className="relative">
                                                                                          <GiGears className="text-5xl text-red-600" />
                                                                                          <FaWrench className="absolute inset-0 m-auto text-white text-lg -rotate-45" />
                                                                                </div>
                                                                                <h2 className="text-3xl font-bold">
                                                                                          <span className="text-yellow-400">Rent</span>{" "}
                                                                                          <span className="text-white">Gear</span>
                                                                                </h2>
                                                                      </Link>

                                                                      <p className="mt-4 text-gray-300 text-sm leading-relaxed">
                                                                                Your trusted platform for renting top-quality equipment.
                                                                                Empowering your journey across Bangladesh.
                                                                      </p>

                                                                      {/* Social icons */}
                                                                      <div className="flex gap-3 mt-5">
                                                                                {socialLinks.map((item, index) => (
                                                                                          <a
                                                                                                    key={index}
                                                                                                    href={item.link}
                                                                                                    target="_blank"
                                                                                                    rel="noreferrer"
                                                                                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 text-black hover:scale-110 transition"
                                                                                          >
                                                                                                    {item.icon}
                                                                                          </a>
                                                                                ))}
                                                                      </div>
                                                            </div>

                                                            {/* Quick Links */}
                                                            <div>
                                                                      <h3 className="text-xl font-semibold text-yellow-400 mb-4">Quick Links</h3>
                                                                      <ul className="space-y-2 text-gray-300">
                                                                                {quickLinks.map((item) => (
                                                                                          <li key={item}>
                                                                                                    <a href="#" className="hover:text-yellow-400 transition">{item}</a>
                                                                                          </li>
                                                                                ))}
                                                                      </ul>
                                                            </div>

                                                            {/* Categories */}
                                                            <div>
                                                                      <h3 className="text-xl font-semibold text-yellow-400 mb-4">Categories</h3>
                                                                      <ul className="space-y-2 text-gray-300">
                                                                                {categories.map((item) => (
                                                                                          <li key={item}>
                                                                                                    <a href="#" className="hover:text-yellow-400 transition">{item}</a>
                                                                                          </li>
                                                                                ))}
                                                                      </ul>
                                                            </div>

                                                            {/* Newsletter */}
                                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                                                      <h3 className="text-xl font-semibold mb-2">Subscribe to Our Newsletter</h3>
                                                                      <p className="text-sm text-gray-400 mb-4">
                                                                                Get the latest offers and updates in your inbox.
                                                                      </p>
                                                                      <form
                                                                                onSubmit={handleSubscribe}
                                                                                className="flex items-center bg-black/40 border border-white/30 rounded-full p-1"
                                                                      >
                                                                                <input
                                                                                          type="email"
                                                                                          required
                                                                                          placeholder="Email Address"
                                                                                          className="flex-1 min-w-0 bg-transparent px-4 py-2 text-sm outline-none placeholder-gray-400"
                                                                                />
                                                                                <button
                                                                                          type="submit"
                                                                                          className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-medium px-5 py-2 rounded-full hover:opacity-90"
                                                                                >
                                                                                          Subscribe
                                                                                </button>
                                                                      </form>
                                                            </div>
                                                  </div>

                                                  {/* Bottom text */}
                                                  <div className="mt-10 pt-5 border-t border-white/20 flex flex-col sm:flex-row justify-between gap-2 text-sm text-gray-300">
                                                            <p>© 2026 Rent Gear. All Rights Reserved.</p>
                                                            <p>Developed by Rent Gear Team</p>
                                                  </div>
                                        </div>
                              </div>
                    </footer>
          );
};

export default Footer;