
import React from "react";
import { Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const NoBrokerTabContent: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
          <Server className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">No Broker Connection</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Without a broker connection, you'll need to execute trades manually
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
