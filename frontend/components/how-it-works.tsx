import { Search, Zap, Settings, DollarSign } from "lucide-react"

const steps = [
  {
    icon: <Search className="h-8 w-8" />,
    title: "Discover",
    description: "Browse through hundreds of specialized AI agents for any task or industry.",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Deploy",
    description: "Integrate agents into your workflow with just a few clicks, no coding required.",
  },
  {
    icon: <Settings className="h-8 w-8" />,
    title: "Customize",
    description: "Tailor agents to your specific needs with simple configuration options.",
  },
  {
    icon: <DollarSign className="h-8 w-8" />,
    title: "Monetize",
    description: "For developers: earn revenue by publishing your AI agents on the marketplace.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From discovery to deployment, LegionX makes working with AI agents simple and powerful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-background rounded-lg p-6 shadow-sm border transition-all duration-300 hover:shadow-md"
            >
              <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
