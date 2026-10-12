// src/types/events.ts

export type EventCategory =
  | 'Network'
  | 'Packet'
  | 'Order'
  | 'Payment'
  | 'Server'
  | 'Security'
  | 'GPS'
  | 'Recovery';

export type EventSeverity = 'info' | 'success' | 'warning' | 'error' | 'critical';

export interface SimulationEvent {
  id: string;
  timestamp: string;
  category: EventCategory;
  severity: EventSeverity;
  source: string;
  destination?: string;
  description: string;
  orderId?: string;
  technicalDetails?: string;
}

export interface SecurityScenario {
  id: string;
  title: string;
  threatType: 'Unauthorized Role' | 'Unauthenticated Request' | 'Firewall Blocked Port Scan' | 'Valid Authorized Request';
  sourceIp: string;
  targetEndpoint: string;
  description: string;
  expectedOutcome: 'Allowed' | 'Blocked';
  securityLayer: 'TLS 1.3 / HTTPS' | 'Stateful Firewall (SPI)' | 'JWT Authentication' | 'RBAC Authorization';
  reason: string;
}

export interface ProtocolComparisonResult {
  protocol: 'TCP' | 'UDP';
  packetsSent: number;
  packetsDelivered: number;
  packetsDropped: number;
  retransmissions: number;
  acknowledgments: number;
  completionTimeMs: number;
  reliability: string;
  deliveryRatePercent: number;
  overhead: string;
}
