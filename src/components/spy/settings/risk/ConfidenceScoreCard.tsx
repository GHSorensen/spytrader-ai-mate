
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Percent } from 'lucide-react';
import { AITradingSettings } from '@/lib/types/spy';

interface ConfidenceScoreCardProps {
  minimumConfidenceScore: number;
  updateSettings: <K extends keyof AITradingSettings>(key: K, value: AITradingSettings[K]) => void;
}

export const ConfidenceScoreCard: React.FC<ConfidenceScoreCardProps> = ({
  minimumConfidenceScore,
  updateSettings,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          Minimum Confidence Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Slider
              value={[minimumConfidenceScore * 100]}
              min={50}
              max={95}
              step={5}
              onValueChange={(value) => updateSettings('minimumConfidenceScore', value[0] / 100)}
              className="flex-1"
            />
            <span className="w-16 text-center">{minimumConfidenceScore * 100}%</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            AI will only execute trades when confidence level meets or exceeds this threshold
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
