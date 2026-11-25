import { readFileSync } from "node:fs"
import { MongoClient } from "mongodb"

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const client = new MongoClient(env.BETTER_AUTH_DB_URI)
await client.connect()
const db = client.db("rent-gear")

const eqs = await db
  .collection("equipments")
  .find({ ownerEmail: "owner@gmail.com" })
  .toArray()
for (const e of eqs) {
  console.log(
    JSON.stringify({
      name: e.name,
      imageUrls: e.imageUrls,
      imageUrlsType: Array.isArray(e.imageUrls) ? "array" : typeof e.imageUrls,
      status: e.status,
      rentalPrice: e.rentalPrice,
      quantity: e.quantity,
    })
  )
}

await client.close()
