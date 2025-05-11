import React from "react";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Badge } from "@heroui/badge";
import { Link } from "@heroui/link";

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'subscription' | 'ownership';
  creator: string;
  imageUrl?: string;
}

export const AgentCard = ({
  id,
  name,
  description,
  price,
  type,
  creator,
  imageUrl
}: AgentCardProps) => {
  return (
    <Card className="max-w-sm p-4">
      <div className="flex gap-3">
        {imageUrl && (
          <img
            alt={name}
            className="w-12 h-12 rounded-full"
            src={imageUrl}
          />
        )}
        <div className="flex flex-col">
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-sm text-gray-500">by {creator}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm">{description}</p>
        <div className="mt-2">
          <Badge color={type === 'subscription' ? 'primary' : 'secondary'}>
            {type === 'subscription' ? 'Subscription' : 'Ownership'}
          </Badge>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-lg font-bold">{price} ADA</p>
        <Link href={`/marketplace/agents/${id}`}>
          <Button color="primary" variant="flat">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}; 