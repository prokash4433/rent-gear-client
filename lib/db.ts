import 'server-only'

import { MongoClient } from 'mongodb'

/**
 * Direct MongoDB connection used by the payment API routes
 * (checkout + payment success). Equipment data stays on the Express API.
 * Same database that better-auth uses.
 */
const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string)

export const db = client.db('rent-gear')
