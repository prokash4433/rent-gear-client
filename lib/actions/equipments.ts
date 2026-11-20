"use server"

import type { CreateEquipmentResult, EquipmentPayload } from "@/lib/types"

// Our Express API (rent-gear-server). BASE_URL comes from .env — it is only
// readable here because this file runs on the server ("use server").
const BASE_URL = process.env.BASE_URL || "http://localhost:5000"

/**
 * Creates one equipment listing by POSTing the form data to the API,
 * which saves it in the "equipments" collection of MongoDB.
 *
 * Returns MongoDB's insert result: { acknowledged, insertedId }.
 * Throws an error when the API cannot be reached or answers with a failure.
 */
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
