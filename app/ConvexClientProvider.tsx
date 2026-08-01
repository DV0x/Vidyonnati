"use client"

import { ReactNode } from "react"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { useAuth } from "@clerk/nextjs"

// Bridges Clerk identity into Convex. ConvexProviderWithClerk pulls the JWT from
// Clerk and attaches it to every Convex request, so ctx.auth.getUserIdentity()
// resolves on the backend.
//
// Must be a Client Component: it depends on Clerk's useAuth hook.
//
// Created at module scope on purpose — one WebSocket for the app's lifetime.
// Constructing this inside the component would tear down and re-open the socket
// on every render.
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
