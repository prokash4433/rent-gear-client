import { Banner } from "@/components/shared/Banner"
import FeaturedEquipmentsPage from "@/components/shared/FeaturedEquipments"
import { FeaturedEquipmentsGrid } from "@/components/shared/FeaturedEquipmentsGrid"
 
 
 
import HowItWorksPage from "@/components/shared/ItWorks"
import WayChoosePage from "@/components/shared/WayChoose"
 
import { Workflow } from "lucide-react"

export default function Page() {
  return (
    <>
      {/* <Navbar /> */}
      <Banner />
      <FeaturedEquipmentsPage />
      {/* <Workflow/> */}
      <WayChoosePage />
      <HowItWorksPage />
       
    </>
  )
}
