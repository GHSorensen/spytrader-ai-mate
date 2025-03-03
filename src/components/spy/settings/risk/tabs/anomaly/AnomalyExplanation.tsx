
import React from 'react';

export const AnomalyExplanation: React.FC = () => {
  return (
    <div className="bg-muted/20 border rounded-md p-4">
      <h3 className="text-sm font-medium mb-2">About Statistical Anomaly Detection</h3>
      <p className="text-sm text-muted-foreground">
        This module uses advanced statistical methods to identify unusual market behavior that may indicate trading opportunities.
        It analyzes price movements, volatility, volume, and option market data to detect patterns that deviate from normal behavior.
      </p>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <h4 className="text-xs font-medium mb-1">Detection Methods</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>Z-score analysis</li>
            <li>Bollinger bands</li>
            <li>Moving averages</li>
            <li>Correlation breaks</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-medium mb-1">Anomaly Types</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>Price spikes/drops</li>
            <li>Volume surges</li>
            <li>Volatility explosions</li>
            <li>Option skew changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
