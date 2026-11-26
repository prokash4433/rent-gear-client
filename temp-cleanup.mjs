// Temporary: remove sessions/accounts whose user no longer exists (test leftovers).
import { MongoClient } from "mongodb"

const uri =
  "mongodb://rentAdmin:1zBgfHRgmsfjbHdQ@ac-vwspxhc-shard-00-00.oc3n5pn.mongodb.net:27017,ac-vwspxhc-shard-00-01.oc3n5pn.mongodb.net:27017,ac-vwspxhc-shard-00-02.oc3n5pn.mongodb.net:27017/?ssl=true&replicaSet=atlas-282ki6-shard-0&authSource=admin"

const client = new MongoClient(uri)
await client.connect()
const db = client.db("rent-gear")

const ids = (await db.collection("user").find({}).project({ _id: 1 }).toArray()).map((u) => u._id)
const strs = ids.map(String)
const orphan = (field) => ({ $or: [{ [field]: { $nin: ids } }, { [field]: { $nin: strs } }] })

const sessions = await db.collection("session").deleteMany(orphan("userId"))
const accounts = await db.collection("account").deleteMany(orphan("userId"))
console.log("orphan sessions removed:", sessions.deletedCount, "| orphan accounts removed:", accounts.deletedCount)

await client.close()
