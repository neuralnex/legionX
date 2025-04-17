import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is an AI agent?",
    answer:
      "An AI agent is a specialized AI system designed to perform specific tasks autonomously. Unlike general AI models, agents are optimized for particular use cases like research, content creation, customer service, or data analysis.",
  },
  {
    question: "How do I integrate an agent with my existing tools?",
    answer:
      "LegionX provides simple API endpoints and integration guides for all major platforms. Most agents can be integrated via API, webhooks, or our no-code connectors for tools like Zapier, Make, and Microsoft Power Automate.",
  },
  {
    question: "Can I build my own agent and sell it on LegionX?",
    answer:
      "Yes! LegionX is designed as a two-sided marketplace. Developers can create, publish, and monetize their AI agents. We provide comprehensive documentation, development tools, and a simple submission process to help you get started.",
  },
  {
    question: "How does pricing work for agent usage?",
    answer:
      "Each plan includes a specific number of agent calls per month. An agent call is counted each time you invoke an agent to perform a task. Different agents may consume different numbers of calls based on their complexity and resource requirements.",
  },
  {
    question: "Is my data secure when using agents?",
    answer:
      "Yes, we take data security very seriously. All data is encrypted in transit and at rest. We do not use your data to train our models unless you explicitly opt in. Enterprise plans include additional security features like private agents, VPC deployment, and custom data retention policies.",
  },
  {
    question: "Do I need technical knowledge to use LegionX?",
    answer:
      "No technical knowledge is required for most use cases. Our platform is designed to be user-friendly with a simple interface for discovering, deploying, and using agents. For more advanced integrations, basic API knowledge may be helpful, but we provide detailed guides for all skill levels.",
  },
]

export default function Faq() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about AgentHub and AI agents.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="#" className="text-primary hover:underline">
              Contact our support team
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
