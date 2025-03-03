
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { getSpyOptions, getSpyOptionsByType } from '@/services/spyOptionsService';
import { SpyOption } from '@/lib/types/spyOptions';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { format } from 'date-fns';

export const OptionChain = () => {
  const [optionType, setOptionType] = useState<'CALL' | 'PUT'>('CALL');
  
  const { data: options, isLoading } = useQuery({
    queryKey: ['spyOptions', optionType],
    queryFn: () => getSpyOptionsByType(optionType),
  });

  const formatExpiryDate = (date: Date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const groupByExpiry = (options: SpyOption[]) => {
    const grouped: Record<string, SpyOption[]> = {};
    
    options?.forEach(option => {
      const expiryKey = formatExpiryDate(option.expirationDate);
      if (!grouped[expiryKey]) {
        grouped[expiryKey] = [];
      }
      grouped[expiryKey].push(option);
    });
    
    return grouped;
  };

  const groupedOptions = options ? groupByExpiry(options) : {};
  const expiryDates = Object.keys(groupedOptions);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">SPY Option Chain</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="CALL" className="space-y-4">
          <TabsList>
            <TabsTrigger value="CALL" onClick={() => setOptionType('CALL')}>Calls</TabsTrigger>
            <TabsTrigger value="PUT" onClick={() => setOptionType('PUT')}>Puts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="CALL" className="space-y-4">
            {isLoading ? (
              <div className="h-60 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              expiryDates.map(expiryDate => (
                <div key={expiryDate} className="space-y-2">
                  <h3 className="font-medium text-lg">{expiryDate}</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Strike</TableHead>
                          <TableHead>Premium</TableHead>
                          <TableHead className="hidden md:table-cell">IV</TableHead>
                          <TableHead className="hidden md:table-cell">Delta</TableHead>
                          <TableHead className="hidden lg:table-cell">Gamma</TableHead>
                          <TableHead className="hidden lg:table-cell">Theta</TableHead>
                          <TableHead className="hidden xl:table-cell">Vega</TableHead>
                          <TableHead className="hidden md:table-cell">Volume</TableHead>
                          <TableHead className="hidden md:table-cell">OI</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedOptions[expiryDate].map((option) => (
                          <TableRow key={option.id}>
                            <TableCell className="font-medium">${option.strikePrice}</TableCell>
                            <TableCell>${option.premium.toFixed(2)}</TableCell>
                            <TableCell className="hidden md:table-cell">{(option.impliedVolatility * 100).toFixed(2)}%</TableCell>
                            <TableCell className="hidden md:table-cell">{option.delta.toFixed(2)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{option.gamma.toFixed(2)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{option.theta.toFixed(2)}</TableCell>
                            <TableCell className="hidden xl:table-cell">{option.vega.toFixed(2)}</TableCell>
                            <TableCell className="hidden md:table-cell">{option.volume.toLocaleString()}</TableCell>
                            <TableCell className="hidden md:table-cell">{option.openInterest.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="PUT" className="space-y-4">
            {isLoading ? (
              <div className="h-60 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              expiryDates.map(expiryDate => (
                <div key={expiryDate} className="space-y-2">
                  <h3 className="font-medium text-lg">{expiryDate}</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Strike</TableHead>
                          <TableHead>Premium</TableHead>
                          <TableHead className="hidden md:table-cell">IV</TableHead>
                          <TableHead className="hidden md:table-cell">Delta</TableHead>
                          <TableHead className="hidden lg:table-cell">Gamma</TableHead>
                          <TableHead className="hidden lg:table-cell">Theta</TableHead>
                          <TableHead className="hidden xl:table-cell">Vega</TableHead>
                          <TableHead className="hidden md:table-cell">Volume</TableHead>
                          <TableHead className="hidden md:table-cell">OI</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedOptions[expiryDate]?.map((option) => (
                          <TableRow key={option.id}>
                            <TableCell className="font-medium">${option.strikePrice}</TableCell>
                            <TableCell>${option.premium.toFixed(2)}</TableCell>
                            <TableCell className="hidden md:table-cell">{(option.impliedVolatility * 100).toFixed(2)}%</TableCell>
                            <TableCell className="hidden md:table-cell">{option.delta.toFixed(2)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{option.gamma.toFixed(2)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{option.theta.toFixed(2)}</TableCell>
                            <TableCell className="hidden xl:table-cell">{option.vega.toFixed(2)}</TableCell>
                            <TableCell className="hidden md:table-cell">{option.volume.toLocaleString()}</TableCell>
                            <TableCell className="hidden md:table-cell">{option.openInterest.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
