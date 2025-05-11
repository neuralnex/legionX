"use client";

import React from "react";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { api } from "../../services/api";
import { Agent } from "../../types/agent";
import { AgentCard } from "../../components/marketplace/AgentCard";

export default function MyAgentsPage() {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const purchases = await api.getPurchases();
        // Assuming the API returns an array of purchases with agent details
        setAgents(purchases.map((purchase: any) => purchase.agent));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch purchased agents");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Agents</h1>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} {...agent} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You haven't purchased any agents yet.</p>
            <a
              href="/marketplace"
              className="text-primary hover:text-primary-600 font-medium"
            >
              Browse the marketplace
            </a>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
} 