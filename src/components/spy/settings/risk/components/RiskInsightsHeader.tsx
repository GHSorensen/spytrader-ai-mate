
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LightbulbIcon } from 'lucide-react';

interface RiskInsightsHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const RiskInsightsHeader: React.FC<RiskInsightsHeaderProps> = ({
  title,
  description,
  icon = <LightbulbIcon className="h-5 w-5 text-primary" />
}) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
      <CardDescription>
        {description}
      </CardDescription>
    </CardHeader>
  );
};
