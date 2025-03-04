
export interface PerformanceMetrics {
  ttfb: number;
  fcp: number;
  lcp: number | null;
  cls: number | null;
  fid: number | null;
  inp: number | null;
  ttl: number | null; // Time to Load
  resourceCount: number;
  jsHeapSize: number | null;
  cacheHits: number;
  cacheMisses: number;
  apiLatency: Record<string, number>;
}

export interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData?: boolean;
}

export interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}
