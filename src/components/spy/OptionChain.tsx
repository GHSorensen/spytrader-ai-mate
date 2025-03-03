// Update the imports to use the new file structure
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpyOption } from '@/lib/types/spy';  // Updated import path

interface OptionChainProps {
  options?: SpyOption[];
}

export const OptionChain: React.FC<OptionChainProps> = ({ options }) => {
  // Mock data for the option chain
  const mockOptions: SpyOption[] = [
    {
      id: '1',
      strikePrice: 450,
      expirationDate: new Date(),
      type: 'CALL',
      premium: 2.50,
      impliedVolatility: 0.15,
      openInterest: 1200,
      volume: 350,
      delta: 0.60,
      gamma: 0.05,
      theta: -0.02,
      vega: 0.08,
    },
    {
      id: '2',
      strikePrice: 445,
      expirationDate: new Date(),
      type: 'PUT',
      premium: 1.80,
      impliedVolatility: 0.12,
      openInterest: 900,
      volume: 200,
      delta: -0.40,
      gamma: 0.04,
      theta: -0.01,
      vega: 0.06,
    },
    // Add more mock options as needed
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>SPY Option Chain</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px] w-full overflow-x-auto">
          <div className="relative min-w-[600px]">
            <table className="w-full text-sm">
              <thead className="[&_th]:px-4 [&_th]:py-2 [&_th]:text-left border-b sticky top-0 bg-secondary text-secondary-foreground">
                <tr>
                  <th>Strike</th>
                  <th>Type</th>
                  <th>Premium</th>
                  <th>Implied Volatility</th>
                  <th>Open Interest</th>
                  <th>Volume</th>
                  <th>Delta</th>
                  <th>Gamma</th>
                  <th>Theta</th>
                  <th>Vega</th>
                </tr>
              </thead>
              <tbody>
                {mockOptions.map((option) => (
                  <tr key={option.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="px-4 py-2">{option.strikePrice}</td>
                    <td className="px-4 py-2">{option.type}</td>
                    <td className="px-4 py-2">{option.premium}</td>
                    <td className="px-4 py-2">{option.impliedVolatility}</td>
                    <td className="px-4 py-2">{option.openInterest}</td>
                    <td className="px-4 py-2">{option.volume}</td>
                    <td className="px-4 py-2">{option.delta}</td>
                    <td className="px-4 py-2">{option.gamma}</td>
                    <td className="px-4 py-2">{option.theta}</td>
                    <td className="px-4 py-2">{option.vega}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
