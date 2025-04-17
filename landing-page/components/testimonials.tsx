import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    quote: "LegionX has completely transformed our research process. What used to take days now takes minutes.",
    author: "Sarah Johnson",
    role: "Research Director, TechCorp",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "As a developer, I've earned more from my AI agents on LegionX than any other platform. The ecosystem is incredible.",
    author: "Michael Chen",
    role: "AI Developer",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "Our marketing team relies on LegionX daily. The copywriting agents have increased our conversion rates by 32%.",
    author: "Emma Rodriguez",
    role: "CMO, GrowthBrand",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "The customer service agents have allowed our small team to provide 24/7 support without hiring additional staff.",
    author: "David Kim",
    role: "Support Lead, StartupX",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const logos = ["TechCorp", "InnovateAI", "GrowthBrand", "StartupX", "FutureLabs"]

export default function Testimonials() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their workflows with LegionX.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background">
              <CardContent className="p-6">
                <div className="mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 inline-block text-yellow-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg mb-6">"{testimonial.quote}"</blockquote>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.author} />
                    <AvatarFallback>
                      {testimonial.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70">
          {logos.map((logo, index) => (
            <div key={index} className="text-xl font-bold tracking-tight">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
