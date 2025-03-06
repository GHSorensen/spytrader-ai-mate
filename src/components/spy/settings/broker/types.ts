
/**
 * Props for broker tab content components
 */
export interface BrokerTabContentProps {
  isConnecting?: boolean;
  brokerStatus?: string;
  onConnect?: () => Promise<boolean>;
  onDisconnect?: () => Promise<boolean>;
}
