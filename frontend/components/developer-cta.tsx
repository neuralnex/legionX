import { Button } from "@/components/ui/button"
import { Code, ExternalLink } from "lucide-react"

export default function DeveloperCta() {
  return (
    <section id="developers" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-xl p-8 md:p-12 border shadow-lg">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Build and Sell Agents Today</h2>
              <p className="text-xl mb-6">
                Join our developer community and monetize your AI expertise by creating specialized agents.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary shrink-0 mt-0.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Simple development framework</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary shrink-0 mt-0.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Transparent revenue sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary shrink-0 mt-0.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Built-in distribution to thousands of users</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Code className="h-5 w-5" />
                  Developer Portal
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <ExternalLink className="h-5 w-5" />
                  View Documentation
                </Button>
              </div>
            </div>
            <div className="w-full md:w-1/3 bg-background rounded-lg p-6 border shadow-md">
              <div className="text-sm font-mono mb-4 text-muted-foreground">agent.js</div>
              <pre className="text-sm overflow-x-auto p-2 bg-muted rounded">
                <code className="text-xs md:text-sm">
                  {`export default {
  name: "MyAgent",
  description: "...",
  async process(input) {
    // Your agent logic
    return {
      result: "..."
    };
  }
}`}
                </code>
              </pre>
              <div className="mt-4 text-center">
                <span className="text-sm text-muted-foreground">It's that simple to get started!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
