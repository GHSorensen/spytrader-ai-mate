
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { IBKRAccount } from '@/lib/types/ibkr';
import { getIBKRAccounts } from '@/services/ibkrService';

interface UseIBKRAccountsReturn {
  accounts: IBKRAccount[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
}

export const useIBKRAccounts = (): UseIBKRAccountsReturn => {
  const { toast } = useToast();
  
  const [accounts, setAccounts] = useState<IBKRAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const accountsData = await getIBKRAccounts();
      setAccounts(accountsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts');
      toast({
        title: 'Error',
        description: `Failed to fetch IBKR accounts: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts
  };
};
