import Link from "next/link"
import { Mail, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
        }}
      ></div>
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">VIDYONNATI FOUNDATION</h2>
            <p className="text-sm">A Non-Profit Organization registered under Companies Act, 2013</p>
            <div className="space-y-2">
              <h3 className="font-semibold">Legal Information</h3>
              <p className="text-sm">CIN: U80903AP2023NPL123763</p>
              <p className="text-sm">Registration Date: January 3, 2023</p>
              <p className="text-sm">Tax Exemption: Section 80G, Income Tax Act of India</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Contact Us</h3>
            <p className="text-sm">[Your address here]</p>
            <div className="flex items-center space-x-2">
              <Mail size={16} />
              <a href="mailto:[email]" className="text-sm hover:text-primary transition-colors">
                [email]
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} />
              <a href="tel:[phone number]" className="text-sm hover:text-primary transition-colors">
                [phone number]
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm hover:text-primary transition-colors">
                About Us
              </Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Stay Connected</h3>
            <p className="text-sm">Follow us on social media for updates and news about our initiatives.</p>
            {/* Add social media icons here if needed */}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">&copy; 2024 VIDYONNATI FOUNDATION. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

