import { Banner } from "@/components/shared/Banner"
import FeaturedEquipmentsPage from "@/components/shared/FeaturedEquipments"
import { FeaturedEquipmentsGrid } from "@/components/shared/FeaturedEquipmentsGrid"
import PopularCategory from "@/components/shared/PopularCategory"
 
 
 
import HowItWorksPage from "@/components/shared/ItWorks"
import WayChoosePage from "@/components/shared/WayChoose"
 
import { Workflow } from "lucide-react"

// The homepage reads equipment straight from MongoDB, so it must render on
// every request instead of being frozen as static HTML at build time.
export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <>
      {/* <Navbar /> */}
      <Banner />
      <PopularCategory />
      <FeaturedEquipmentsPage />
      {/* <Workflow/> */}
      <WayChoosePage />
      <HowItWorksPage />
       
    </>
  )
}
