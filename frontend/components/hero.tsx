import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Unleash the Power of AI Agents
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Discover, deploy, and monetize specialized AI agents for any task in the world's premier AI marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              Browse Agents
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              Deploy Yours
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden border shadow-2xl">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
              <div className="p-8 backdrop-blur-sm bg-background/50 rounded-lg border shadow-lg">
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a5 5 0 0 1 5 5v6a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z" />
                      <path d="M10 11v1a2 2 0 1 0 4 0v-1" />
                      <path d="M13.8 17.3 16 22H8l2.2-4.7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">ResearchAgent</h3>
                    <p className="text-sm text-muted-foreground">Analyzing data...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 animate-pulse">
                  <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-5xl h-12 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
        </div>
      </div>
    </section>
  )
}
