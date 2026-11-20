"use server"

import type { CreateEquipmentResult, EquipmentPayload } from "@/lib/types"

 
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

 
export const createEquipment = async (
  data: EquipmentPayload
): Promise<CreateEquipmentResult> => {
  const res = await fetch(`${BASE_URL}/equipments`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error(`Equipment API returned ${res.status}`)
  }

  return res.json()
}

export const deleteEquipment = async (equipmentId: string) =>{
  const res = await fetch(`${BASE_URL}/equipments/${equipmentId}`,{
    method:'DELETE'
  });
  return res.json();
}
