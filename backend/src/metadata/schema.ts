// src/metadata/schema.ts
export interface AgentMetadata {
    name: string;
    description: string;
    modelVersion: string;
    usageRights: {
      type: "full" | "subscription";
      durationDays?: number;
    };
    creator: string;
  }
  