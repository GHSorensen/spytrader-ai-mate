
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { saveSchawbCredentials, getSchwabCredentials } from '@/services/dataProviders/schwab/utils/credentialUtils';
import { SchwabService } from '@/services/dataProviders/schwab/SchwabService';
import { DataProviderConfig } from '@/lib/types/spy/dataProvider';

// Form validation schema
const formSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  secretKey: z.string().min(1, 'Secret Key is required'),
  callbackUrl: z.string().url('Must be a valid URL').optional(),
  paperTrading: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function SchwabCredentialsForm() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(!!getSchwabCredentials());
  
  // Initialize form with saved values if available
  const savedConfig = getSchwabCredentials();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: savedConfig?.apiKey || '',
      secretKey: savedConfig?.secretKey || '',
      callbackUrl: savedConfig?.callbackUrl || window.location.origin + '/auth/schwab',
      paperTrading: savedConfig?.paperTrading !== false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsConnecting(true);
      
      // Save credentials
      saveSchawbCredentials({
        apiKey: values.apiKey,
        secretKey: values.secretKey,
        callbackUrl: values.callbackUrl,
        paperTrading: values.paperTrading,
      });
      
      // Test connection
      const config: DataProviderConfig = {
        type: 'schwab',
        apiKey: values.apiKey,
        secretKey: values.secretKey,
        callbackUrl: values.callbackUrl,
        paperTrading: values.paperTrading,
      };
      
      const schwabService = new SchwabService(config);
      
      // Get OAuth URL
      const authUrl = schwabService.getAuthorizationUrl();
      
      toast.success('Credentials saved successfully', {
        description: 'You can now proceed to connect to Schwab'
      });
      
      setIsConfigured(true);
    } catch (error) {
      console.error('Error saving Schwab credentials:', error);
      toast.error('Failed to save credentials', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle>Schwab API Credentials</CardTitle>
        <CardDescription>
          Configure your Schwab API connection details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Schwab API Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Schwab API Key from the Developer Portal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your Schwab Secret Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your Schwab Secret Key from the Developer Portal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="callbackUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OAuth Callback URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-app.com/auth/schwab" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must match the callback URL registered in Schwab Developer Portal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paperTrading"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Paper Trading</FormLabel>
                    <FormDescription>
                      Enable to use Schwab's paper trading environment
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isConnecting}>
                {isConnecting ? 'Saving...' : (isConfigured ? 'Update Credentials' : 'Save Credentials')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/50 text-sm text-muted-foreground">
        <span>Keep your API keys secure and never share them</span>
      </CardFooter>
    </Card>
  );
}
