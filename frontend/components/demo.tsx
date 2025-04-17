import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export default function Demo() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See AgentHub in Action</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch how our AI agents can transform your workflow in minutes.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
          <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <Play className="h-5 w-5 fill-current" />
              Watch Demo
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div>
              <h3 className="font-medium">ResearchAgent Demo</h3>
              <p className="text-sm opacity-80">See how it analyzes complex topics in seconds</p>
            </div>
            <div className="text-sm bg-black/40 px-2 py-1 rounded">2:45</div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Want to see more? Check out our{" "}
            <a href="#" className="text-primary hover:underline">
              full demo library
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
