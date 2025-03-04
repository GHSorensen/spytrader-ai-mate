
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TradeTable from './TradeTable';
import { SpyTrade } from '@/lib/types/spy';

interface TradeCardProps {
  title: string;
  description: string;
  trades: SpyTrade[];
  isLoading: boolean;
}

const TradeCard: React.FC<TradeCardProps> = ({ title, description, trades, isLoading }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TradeTable trades={trades} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

export default TradeCard;
