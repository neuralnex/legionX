"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { api } from "../../services/api";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select } from "@heroui/select";
import { useAuth } from "../../contexts/AuthContext";
import { Agent } from "../../types/agent";

type AgentType = "subscription" | "ownership";

interface FormData {
  name: string;
  description: string;
  price: string;
  type: AgentType;
  imageUrl: string;
  capabilities: string;
  requirements: string;
  version: string;
}

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    description: "",
    price: "",
    type: "subscription",
    imageUrl: "",
    capabilities: "",
    requirements: "",
    version: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const agent: Omit<Agent, "id"> = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        type: formData.type,
        creator: user?.name || "",
        imageUrl: formData.imageUrl,
        metadata: {
          capabilities: formData.capabilities.split(",").map((c) => c.trim()),
          requirements: formData.requirements.split(",").map((r) => r.trim()),
          version: formData.version,
          lastUpdated: new Date().toISOString(),
        },
      };

      await api.createAgent(agent);
      router.push("/marketplace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, type: e.target.value as AgentType }));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price (ADA)
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.1"
                required
                value={formData.price}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700"
              >
                Type
              </label>
              <Select
                id="type"
                value={formData.type}
                onChange={handleTypeChange}
                className="mt-1"
              >
                <option value="subscription">Subscription</option>
                <option value="ownership">Ownership</option>
              </Select>
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Image URL
              </label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="capabilities"
                className="block text-sm font-medium text-gray-700"
              >
                Capabilities (comma-separated)
              </label>
              <textarea
                id="capabilities"
                name="capabilities"
                required
                value={formData.capabilities}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="requirements"
                className="block text-sm font-medium text-gray-700"
              >
                Requirements (comma-separated)
              </label>
              <textarea
                id="requirements"
                name="requirements"
                required
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="version"
                className="block text-sm font-medium text-gray-700"
              >
                Version
              </label>
              <Input
                id="version"
                name="version"
                type="text"
                required
                value={formData.version}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                color="primary"
                size="lg"
                isLoading={loading}
              >
                Create Listing
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
} 