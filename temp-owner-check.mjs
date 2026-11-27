// One-off: what owner fields do equipment docs carry? (explains "Unknown owner")
import { MongoClient } from "mongodb"
import { readFileSync } from "node:fs"

const envLine = readFileSync(".env", "utf8")
  .split(/\r?\n/)
  .find((l) => l.startsWith("BETTER_AUTH_DB_URI="))
const uri = envLine.slice("BETTER_AUTH_DB_URI=".length).split(" #")[0].trim()

const client = new MongoClient(uri)
await client.connect()
const eq = client.db("rent-gear").collection("equipments")

const total = await eq.countDocuments()
const withOwnerEmail = await eq.countDocuments({ ownerEmail: { $exists: true, $ne: "" } })
const withOwnerId = await eq.countDocuments({ ownerId: { $exists: true, $ne: "" } })
const withOwnerName = await eq.countDocuments({ ownerName: { $exists: true, $ne: "" } })
console.log(`total:${total} ownerEmail:${withOwnerEmail} ownerId:${withOwnerId} ownerName:${withOwnerName}`)

const missing = await eq.find({ $or: [{ ownerEmail: { $exists: false } }, { ownerEmail: "" }] }).limit(3).toArray()
for (const d of missing) {
  console.log("MISSING ownerEmail ->", d.name, "| keys:", Object.keys(d).join(","))
}
const present = await eq.find({ ownerEmail: { $exists: true, $ne: "" } }).limit(2).toArray()
for (const d of present) console.log("HAS ownerEmail ->", d.name, "=", d.ownerEmail, "| ownerId:", d.ownerId ?? "(none)")

await client.close()
