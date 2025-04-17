import { Users, Code, Zap } from "lucide-react"

const benefitGroups = [
  {
    icon: <Users className="h-8 w-8" />,
    title: "For Buyers",
    benefits: [
      "Access powerful agents on demand",
      "No coding or AI expertise required",
      "Pay only for what you need",
      "Seamless integration with your tools",
    ],
  },
  {
    icon: <Code className="h-8 w-8" />,
    title: "For Developers",
    benefits: [
      "Monetize your AI creations",
      "Reach a global audience",
      "Simple publishing process",
      "Analytics and user feedback",
    ],
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "For Teams",
    benefits: [
      "Integrate AI workflows instantly",
      "Boost productivity across departments",
      "Enterprise-grade security",
      "Centralized billing and management",
    ],
  },
]

export default function Benefits() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Benefits</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AgentHub provides unique advantages for everyone in the AI ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefitGroups.map((group, index) => (
            <div
              key={index}
              className="bg-background rounded-lg p-8 shadow-sm border transition-all duration-300 hover:shadow-md"
            >
              <div className="mb-6 p-3 rounded-full bg-primary/10 w-fit">{group.icon}</div>
              <h3 className="text-2xl font-semibold mb-4">{group.title}</h3>
              <ul className="space-y-3">
                {group.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
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
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
