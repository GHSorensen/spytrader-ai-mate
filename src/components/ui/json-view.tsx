
import React from 'react';

interface JsonViewProps {
  data: any;
  collapsed?: boolean;
}

/**
 * A simple component to display JSON data in a formatted way
 */
export const JsonView: React.FC<JsonViewProps> = ({ data, collapsed = false }) => {
  return (
    <pre className="bg-slate-50 p-4 rounded-md overflow-auto max-h-[400px] text-xs">
      <code>
        {JSON.stringify(data, null, 2)}
      </code>
    </pre>
  );
};
