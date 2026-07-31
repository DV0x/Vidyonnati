import type { Metadata } from "next"
import ProfileContent from "./ProfileContent"

// No preloadQuery here. The form reads the student through AuthContext, which
// already holds a live users.me subscription — preloading the same document a
// second time would give the page two sources for one record.

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: false },
}

export default function ProfilePage() {
  return <ProfileContent />
}
