import {
  FaStore,
  FaThLarge,
  FaCalendarAlt,
  FaBoxOpen,
  FaQrcode,
  FaTruck,
  FaWrench,
  FaFileInvoiceDollar,
  FaCalculator,
  FaChartBar,
  FaShieldAlt,
} from "react-icons/fa";
import { GiGears } from "react-icons/gi";

const workflows = [
  { icon: <FaStore />, title: "Online Storefront" },
  { icon: <FaThLarge />, title: "Customer Portal" },
  { icon: <FaCalendarAlt />, title: "Booking & Scheduling" },
  { icon: <FaBoxOpen />, title: "Inventory Management" },
  { icon: <FaQrcode />, title: "Checkout & POS" },
  { icon: <FaTruck />, title: "Dispatch & Delivery" },
  { icon: <FaWrench />, title: "Service & Repair" },
  { icon: <FaFileInvoiceDollar />, title: "Invoicing & Payments" },
  { icon: <FaCalculator />, title: "Accounting" },
  { icon: <FaChartBar />, title: "Analytics & Reporting" },
  { icon: <FaShieldAlt />, title: "Rental Protection" },
];

const Workflow = () => {
  return (
    <section className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Logo (gear dhire ghore) */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0b0b0b] to-[#3b2a05] px-6 py-3 rounded-full shadow-lg">
          <GiGears
            className="text-4xl text-red-500 animate-spin"
            style={{ animationDuration: "10s" }}
          />
          <span className="text-2xl font-bold">
            <span className="text-yellow-400">Rent</span>{" "}
            <span className="text-white">Gear</span>
          </span>
        </div>

        {/* Heading */}
        <h2 className="mt-6 text-3xl md:text-4xl font-bold text-neutral-900">
          One platform. Every rental{" "}
          <span className="text-yellow-500">workflow.</span>
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-gray-600">
          Rent Gear brings every part of your rental work together, so you
          serve customers faster and grow with less effort.
        </p>

        {/* Workflow cards */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {workflows.map((item) => (
            <div
              key={item.title}
              className="group bg-white border border-yellow-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-yellow-400 hover:-translate-y-1 transition duration-300"
            >
              {/* Icon: hover korle boro hoy + golden glow */}
              <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-500 text-neutral-900 text-xl group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-yellow-400/50 transition duration-300">
                {item.icon}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-neutral-800">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;