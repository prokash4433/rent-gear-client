import { MongoClient, ObjectId } from "mongodb"

const client = new MongoClient(process.env.BETTER_AUTH_DB_URI)
await client.connect()
const db = client.db("rent-gear")

await db.collection("bookings").deleteOne({ _id: new ObjectId("6b03fbbfee022daf69748b4c") })
console.log("Cancelled test booking removed")

const u = await db.collection("user").findOne({ email: "customer@gmail.com" })
console.log("USER:", u.name, "| role before:", u.role)
await db
  .collection("user")
  .updateOne({ email: "customer@gmail.com" }, { $set: { role: "admin", updatedAt: new Date() } })
console.log("PROMOTED customer@gmail.com -> admin")

// Throwaway user that the Manage User page will be tested against.
const existing = await db.collection("user").findOne({ email: "manage-test@example.com" })
if (!existing) {
  const res = await db.collection("user").insertOne({
    name: "Manage Test",
    email: "manage-test@example.com",
    role: "customer",
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  console.log("TEST USER inserted:", res.insertedId.toString())
} else {
  console.log("TEST USER already exists:", existing._id.toString())
}

await client.close()
