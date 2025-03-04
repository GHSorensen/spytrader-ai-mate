
import React from 'react';
import { CheckCircle, AlertCircle, Loader2, MinusCircle } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  let statusColor = 'bg-gray-100 text-gray-600';
  let statusText = 'Not Connected';
  let StatusIcon = MinusCircle;
  
  switch (status) {
    case 'connected':
      statusColor = 'bg-green-100 text-green-700';
      statusText = 'Connected';
      StatusIcon = CheckCircle;
      break;
    case 'connecting':
      statusColor = 'bg-blue-100 text-blue-700';
      statusText = 'Connecting...';
      StatusIcon = Loader2;
      break;
    case 'error':
      statusColor = 'bg-red-100 text-red-700';
      statusText = 'Connection Error';
      StatusIcon = AlertCircle;
      break;
    case 'disconnected':
    default:
      statusColor = 'bg-gray-100 text-gray-600';
      statusText = 'Not Connected';
      StatusIcon = MinusCircle;
  }
  
  return (
    <div className={`px-3 py-1.5 rounded-full flex items-center ${statusColor}`}>
      <StatusIcon className={`h-4 w-4 mr-1.5 ${status === 'connecting' ? 'animate-spin' : ''}`} />
      <span className="text-sm font-medium">{statusText}</span>
    </div>
  );
};

export default ConnectionStatus;
