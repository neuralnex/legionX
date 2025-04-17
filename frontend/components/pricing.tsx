import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for trying out AgentHub",
    features: ["Access to 10+ free agents", "50 agent calls per month", "Basic support", "Community access"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: 19,
    description: "For professionals and small teams",
    features: [
      "Access to all 100+ agents",
      "1,000 agent calls per month",
      "Priority support",
      "API access",
      "Custom agent configuration",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For organizations with advanced needs",
    features: [
      "Unlimited agent access",
      "10,000 agent calls per month",
      "24/7 dedicated support",
      "Advanced security features",
      "Custom agent development",
      "Team management",
      "Usage analytics",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you or your team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`flex flex-col ${plan.popular ? "border-primary shadow-lg relative" : ""}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-8">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            All plans include a 14-day money-back guarantee. Need a custom plan?{" "}
            <a href="#" className="text-primary hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
