import { Mail, Phone } from "lucide-react"

export default function TopNavigation() {
  return (
    <div className="bg-gray-100 text-gray-900 py-1.5">
      <div className="container mx-auto flex flex-wrap justify-center lg:justify-between items-center px-4">
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-primary" />
            <span>hello@vidyonnatifoundation.org</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-primary" />
            <span>+91 9440-045-144</span>
          </div>
        </div>
      </div>
    </div>
  )
}

