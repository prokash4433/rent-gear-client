import { MongoClient, ObjectId } from "mongodb"

const client = new MongoClient(process.env.BETTER_AUTH_DB_URI)
await client.connect()
const db = client.db("rent-gear")

const bookings = await db
  .collection("bookings")
  .find({})
  .project({ userEmail: 1, equipmentId: 1, equipmentName: 1, paymentStatus: 1, status: 1 })
  .toArray()
console.log("BOOKINGS:", JSON.stringify(bookings, null, 2))

const ids = [...new Set(bookings.map((b) => b.equipmentId).filter(Boolean))]
const valid = ids.filter((id) => ObjectId.isValid(id))
console.log("equipmentIds:", ids, "valid:", valid.length)

const equips = await db
  .collection("equipments")
  .find({ _id: { $in: valid.map((id) => new ObjectId(id)) } })
  .project({ name: 1, imageUrls: 1, photos: 1, image: 1 })
  .toArray()
console.log("EQUIPMENT MATCHES:", JSON.stringify(equips, null, 2))

const sample = await db.collection("equipments").findOne({})
console.log("SAMPLE EQUIPMENT KEYS:", Object.keys(sample || {}))

await client.close()
