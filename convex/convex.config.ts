import { defineApp } from "convex/server"
import rateLimiter from "@convex-dev/rate-limiter/convex.config"

// The app's component mounts.
//
// This file did not exist before rate limiting — the rate limiter is the
// project's first Convex component. Creating it is what makes the generated
// `components` object appear in convex/_generated/api, which is how app code
// reaches a component's functions.
//
// A component owns its own tables and functions. They are invisible to
// convex/schema.ts, they do not appear in the dashboard's data browser under
// this app's tables, and no client can call them — the app's own queries and
// mutations wrap them, and that is where authentication and authorization
// belong. Convex has no RLS, and a component boundary does not add any.
//
// The property that makes the rate limiter correct here: a component's reads
// and writes join the CALLING mutation's transaction. Consuming a token and
// inserting the row commit or roll back together. See convex/lib/rateLimits.ts
// for what that buys and the one case where it cuts the other way.
const app = defineApp()
app.use(rateLimiter)

export default app
