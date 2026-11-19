import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string);
const db = client.db('rent-gear');

export const auth = betterAuth({
          
          emailAndPassword: {
                    enabled: true,
                    // The Sign Up form promises 6+ characters, so tell better-auth the same.
                    minPasswordLength: 6,
          },
          // Extra profile fields stored for every user.
          user: {
                    additionalFields: {
                              // "customer" or "owner", chosen with the buttons in the Sign Up form.
                              role: {
                                        type: "string",
                                        required: true,
                                        defaultValue: "customer",
                                        input: true,
                              },
                    },
          },
          socialProviders: {
                    google: {
                              clientId: process.env.GOOGLE_CLIENT_ID as string,
                              clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                    },
          },
          database: mongodbAdapter(db, {
                    client,
          }),
});