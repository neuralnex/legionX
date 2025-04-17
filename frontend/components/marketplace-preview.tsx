import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Star, Filter } from "lucide-react"

const agents = [
  {
    name: "ResearchAgent",
    description: "Conducts comprehensive research on any topic with academic precision",
    useCase: "Academic & Market Research",
    price: 5.99,
    rating: 4.8,
    category: "Research",
  },
  {
    name: "CopywriterPro",
    description: "Creates compelling marketing copy optimized for conversions",
    useCase: "Marketing & Sales",
    price: 7.99,
    rating: 4.7,
    category: "Content",
  },
  {
    name: "CodeAssistant",
    description: "Helps debug, refactor, and optimize your code across languages",
    useCase: "Software Development",
    price: 9.99,
    rating: 4.9,
    category: "Development",
  },
  {
    name: "CustomerServiceBot",
    description: "Handles customer inquiries with empathy and precision",
    useCase: "Customer Support",
    price: 0,
    rating: 4.5,
    category: "Support",
  },
  {
    name: "DataAnalyzer",
    description: "Transforms raw data into actionable insights and visualizations",
    useCase: "Business Intelligence",
    price: 8.99,
    rating: 4.6,
    category: "Analytics",
  },
  {
    name: "SchedulerAgent",
    description: "Manages your calendar and optimizes your time automatically",
    useCase: "Productivity",
    price: 4.99,
    rating: 4.4,
    category: "Productivity",
  },
]

export default function MarketplacePreview() {
  return (
    <section id="marketplace" className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Marketplace Preview</h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Explore our growing collection of specialized AI agents ready to transform your workflow.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Category
            </Button>
            <Button variant="outline" size="sm">
              Price
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.useCase}</p>
                  </div>
                  <Badge variant={agent.price === 0 ? "secondary" : "default"}>
                    {agent.price === 0 ? "Free" : `$${agent.price.toFixed(2)}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{agent.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{agent.rating}</span>
                </div>
                <Button size="sm">Deploy</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg">View All Agents</Button>
        </div>
      </div>
    </section>
  )
}
