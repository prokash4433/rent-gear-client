import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string);
const db = client.db('rent-gear');

export const auth = betterAuth({
          /**
           * Origins allowed to call the auth API (CSRF origin check).
           * better-auth always trusts `baseURL` (BETTER_AUTH_URL — the
           * deployed site); these extras keep *local* development working
           * when BETTER_AUTH_URL points at production.
           */
          trustedOrigins: [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
          ],
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
                                        type: ['customer', 'owner', 'admin'],
                                        required: true,
                                        defaultValue: "customer",
                                        input: true,
                              },
                              // Contact details edited on the profile pages and
                              // saved through authClient.updateUser().
                              phone: {
                                        type: "string",
                                        required: false,
                                        defaultValue: "",
                                        input: true,
                              },
                              address: {
                                        type: "string",
                                        required: false,
                                        defaultValue: "",
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
          /**
           * Role hardening — `role` is a client-visible input (the Sign Up
           * form's picker), which would otherwise let a crafted request
           * create or promote itself to "admin":
           * - create: only "customer" or "owner" can ever be signed up;
           * - update: better-auth *merges* hook data over the payload, so a
           *   role key cannot be deleted — instead the whole update is
           *   refused when one is present. No legitimate flow sends `role`
           *   on update (the profile forms only send name/image/phone/
           *   address), and roles actually change only through the admin
           *   server action, which writes to MongoDB directly and never
           *   runs this hook.
           */
          databaseHooks: {
                    user: {
                              create: {
                                        before: async (user) => ({
                                                  data: {
                                                            ...user,
                                                            role: user.role === "owner" ? "owner" : "customer",
                                                  },
                                        }),
                              },
                              update: {
                                        before: async (user) => {
                                                  if (user && typeof user === "object" && "role" in user) {
                                                            return false
                                                  }
                                                  return
                                        },
                              },
                    },
          },
          plugins: [
                    /**
                     * JWT plugin — signs an EdDSA (Ed25519) token for the
                     * signed-in session. The Express API verifies it in
                     * `middleware/verifyToken.js` using the public key from
                     * the `jwks` collection, so both apps share one database.
                     */
                    jwt({
                              jwt: {
                                        // Must match JWT_ISSUER / JWT_AUDIENCE on the Express side.
                                        issuer: "rent-gear",
                                        audience: "rent-gear-api",
                                        // Long enough for a browsing session, short enough to limit replay.
                                        expirationTime: "1 hour",
                                        // Minimal payload: identity + role only (no profile or secret data).
                                        definePayload: ({ user }) => ({
                                                  role: user.role ?? "customer",
                                                  email: user.email,
                                                  name: user.name,
                                        }),
                              },
                    }),
          ],
});