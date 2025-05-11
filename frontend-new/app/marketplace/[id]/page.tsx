"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../../../components/ProtectedRoute";
import { api } from "../../../services/api";
import { Agent } from "../../../types/agent";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";

export default function AgentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [agent, setAgent] = React.useState<Agent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [purchasing, setPurchasing] = React.useState(false);

  React.useEffect(() => {
    const fetchAgent = async () => {
      try {
        const data = await api.getAgent(params.id);
        setAgent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch agent details");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [params.id]);

  const handlePurchase = async () => {
    if (!agent) return;

    setPurchasing(true);
    try {
      await api.createPurchase(agent.id);
      router.push("/marketplace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to purchase agent");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : agent ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-8">
              {agent.imageUrl && (
                <img
                  src={agent.imageUrl}
                  alt={agent.name}
                  className="w-48 h-48 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                <p className="text-gray-600 mb-4">by {agent.creator}</p>
                <Badge color={agent.type === "subscription" ? "primary" : "secondary"}>
                  {agent.type === "subscription" ? "Subscription" : "Ownership"}
                </Badge>
                <p className="text-2xl font-bold mt-4 mb-6">{agent.price} ADA</p>
                <Button
                  color="primary"
                  size="lg"
                  onClick={handlePurchase}
                  isLoading={purchasing}
                >
                  Purchase
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700">{agent.description}</p>
            </div>

            {agent.metadata && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Capabilities</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {agent.metadata.capabilities.map((capability, index) => (
                        <li key={index}>{capability}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Requirements</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {agent.metadata.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Version</h3>
                    <p className="text-gray-700">{agent.metadata.version}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Last Updated</h3>
                    <p className="text-gray-700">{agent.metadata.lastUpdated}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">Agent not found</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 