import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Hero from "@/components/hero"
import HowItWorks from "@/components/how-it-works"
import MarketplacePreview from "@/components/marketplace-preview"
import Benefits from "@/components/benefits"
import Demo from "@/components/demo"
import Testimonials from "@/components/testimonials"
import Pricing from "@/components/pricing"
import Faq from "@/components/faq"
import DeveloperCta from "@/components/developer-cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M12 2a5 5 0 0 1 5 5v6a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z" />
            <path d="M10 11v1a2 2 0 1 0 4 0v-1" />
            <path d="M13.8 17.3 16 22H8l2.2-4.7" />
          </svg>
          <span className="font-bold text-xl">LegionX</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#marketplace" className="text-sm hover:underline">
            Marketplace
          </a>
          <a href="#how-it-works" className="text-sm hover:underline">
            How It Works
          </a>
          <a href="#pricing" className="text-sm hover:underline">
            Pricing
          </a>
          <a href="#developers" className="text-sm hover:underline">
            For Developers
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" size="sm">
            Log In
          </Button>
          <Button size="sm">Sign Up</Button>
        </div>
      </header>

      <main>
        <Hero />
        <HowItWorks />
        <MarketplacePreview />
        <Benefits />
        <Demo />
        <Testimonials />
        <Pricing />
        <Faq />
        <DeveloperCta />
      </main>

      <Footer />
    </div>
  )
}
