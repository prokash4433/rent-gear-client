import { MongoClient, ObjectId } from "mongodb"

const client = new MongoClient(process.env.BETTER_AUTH_DB_URI)
await client.connect()
const db = client.db("rent-gear")

// Remove the booking created against the stock-less mixer.
await db.collection("bookings").deleteOne({ _id: new ObjectId("6b03fa033fce559fce35d484") })

// Find an approved equipment that actually has stock (quantity may be a string).
const equipment = await db.collection("equipments").findOne({
  _id: new ObjectId("6b01666e9c0e2f1777603421"),
})
if (!equipment || !(Number(equipment.quantity) > 0)) {
  console.log("NO EQUIPMENT WITH STOCK")
  process.exit(1)
}

const doc = {
  equipmentId: equipment._id.toString(),
  equipmentName: equipment.name,
  ownerEmail: equipment.ownerEmail ?? "",
  userEmail: "customer@gmail.com",
  startDate: "2027-06-10",
  endDate: "2027-06-12",
  quantity: 1,
  rentalType: equipment.rentalType ?? "Daily",
  periods: 3,
  pricePerPeriod: Number(equipment.rentalPrice) || 500,
  totalAmount: 1500,
  currency: "bdt",
  contactNumber: "+1 555 0100",
  deliveryAddress: "E2E test address",
  notes: "pay-booking route test",
  status: "unpaid",
  paymentStatus: "unpaid",
  createdAt: new Date(),
}

const res = await db.collection("bookings").insertOne(doc)
console.log("INSERTED:", res.insertedId.toString())
console.log("EQUIPMENT:", equipment.name, "stock:", equipment.quantity, "id:", equipment._id.toString())

await client.close()
