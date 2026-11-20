
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export const getEquipments = async () =>{
          const res = await fetch(`${BASE_URL}/equipments`, { cache: "no-store" });
          return res.json();
}